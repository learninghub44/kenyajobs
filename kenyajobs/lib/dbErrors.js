// Database error classification, secret redaction and safe API error responses.
// Kept free of any `pg` import so it can be unit-tested and used from anywhere.

import { DatabaseConfigError } from "./dbConfig.mjs";
export { DatabaseConfigError };

export class DatabaseSchemaError extends Error {
  constructor(message, missing = []) {
    super(message);
    this.name = "DatabaseSchemaError";
    this.code = "DB_SCHEMA_OUTDATED";
    this.missing = missing;
  }
}

const ENV_NAMES = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING"];

function knownSecrets() {
  const secrets = [];
  for (const name of ENV_NAMES) {
    const raw = process.env[name];
    if (!raw) continue;
    secrets.push(raw.trim());
    try {
      const url = new URL(raw.trim());
      if (url.password) {
        secrets.push(url.password);
        try { secrets.push(decodeURIComponent(url.password)); } catch {}
      }
    } catch {}
  }
  return secrets.filter((s) => s && s.length >= 4);
}

// Remove connection strings and passwords from any text before it is logged.
export function redactSecrets(text) {
  let out = String(text ?? "");
  for (const secret of knownSecrets()) out = out.split(secret).join("***");
  return out.replace(/postgres(?:ql)?:\/\/[^\s'"]+/gi, "postgres://***");
}

const NETWORK_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EHOSTUNREACH", "ENETUNREACH", "EPIPE"]);

// Returns { kind, status, publicMessage } for any error thrown by the data layer.
export function classifyDatabaseError(err) {
  const code = err?.code;
  const message = String(err?.message || "");
  if (err instanceof DatabaseConfigError) {
    return { kind: code, status: 503, publicMessage: "The database is not configured. Please contact the site administrator." };
  }
  if (err instanceof DatabaseSchemaError) {
    return { kind: "DB_SCHEMA_OUTDATED", status: 503, publicMessage: "The database schema is not up to date. Please contact the site administrator." };
  }
  if (NETWORK_CODES.has(code) || /timeout exceeded when trying to connect|Connection terminated|connection timeout|self[- ]signed certificate|certificate/i.test(message)) {
    return { kind: "DB_UNREACHABLE", status: 503, publicMessage: "The database is temporarily unreachable. Please try again shortly." };
  }
  if (code === "28P01" || code === "28000" || /password authentication failed|Tenant or user not found/i.test(message)) {
    return { kind: "DB_AUTH_FAILED", status: 503, publicMessage: "The database rejected the server's credentials. Please contact the site administrator." };
  }
  if (code === "53300" || /MaxClientsInSessionMode|max clients reached|too many (?:connections|clients)/i.test(message)) {
    return { kind: "DB_POOL_EXHAUSTED", status: 503, publicMessage: "The database is busy. Please try again shortly." };
  }
  if (code === "42P01" || code === "42703") {
    return { kind: "DB_SCHEMA_OUTDATED", status: 503, publicMessage: "The database schema is not up to date. Please contact the site administrator." };
  }
  return { kind: "DB_ERROR", status: 500, publicMessage: null };
}

// Server-side diagnostics. Never prints passwords or full connection strings.
export function logDatabaseError(context, err, extra = {}) {
  const { kind } = classifyDatabaseError(err);
  const detail = {
    context,
    kind,
    errorName: err?.name,
    code: err?.code,
    syscall: err?.syscall,
    hostname: err?.hostname, // DNS failures expose the host that failed, never credentials
    pgDetail: err?.detail ? redactSecrets(err.detail) : undefined,
    pgTable: err?.table,
    pgColumn: err?.column,
    missing: err?.missing,
    message: redactSecrets(err?.message),
    ...extra,
  };
  for (const key of Object.keys(detail)) if (detail[key] === undefined) delete detail[key];
  console.error("[db-error] " + JSON.stringify(detail));
}

// Consistent JSON error response for API routes. Infrastructure failures become
// 503 with a stable `code`; anything else is a 500 with the route's own message.
export function sendApiError(res, context, err, fallbackMessage = "Request failed.") {
  logDatabaseError(context, err);
  const { kind, status, publicMessage } = classifyDatabaseError(err);
  if (res.headersSent) return;
  return res.status(status).json({ error: publicMessage || fallbackMessage, code: kind });
}
