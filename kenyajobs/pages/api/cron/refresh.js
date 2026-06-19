// pages/api/cron/refresh.js
//
// Without this, job listings only refresh when a real visitor's request happens to land
// after the CDN's cached response has expired (s-maxage=1800 on every *-jobs route).
// On low-traffic windows (e.g. overnight in Kenya) that means listings can sit unchanged
// for hours, then all catch up at once on the next visit. This endpoint exists to be
// called on a real clock — by an external scheduler — so every source route gets
// re-fetched on a predictable cadence regardless of whether anyone is browsing the site.
//
// Call it with: GET /api/cron/refresh?key=YOUR_CRON_SECRET
// Set CRON_SECRET in your environment and use the same value in the scheduler config.
//
// This does NOT replace the existing s-maxage caching — it just makes sure a fresh fetch
// happens on a schedule instead of waiting for organic traffic to trigger one.

const SOURCE_ROUTES = [
  "/api/africa-jobs",
  "/api/remote-jobs",
  "/api/entry-level-jobs",
  "/api/graduate-jobs",
  "/api/wfh-jobs",
];

export default async function handler(req, res) {
  // Protect this endpoint — without a secret, anyone could hit it repeatedly and
  // hammer all upstream sources (RSS feeds, Remotive, Jobicy, etc.) on demand.
  const providedKey = req.query.key || req.headers["x-cron-key"];
  if (process.env.CRON_SECRET && providedKey !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const baseUrl =
    process.env.SITE_URL ||
    (req.headers.host ? `https://${req.headers.host}` : "http://localhost:3000");

  const startedAt = Date.now();

  const results = await Promise.allSettled(
    SOURCE_ROUTES.map(async (route) => {
      const r = await fetch(`${baseUrl}${route}`, {
        headers: { "User-Agent": "JobsWorldwide-Cron/1.0" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return { route, count: Array.isArray(data) ? data.length : 0 };
    })
  );

  const summary = results.map((r, i) =>
    r.status === "fulfilled"
      ? { route: SOURCE_ROUTES[i], status: "ok", jobs: r.value.count }
      : { route: SOURCE_ROUTES[i], status: "error", error: r.reason?.message }
  );

  const durationMs = Date.now() - startedAt;
  const totalJobs = summary.reduce((sum, s) => sum + (s.jobs || 0), 0);

  console.log(`[cron/refresh] Completed in ${durationMs}ms — ${totalJobs} total jobs across ${summary.length} routes`);

  res.status(200).json({
    ok: true,
    durationMs,
    totalJobs,
    sources: summary,
    timestamp: new Date().toISOString(),
  });
}
