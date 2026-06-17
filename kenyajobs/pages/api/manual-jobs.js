import { listPublishedJobs } from "@/lib/manualJobs";
import { isDatabaseConfigured } from "@/lib/db";

export default async function handler(req, res) {
  if (!isDatabaseConfigured()) {
    // No DB provisioned yet — fail soft so the rest of the site (live-pulled
    // jobs) keeps working without manual listings.
    res.status(200).json([]);
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  try {
    const { category = "", search = "" } = req.query;
    const jobs = await listPublishedJobs({
      category: category || undefined,
      search: search || undefined,
    });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("manual-jobs error:", err.message);
    res.status(200).json([]);
  }
}
