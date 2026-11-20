#!/usr/bin/env node
// Applies the committed SQL files in supabase/migrations to the database named
// by DATABASE_URL (Supabase Session pooler string), in filename order.
//
//   npm run db:migrate                    apply pending migrations
//   node scripts/db-migrate.mjs --status  list applied / pending, change nothing
//   node scripts/db-migrate.mjs --continue-on-error
//                                         keep going after a failing file (exit 1 at the end)
//   node scripts/db-migrate.mjs --if-enabled
//                                         strict build step: do nothing unless
//                                         RUN_DB_MIGRATIONS=true (production builds only)
//   node scripts/db-migrate.mjs --on-deploy
//                                         what `vercel-build` runs: migrate on Vercel
//                                         PRODUCTION builds only (skipped for previews and
//                                         local builds, or when SKIP_DB_MIGRATIONS=true).
//                                         Never blocks a deploy: connection, config or
//                                         migration problems are printed loudly and the
//                                         build continues (the app reports a missing
//                                         schema itself as 503 DB_SCHEMA_OUTDATED).
//
// Safety: one session-level advisory lock so concurrent runs cannot interleave;
// applied versions are recorded in public.app_migrations with a checksum, and an
// applied file is never re-run (a changed checksum only warns). Migration files
// must be idempotent, and each file runs in its own transaction. The database
// password / full connection string is never printed.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { DatabaseConfigError, readConnectionString, parseConnection, buildClientConfig, isDirectSupabaseHost } from "../lib/dbConfig.mjs";

const args = new Set(process.argv.slice(2));
const tolerant = args.has("--on-deploy");
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase", "migrations");
const LOCK_KEY = 7_426_100_117; // arbitrary app-specific advisory lock id
// 20261117000100 aborts when Supabase's optional rls_auto_enable() helper does not
// exist. 20261117000200 re-applies everything it does, guarded, so once the later
// file is recorded the earlier one is never retried (and never warns on deploys).
const SUPERSEDED = { "20261117000100_lock_public_data_api": "20261117000200_enforce_rls_and_data_api_lock" };

function redact(text, source) {
  let out = String(text ?? "");
  if (source?.value) out = out.split(source.value).join("***");
  try { const pw = new URL(source.value).password; if (pw && pw.length >= 4) out = out.split(pw).join("***").split(decodeURIComponent(pw)).join("***"); } catch {}
  return out.replace(/postgres(?:ql)?:\/\/[^\s'"]+/gi, "postgres://***");
}

async function main() {
  if (args.has("--if-enabled")) {
    if (process.env.RUN_DB_MIGRATIONS !== "true") { console.log("[db:migrate] skipped (set RUN_DB_MIGRATIONS=true to run migrations during the build)."); return 0; }
    if (process.env.VERCEL && process.env.VERCEL_ENV !== "production") { console.log(`[db:migrate] skipped (VERCEL_ENV=${process.env.VERCEL_ENV}; only production builds migrate).`); return 0; }
  }
  if (tolerant) {
    if (process.env.SKIP_DB_MIGRATIONS === "true") { console.log("[db:migrate] skipped (SKIP_DB_MIGRATIONS=true)."); return 0; }
    if (!process.env.VERCEL) { console.log("[db:migrate] skipped (not a Vercel build)."); return 0; }
    if (process.env.VERCEL_ENV !== "production") { console.log(`[db:migrate] skipped (VERCEL_ENV=${process.env.VERCEL_ENV}; only production builds migrate).`); return 0; }
  }
  const source = readConnectionString();
  if (!source) throw new DatabaseConfigError("DB_NOT_CONFIGURED", "DATABASE_URL is not set. Use the Supabase Session pooler connection string.");
  const url = parseConnection(source);
  if (isDirectSupabaseHost(url.hostname)) console.warn(`[db:migrate] WARNING: ${source.name} points at the direct Supabase host (${url.hostname}), which is IPv6-only. From an IPv4 network use the Session pooler string.`);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const client = new pg.Client({ ...buildClientConfig(url), connectionTimeoutMillis: 15_000 });
  client.on("error", (e) => console.error("[db:migrate] connection error:", redact(e.message, source)));
  try {
    await client.connect();
    console.log(`[db:migrate] connected to ${url.hostname} as ${decodeURIComponent(url.username)} (${files.length} migration file(s) found)`);
    await client.query("SET lock_timeout = '60s'");
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);

    await client.query(`CREATE TABLE IF NOT EXISTS public.app_migrations (
      version TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    // Same lock-down as every other application table.
    await client.query("ALTER TABLE public.app_migrations ENABLE ROW LEVEL SECURITY");
    await client.query(`DO $$ DECLARE r text; BEGIN
      FOREACH r IN ARRAY ARRAY['PUBLIC','anon','authenticated'] LOOP
        IF r = 'PUBLIC' OR EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
          EXECUTE format('REVOKE ALL ON TABLE public.app_migrations FROM %s', CASE WHEN r='PUBLIC' THEN 'PUBLIC' ELSE quote_ident(r) END);
        END IF; END LOOP; END $$`);

    const applied = new Map((await client.query("SELECT version, checksum FROM public.app_migrations")).rows.map((r) => [r.version, r.checksum]));
    let failed = 0, ran = 0;
    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      if (!applied.has(version) && SUPERSEDED[version] && applied.has(SUPERSEDED[version])) {
        console.log(`  superseded ${version} (covered by ${SUPERSEDED[version]})`);
        continue;
      }
      if (applied.has(version)) {
        const note = applied.get(version) !== checksum ? "  (file changed since it was applied; not re-run)" : "";
        console.log(`  applied  ${version}${note}`);
        continue;
      }
      if (args.has("--status")) { console.log(`  PENDING  ${version}`); continue; }
      process.stdout.write(`  applying ${version} ... `);
      try {
        await client.query(/^\s*BEGIN\b/im.test(sql) ? sql : `BEGIN;\n${sql}\nCOMMIT;`);
        await client.query("INSERT INTO public.app_migrations(version, checksum) VALUES($1,$2) ON CONFLICT (version) DO UPDATE SET checksum = EXCLUDED.checksum", [version, checksum]);
        console.log("ok"); ran++;
      } catch (error) {
        try { await client.query("ROLLBACK"); } catch {}
        console.log("FAILED");
        console.error(`[db:migrate] ${version}: ${redact(error.message, source)}${error.position ? ` (at character ${error.position})` : ""}`);
        failed++;
        if (!tolerant && !args.has("--continue-on-error")) break;
      }
    }
    console.log(failed ? `[db:migrate] finished with ${failed} failure(s).` : `[db:migrate] done (${ran} applied this run).`);
    if (failed && tolerant) console.error(`[db:migrate] WARNING: ${failed} migration(s) failed but the deploy continues. Run "npm run db:migrate" or fix the error above; until then the app may report DB_SCHEMA_OUTDATED.`);
    return failed && !tolerant ? 1 : 0;
  } finally {
    try { await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]); } catch {}
    await client.end().catch(() => {});
  }
}

main().then((code) => process.exit(code), (error) => {
  const code = error?.code ? ` [${error.code}]` : "";
  console.error(`[db:migrate] ${tolerant ? "WARNING, migrations NOT applied (deploy continues): " : ""}${error?.name || "Error"}${code}: ${redact(error?.message, readConnectionString())}`);
  if (tolerant) console.error("[db:migrate] Fix DATABASE_URL (Supabase Session pooler string) and redeploy, or run `npm run db:migrate` yourself.");
  process.exit(tolerant ? 0 : 1);
});
