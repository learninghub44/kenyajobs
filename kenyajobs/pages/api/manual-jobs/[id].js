import { getPublishedJobById } from "@/lib/manualJobs";
import { isDatabaseConfigured } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!isDatabaseConfigured()) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  try {
    const job = await getPublishedJobById(id);
    if (!job) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json(job);
  } catch (err) {
    console.error("manual-jobs/[id] error:", err.message);
    res.status(500).json({ error: "Failed to load job" });
  }
}
