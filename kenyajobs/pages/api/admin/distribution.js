import { requireAdmin } from "@/lib/adminAuth";
import { getSocialSettings, saveSocialSettings, listDistributionQueue, enqueueJobs } from "@/lib/distribution";

const SOURCE_ROUTES = ["/api/africa-jobs", "/api/remote-jobs", "/api/entry-level-jobs", "/api/graduate-jobs", "/api/wfh-jobs"];

export default requireAdmin(async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const [settings, queue] = await Promise.all([getSocialSettings(), listDistributionQueue()]);
      return res.status(200).json({
        settings,
        queue,
        telegramBotConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      });
    }
    if (req.method === "PUT") {
      const settings = await saveSocialSettings(req.body || {});
      return res.status(200).json({ settings });
    }
    if (req.method === "POST" && (req.body || {}).action === "scan") {
      const baseUrl = process.env.SITE_URL || (req.headers.host ? `https://${req.headers.host}` : "http://localhost:3000");
      const results = await Promise.allSettled(SOURCE_ROUTES.map(async (route) => {
        const response = await fetch(`${baseUrl}${route}`, { headers: { "User-Agent": "JobsHubKenya-Admin-Scan/1.0" } });
        if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
        const jobs = await response.json();
        const result = await enqueueJobs(Array.isArray(jobs) ? jobs : [], route);
        return { route, seen: Array.isArray(jobs) ? jobs.length : 0, queued: result.queued || 0 };
      }));
      const sources = results.map((r, i) => r.status === "fulfilled" ? r.value : { route: SOURCE_ROUTES[i], error: r.reason?.message || "Scan failed" });
      return res.status(200).json({ ok: sources.some((s) => !s.error), queued: sources.reduce((n, s) => n + (s.queued || 0), 0), sources });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("admin/distribution error:", error.message);
    return res.status(500).json({ error: error.message || "Distribution request failed" });
  }
});
