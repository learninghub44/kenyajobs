import test from "node:test";
import assert from "node:assert/strict";
import { readConnectionString, parseConnection, buildClientConfig, isDirectSupabaseHost, DatabaseConfigError } from "../lib/dbConfig.mjs";
import { classifyDatabaseError, redactSecrets, DatabaseSchemaError } from "../lib/dbErrors.js";

const POOLER = "postgresql://postgres.abcdefgh:s3cr%40t-pw@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

test("DATABASE_URL takes precedence and is trimmed; nothing configured returns null", () => {
  assert.equal(readConnectionString({}), null);
  assert.deepEqual(readConnectionString({ DATABASE_URL: ` ${POOLER}\n`, POSTGRES_URL: "postgres://x:y@h/d" }), { name: "DATABASE_URL", value: POOLER });
  assert.equal(readConnectionString({ POSTGRES_URL: "postgres://x:y@h/d" }).name, "POSTGRES_URL");
});

test("Supabase session-pooler string parses (dotted user, encoded password)", () => {
  const url = parseConnection({ name: "DATABASE_URL", value: POOLER });
  assert.equal(url.hostname, "aws-0-eu-west-1.pooler.supabase.com");
  assert.equal(url.username, "postgres.abcdefgh");
  assert.equal(decodeURIComponent(url.password), "s3cr@t-pw");
  assert.equal(isDirectSupabaseHost(url.hostname), false);
});

test("direct Supabase host is recognised", () => {
  assert.equal(isDirectSupabaseHost("db.battkrfilmoolgcujfse.supabase.co"), true);
});

test("malformed strings fail with DB_CONFIG_INVALID and never echo the input", () => {
  for (const value of ["not a url", "postgresql://u:pa#ss@host/db", "mysql://u:p@h/d", "postgresql://:p@h/d", "postgresql://u:SECRETVALUE@/d"]) {
    assert.throws(() => parseConnection({ name: "DATABASE_URL", value }), (e) => {
      assert.ok(e instanceof DatabaseConfigError);
      assert.equal(e.code, "DB_CONFIG_INVALID");
      assert.ok(!e.message.includes("SECRETVALUE") && !e.message.includes("pa#ss"));
      return true;
    });
  }
});

test("SSL is decided by config, not by sslmode in the URL; other params survive", () => {
  const remote = buildClientConfig(parseConnection({ name: "DATABASE_URL", value: POOLER + "?sslmode=require&application_name=keepme&sslrootcert=/x" }));
  assert.deepEqual(remote.ssl, { rejectUnauthorized: false });
  assert.ok(!/sslmode|sslrootcert/.test(remote.connectionString));
  assert.match(remote.connectionString, /application_name=keepme/);
  assert.equal(buildClientConfig(parseConnection({ name: "DATABASE_URL", value: "postgresql://u:p@localhost:5432/d?sslmode=require" })).ssl, false);
});

test("errors are classified and redacted", () => {
  const enotfound = Object.assign(new Error("getaddrinfo ENOTFOUND db.x.supabase.co"), { code: "ENOTFOUND" });
  assert.equal(classifyDatabaseError(enotfound).kind, "DB_UNREACHABLE");
  assert.equal(classifyDatabaseError(enotfound).status, 503);
  assert.equal(classifyDatabaseError(Object.assign(new Error("x"), { code: "28P01" })).kind, "DB_AUTH_FAILED");
  assert.equal(classifyDatabaseError(new Error("MaxClientsInSessionMode: max clients reached")).kind, "DB_POOL_EXHAUSTED");
  assert.equal(classifyDatabaseError(Object.assign(new Error("x"), { code: "42P01" })).kind, "DB_SCHEMA_OUTDATED");
  assert.equal(classifyDatabaseError(new DatabaseSchemaError("m", ["t"])).kind, "DB_SCHEMA_OUTDATED");
  assert.deepEqual(classifyDatabaseError(new Error("syntax error")), { kind: "DB_ERROR", status: 500, publicMessage: null });

  process.env.DATABASE_URL = POOLER;
  try {
    const out = redactSecrets(`failed postgresql://postgres.abcdefgh:s3cr%40t-pw@h/db and password s3cr@t-pw and ${POOLER}`);
    assert.ok(!out.includes("s3cr"), out);
  } finally { delete process.env.DATABASE_URL; }
});
