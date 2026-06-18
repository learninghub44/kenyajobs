import { requireAdmin } from "@/lib/adminAuth";

// What we expect to see in each route's results when everything is healthy.
// "gatedBy" sources only run when the matching env var is set — we check that
// directly instead of guessing, so we don't flag a key-gated source as "down"
// when it was just never configured.
const ROUTES = [
  {
    path: "/api/africa-jobs",
    knownSources: [
      "Remotive", "The Muse", "Jobicy", "Arbeitnow", "JobsDB HK", "Seek AU", "Naukri IN",
      "ReliefWeb", "Himalayas", "BrighterMonday KE", "BrighterMonday UG", "BrighterMonday TZ",
      "MyJobMag KE", "MyJobMag NG", "MyJobMag SA", "PNet SA", "Wuzzuf EG", "Fuzu",
      "Jobweb KE", "CareersPortal SA", "NGCareers",
    ],
  },
  { path: "/api/remote-jobs", knownSources: ["Remotive", "Jobicy", "Arbeitnow"] },
  {
    path: "/api/entry-level-jobs",
    knownSources: ["The Muse", "Remotive"],
    gatedSources: [{ name: "JSearch", envVar: "RAPIDAPI_KEY" }],
  },
  {
    path: "/api/graduate-jobs",
    knownSources: ["The Muse", "Jobicy"],
    gatedSources: [{ name: "JSearch", envVar: "RAPIDAPI_KEY" }],
  },
  {
    path: "/api/wfh-jobs",
    knownSources: ["Remotive", "Jobicy"],
    gatedSources: [{ name: "Adzuna", envVar: "ADZUNA_APP_ID" }],
  },
  { path: "/api/manual-jobs", knownSources: ["JobsWorldwide"] },
];

async function checkRoute(base, route) {
  const start = Date.now();
  try {
    const resp = await fetch(`${base}${route.path}`);
    const ms = Date.now() - start;
    if (!resp.ok) return { route: route.path, ok: false, error: `HTTP ${resp.status}`, ms, total: 0, bySource: {} };

    const data = await resp.json();
    const jobs = Array.isArray(data) ? data : [];
    const bySource = {};
    for (const j of jobs) {
      const src = j.source || "Unknown";
      bySource[src] = (bySource[src] || 0) + 1;
    }

    const activeKnown = route.knownSources;
    const missing = activeKnown.filter((s) => !bySource[s]);
    const gated = (route.gatedSources || []).map((g) => ({
      ...g,
      configured: Boolean(process.env[g.envVar]),
      returning: Boolean(bySource[g.name]),
    }));

    return { route: route.path, ok: true, ms, total: jobs.length, bySource, missing, gated };
  } catch (err) {
    return { route: route.path, ok: false, error: err.message, ms: Date.now() - start, total: 0, bySource: {} };
  }
}

export default requireAdmin(async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const base = `${proto}://${host}`;

  const results = await Promise.all(ROUTES.map((r) => checkRoute(base, r)));

  res.status(200).json({
    checkedAt: new Date().toISOString(),
    env: {
      database: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      rapidApiKey: Boolean(process.env.RAPIDAPI_KEY),
      adzuna: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
      adsense: Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
    },
    results,
  });
});
