// lib/db.js
// Postgres connection pool. Works with any standard Postgres connection string —
// Vercel Postgres, Neon, Supabase, or self-hosted. Set DATABASE_URL in the
// environment (Vercel project settings) to whichever connection string your
// provider gives you.
//
// Some providers also expose POSTGRES_URL / POSTGRES_PRISMA_URL (Vercel Postgres)
// instead of DATABASE_URL — we fall back to those so this works out of the box
// regardless of which integration was used to provision the database.
import { Pool } from "pg";

const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

let pool;

function getPool() {
  if (!CONNECTION_STRING) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL (or POSTGRES_URL) in your environment."
    );
  }
  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(CONNECTION_STRING);
    pool = new Pool({
      connectionString: CONNECTION_STRING,
      // Vercel Postgres / Neon / Supabase all require SSL; local dev usually doesn't.
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

// Schema bootstrap — runs once per cold start (serverless functions are reused
// across requests until the instance recycles, so this keeps cost/latency low
// without needing a separate migration step on deploy).
let schemaReady = null;

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(`
        CREATE TABLE IF NOT EXISTS manual_jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT DEFAULT 'Worldwide',
          type TEXT DEFAULT 'Full-time',
          salary TEXT,
          description TEXT DEFAULT '',
          url TEXT NOT NULL,
          company_logo TEXT,
          company_website TEXT,
          categories TEXT[] NOT NULL DEFAULT '{}',
          featured BOOLEAN NOT NULL DEFAULT false,
          published BOOLEAN NOT NULL DEFAULT true,
          source TEXT NOT NULL DEFAULT 'JobsWorldwide',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ads (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT,
          description TEXT DEFAULT '',
          url TEXT NOT NULL,
          image_url TEXT,
          placement TEXT NOT NULL DEFAULT 'all',
          active BOOLEAN NOT NULL DEFAULT true,
          priority INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS manual_jobs_published_idx ON manual_jobs (published);
        CREATE INDEX IF NOT EXISTS ads_active_placement_idx ON ads (active, placement);
      `)
      .catch((err) => {
        // Let the next call retry instead of caching a failed bootstrap forever.
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

// Run a query, guaranteeing the schema exists first.
export async function query(text, params) {
  await ensureSchema();
  return getPool().query(text, params);
}

export function isDatabaseConfigured() {
  return Boolean(CONNECTION_STRING);
}
