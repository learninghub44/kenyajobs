// Connection configuration shared by the app (lib/db.js) and the migration
// runner (scripts/db-migrate.mjs). Dependency-free so plain Node can import it.
//
// DATABASE_URL is used exactly as supplied - host, port, user, password and
// database all come from it; nothing is hardcoded. On Vercel it must be the
// Supabase *Session pooler* string (Dashboard -> Connect -> Session pooler):
// the direct host db.<ref>.supabase.co is IPv6-only and cannot be resolved from
// Vercel's IPv4 network (getaddrinfo ENOTFOUND).

export class DatabaseConfigError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "DatabaseConfigError";
    this.code = code; // DB_NOT_CONFIGURED | DB_CONFIG_INVALID
  }
}

const ENV_PRECEDENCE = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING"];
const SSL_PARAMS = ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert", "sslcrl", "uselibpqcompat"];
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function readConnectionString(env = process.env) {
  for (const name of ENV_PRECEDENCE) {
    const value = (env[name] || "").trim();
    if (value) return { name, value };
  }
  return null;
}

// Parse and validate without ever echoing the string back in an error.
export function parseConnection(source) {
  let url;
  try {
    url = new URL(source.value);
  } catch {
    throw new DatabaseConfigError(
      "DB_CONFIG_INVALID",
      `${source.name} is not a valid PostgreSQL connection string. Expected USER:PASSWORD@HOST:PORT/DATABASE after the postgresql scheme prefix; URL-encode special characters in the password (for example @ as %40, # as %23).`
    );
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new DatabaseConfigError("DB_CONFIG_INVALID", `${source.name} must start with postgresql:// or postgres://.`);
  }
  if (!url.hostname) throw new DatabaseConfigError("DB_CONFIG_INVALID", `${source.name} has no database host.`);
  if (!url.username) throw new DatabaseConfigError("DB_CONFIG_INVALID", `${source.name} has no database user.`);
  return url;
}

export function isDirectSupabaseHost(hostname) {
  return /^db\.[a-z0-9]+\.supabase\.co$/i.test(hostname);
}

// pg lets sslmode in the URL override the `ssl` option, and newer pg versions
// treat sslmode=require as full certificate verification, which fails against
// Supabase's certificate chain. SSL is therefore decided here, not by the URL.
export function buildClientConfig(url) {
  const local = LOCAL_HOSTS.has(url.hostname.toLowerCase());
  const clean = new URL(url.href);
  for (const param of SSL_PARAMS) clean.searchParams.delete(param);
  return {
    connectionString: clean.toString(),
    ssl: local ? false : { rejectUnauthorized: false },
    application_name: "jobshub-kenya",
  };
}
