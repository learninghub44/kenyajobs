// Integration tests for /api/admin/{job-submissions,listings,posting-links}.
// Requires a production build first (`npm run build`). The database-backed
// cases need TEST_DATABASE_URL pointing at a database that has had the
// migrations applied (`DATABASE_URL=... npm run db:migrate`); without it they
// are reported as skipped, not passed.
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";

const ROUTES = ["job-submissions", "listings", "posting-links"];
const built = fs.existsSync(new URL("../.next/BUILD_ID", import.meta.url));
const TEST_DB = process.env.TEST_DATABASE_URL;

async function freePort() {
  return new Promise((resolve) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); }); });
}
async function startServer(env) {
  const port = await freePort();
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    cwd: new URL("..", import.meta.url).pathname,
    env: { ...process.env, DATABASE_URL: "", POSTGRES_URL: "", POSTGRES_URL_NON_POOLING: "", ADMIN_PASSWORD: "test-admin-password", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d)); child.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 60 && !/Ready in/.test(log); i++) await new Promise((r) => setTimeout(r, 250));
  const base = `http://127.0.0.1:${port}`;
  const login = await fetch(base + "/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "test-admin-password" }) });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  return { base, cookie, logs: () => log, stop: () => child.kill() };
}

for (const [label, env, expected] of [
  ["unreachable database host", { DATABASE_URL: "postgresql://postgres.x:UNIQUE-SECRET-PW@db.unreachable.invalid:5432/postgres" }, { status: 503, code: "DB_UNREACHABLE" }],
  ["missing DATABASE_URL", {}, { status: 503, code: "DB_NOT_CONFIGURED" }],
]) {
  test(`admin routes: ${label} -> safe ${expected.status} JSON, unauthenticated stays 401`, { skip: !built && "run `npm run build` first" }, async () => {
    const srv = await startServer(env);
    try {
      for (const route of ROUTES) {
        const anon = await fetch(`${srv.base}/api/admin/${route}`);
        assert.equal(anon.status, 401, `${route} without session`);
        const res = await fetch(`${srv.base}/api/admin/${route}`, { headers: { cookie: srv.cookie } });
        const body = await res.json();
        assert.equal(res.status, expected.status, route);
        assert.equal(body.code, expected.code, route);
        assert.equal(typeof body.error, "string");
        assert.ok(!JSON.stringify(body).includes("UNIQUE-SECRET-PW") && !JSON.stringify(body).includes("unreachable.invalid"));
      }
      assert.ok(!srv.logs().includes("UNIQUE-SECRET-PW"), "password must never be logged");
      assert.match(srv.logs(), new RegExp(`\\[db-error\\].*${expected.code}`));
    } finally { srv.stop(); }
  });
}

test("admin routes against a migrated database: 401 without session, 200 + array with session", { skip: (!built && "run `npm run build` first") || (!TEST_DB && "TEST_DATABASE_URL not set (database integration NOT run)") }, async () => {
  const srv = await startServer({ DATABASE_URL: TEST_DB });
  try {
    for (const route of ROUTES) {
      assert.equal((await fetch(`${srv.base}/api/admin/${route}`)).status, 401, `${route} anonymous`);
      assert.equal((await fetch(`${srv.base}/api/admin/${route}`, { headers: { cookie: "jw_admin_session=9999999999999.forged" } })).status, 401, `${route} forged cookie`);
      const res = await fetch(`${srv.base}/api/admin/${route}`, { headers: { cookie: srv.cookie } });
      assert.equal(res.status, 200, `${route} authenticated`);
      assert.ok(Array.isArray(await res.json()), `${route} returns an array`);
    }
    assert.equal((await fetch(`${srv.base}/api/admin/job-submissions`, { method: "DELETE", headers: { cookie: srv.cookie, "content-type": "application/json" }, body: JSON.stringify({ id: "abc" }) })).status, 400);
    assert.equal((await fetch(`${srv.base}/api/admin/posting-links`, { method: "DELETE", headers: { cookie: srv.cookie, "content-type": "application/json" }, body: "{}" })).status, 400);
  } finally { srv.stop(); }
});
