import { getPublishedJobById } from "@/lib/manualJobs";
import { getCachedJob } from "@/lib/liveJobCache";
import { isDatabaseConfigured } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!isDatabaseConfigured()) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");

  try {
    if (String(id).startsWith("manual-")) {
      const job = await getPublishedJobById(id);
      if (job) {
        res.status(200).json(job);
        return;
      }
    }

    const cached = await getCachedJob(id);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error("job-lookup error:", err.message);
    res.status(500).json({ error: "Lookup failed" });
  }
}
