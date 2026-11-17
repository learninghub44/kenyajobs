import { checkPassword, createSessionToken, sessionCookie } from "@/lib/adminAuth";

// Best-effort per-instance throttling keeps sign-in independent of database
// availability. Vercel edge/WAF rate limits should be used for global limits.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getClientKey(req) {
  const ip = String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  return ip.slice(0, 128);
}

function pruneAttempts(now) {
  if (attempts.size < 5000) return;
  for (const [key, state] of attempts) {
    if (now - state.windowStartedAt > WINDOW_MS && (!state.lockedUntil || state.lockedUntil <= now)) attempts.delete(key);
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.ADMIN_PASSWORD) {
    console.error("admin login: ADMIN_PASSWORD is not configured for this deployment");
    return res.status(503).json({ error: "Admin sign-in is not configured. Contact the site administrator." });
  }

  const now = Date.now();
  const key = getClientKey(req);
  pruneAttempts(now);
  const state = attempts.get(key);
  if (state?.lockedUntil > now) {
    const seconds = Math.ceil((state.lockedUntil - now) / 1000);
    res.setHeader("Retry-After", String(seconds));
    return res.status(429).json({ error: "Too many sign-in attempts. Try again in 15 minutes." });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!checkPassword(password)) {
    const current = state && now - state.windowStartedAt < WINDOW_MS
      ? state
      : { count: 0, windowStartedAt: now, lockedUntil: 0 };
    current.count += 1;
    if (current.count >= MAX_ATTEMPTS) current.lockedUntil = now + LOCK_MS;
    attempts.set(key, current);
    if (current.lockedUntil > now) res.setHeader("Retry-After", String(Math.ceil(LOCK_MS / 1000)));
    return res.status(current.lockedUntil > now ? 429 : 401).json({
      error: current.lockedUntil > now
        ? "Too many sign-in attempts. Try again in 15 minutes."
        : "Incorrect password",
    });
  }

  attempts.delete(key);
  try {
    res.setHeader("Set-Cookie", sessionCookie(createSessionToken()));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin login session error:", error.message);
    return res.status(503).json({ error: "Unable to create an admin session. Check the admin session configuration." });
  }
}
