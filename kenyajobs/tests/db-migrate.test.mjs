import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const run = (env, ...args) => {
  const clean = { PATH: process.env.PATH, HOME: process.env.HOME };
  const r = spawnSync(process.execPath, ["scripts/db-migrate.mjs", ...args], { cwd: new URL("..", import.meta.url).pathname, env: { ...clean, ...env }, encoding: "utf8", timeout: 60_000 });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
};
const PROD = { VERCEL: "1", VERCEL_ENV: "production" };

test("on-deploy: skipped for local builds, previews, and when switched off", () => {
  for (const [env, why] of [[{ DATABASE_URL: "postgresql://u:p@h.invalid/d" }, /not a Vercel build/], [{ VERCEL: "1", VERCEL_ENV: "preview", DATABASE_URL: "postgresql://u:p@h.invalid/d" }, /only production/], [{ ...PROD, SKIP_DB_MIGRATIONS: "true", DATABASE_URL: "postgresql://u:p@h.invalid/d" }, /SKIP_DB_MIGRATIONS/]]) {
    const r = run(env, "--on-deploy");
    assert.equal(r.code, 0); assert.match(r.out, why);
  }
});

test("on-deploy: a missing, malformed or unreachable database warns but never fails the build, and never prints the password", () => {
  for (const url of [undefined, "postgresql://postgres:pa#ss@host/db", "postgresql://postgres.x:UNIQUE-SECRET-PW@db.unreachable.invalid:5432/postgres"]) {
    const r = run({ ...PROD, ...(url ? { DATABASE_URL: url } : {}) }, "--on-deploy");
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /migrations NOT applied/);
    assert.ok(!r.out.includes("UNIQUE-SECRET-PW") && !r.out.includes("pa#ss"));
  }
});

test("the explicit (non --on-deploy) runner still fails loudly", () => {
  assert.equal(run({}, "--status").code, 1);
  assert.equal(run({ DATABASE_URL: "postgresql://postgres:x@db.unreachable.invalid:5432/postgres" }).code, 1);
});
