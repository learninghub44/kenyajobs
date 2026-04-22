import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database URL found. Set SUPABASE_DATABASE_URL or DATABASE_URL.");
}

const shouldUseSsl =
  (process.env.DB_SSL || "").toLowerCase() === "false"
    ? false
    : process.env.NODE_ENV === "production" || Boolean(process.env.SUPABASE_DATABASE_URL);

export const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
