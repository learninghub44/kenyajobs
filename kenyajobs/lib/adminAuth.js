// lib/adminAuth.js
// Single shared admin password, gated by a signed + expiring httpOnly cookie.
// No server-side session storage is needed (and none would persist reliably
// across Vercel's serverless function instances anyway) — the cookie itself
// carries an expiry timestamp plus an HMAC signature so it can't be forged or
// extended without knowing the secret.
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "jw_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  // ADMIN_SESSION_SECRET is optional — if not set, we derive one from the
  // admin password so a single env var (ADMIN_PASSWORD) is enough to get going.
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not set in the environment.");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  let expectedSig;
  try {
    expectedSig = sign(payload);
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(payload) > Date.now();
}

export function isAdminRequest(req) {
  try {
    return verifySessionToken(req.cookies?.[ADMIN_COOKIE_NAME]);
  } catch {
    return false;
  }
}

export function sessionCookie(token) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie() {
  const parts = [`${ADMIN_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

// Drop this in front of any API route handler to require a valid admin session.
export function requireAdmin(handler) {
  return async function (req, res) {
    if (!isAdminRequest(req)) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    return handler(req, res);
  };
}
