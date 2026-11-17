import { Pool } from "pg";
import { DatabaseConfigError, DatabaseSchemaError, logDatabaseError, redactSecrets } from "@/lib/dbErrors";
import { readConnectionString, parseConnection, buildClientConfig, isDirectSupabaseHost } from "@/lib/dbConfig.mjs";

// Connection parsing/SSL rules live in lib/dbConfig.mjs (shared with the
// migration runner). See that file for why DATABASE_URL must be the Supabase
// Session pooler string on Vercel.

function poolMax() {
  const n = Number.parseInt(process.env.DATABASE_POOL_MAX || "", 10);
  // Supabase's Session Pooler has a small per-user client cap (15 on this
  // project). Vercel creates separate serverless instances, each with its own
  // pg Pool, so a multi-connection pool per instance exhausts that cap quickly.
  // Default to one connection per warm instance; allow an explicit maximum of
  // two only for deployments using a higher-capacity Transaction Pooler.
  return Number.isInteger(n) && n >= 1 && n <= 2 ? n : 1;
}

function buildPoolConfig(url) {
  return {
    ...buildClientConfig(url),
    max: poolMax(),
    idleTimeoutMillis: 5_000,       // release scarce Session Pooler clients quickly
    connectionTimeoutMillis: 4_000, // fail fast when the pooler has no free client
    allowExitOnIdle: true,
    maxUses: 750, // recycle clients periodically instead of holding scarce sessions indefinitely
  };
}

const warned = new Set();
function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn("[db] " + message);
}

// The pool is cached on globalThis so Next.js dev reloads don't leak pools, and
// is rebuilt if the connection string changes. A failed connection never poisons
// it: pg opens a fresh connection on the next call.
function getPool() {
  const source = readConnectionString();
  if (!source) {
    throw new DatabaseConfigError("DB_NOT_CONFIGURED", "No database connection string found. Set DATABASE_URL to the Supabase Session pooler connection string.");
  }
  const cached = globalThis.__jobsHubPool;
  if (cached && cached.key === source.value) return cached.pool;

  const url = parseConnection(source);
  if (isDirectSupabaseHost(url.hostname)) {
    warnOnce("direct-host", `${source.name} uses the direct Supabase host (${url.hostname}), which is IPv6-only and unreachable from Vercel. Use the Session pooler string (host ending in pooler.supabase.com, user postgres.<project-ref>).`);
  }
  if (source.name === "POSTGRES_URL_NON_POOLING") {
    warnOnce("non-pooling", "Falling back to POSTGRES_URL_NON_POOLING (a direct, IPv6-only connection on Supabase). Set DATABASE_URL to the Session pooler string.");
  }

  if (cached) cached.pool.end().catch(() => {});
  const pool = new Pool(buildPoolConfig(url));
  // An unhandled 'error' on an idle pooled client would crash the process.
  pool.on("error", (err) => logDatabaseError("pool idle client", err));
  globalThis.__jobsHubPool = { key: source.value, pool, schemaCheck: null };
  return pool;
}

// ---------------------------------------------------------------------------
// Schema verification (read-only)
//
// supabase/migrations/ is the single source of truth for the schema. Nothing
// here creates or alters tables: DDL on every cold start takes ACCESS EXCLUSIVE
// locks and races between concurrent serverless instances. Instead we verify
// once per instance that the migrated schema is present, and fail with a clear
// DB_SCHEMA_OUTDATED error if not. Apply migrations with `npm run db:migrate`.
// ---------------------------------------------------------------------------

const REQUIRED_TABLES = [
  "manual_jobs", "blog_posts", "job_submissions", "event_submissions", "events",
  "admin_login_attempts", "job_posting_links", "ads", "live_job_cache",
  "social_channel_settings", "job_distribution_queue", "job_distribution_logs",
];
// Columns that were added to existing tables after their first release - the
// ones most likely to be missing on a partially migrated database.
const REQUIRED_COLUMNS = {
  manual_jobs: ["package_code", "package_price", "package_expires_at", "featured_until", "package_started_at", "renewal_status", "source_submission_id", "application_deadline"],
  job_submissions: ["phone", "package_code", "package_price", "package_duration_days", "payment_status", "admin_notes", "posting_link_id", "ip_hash", "submission_key"],
  event_submissions: ["ip_hash", "group_key", "package_event_count", "submission_key"],
};

async function verifySchema(pool) {
  const { rows } = await pool.query(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = ANY($1)",
    [REQUIRED_TABLES]
  );
  const present = new Map();
  for (const r of rows) {
    if (!present.has(r.table_name)) present.set(r.table_name, new Set());
    present.get(r.table_name).add(r.column_name);
  }
  const missing = [];
  for (const table of REQUIRED_TABLES) {
    if (!present.has(table)) { missing.push(table); continue; }
    for (const col of REQUIRED_COLUMNS[table] || []) if (!present.get(table).has(col)) missing.push(`${table}.${col}`);
  }
  if (missing.length) {
    throw new DatabaseSchemaError(`Database schema is missing: ${missing.join(", ")}. Run the migrations in supabase/migrations (npm run db:migrate).`, missing);
  }
}

// Only a *successful* check is cached; a failed one (connection or schema) is
// retried on the next request, so a transient failure cannot stick.
async function ensureSchemaVerified() {
  const pool = getPool();
  const entry = globalThis.__jobsHubPool;
  if (!entry.schemaCheck) {
    const attempt = verifySchema(pool);
    entry.schemaCheck = attempt;
    attempt.catch(() => { if (entry.schemaCheck === attempt) entry.schemaCheck = null; });
  }
  return entry.schemaCheck;
}

// ---------------------------------------------------------------------------
// Public API (unchanged signatures)
// ---------------------------------------------------------------------------

export async function query(sql, params) {
  await ensureSchemaVerified();
  return getPool().query(sql, params);
}

export async function withTransaction(callback) {
  await ensureSchemaVerified();
  const client = await getPool().connect();
  let broken = false;
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (rollbackError) { broken = true; logDatabaseError("transaction rollback", rollbackError); }
    throw error;
  } finally {
    client.release(broken ? true : undefined); // discard a connection whose rollback failed
  }
}

export function isDatabaseConfigured() {
  return Boolean(readConnectionString());
}

// Query without the schema check. Used by authentication paths so unrelated
// schema drift can never block sign-in.
export async function rawQuery(sql, params) {
  return getPool().query(sql, params);
}

// Exposed for tests and diagnostics only.
export const __internals = { buildPoolConfig, redactSecrets };
