import { requireAdmin } from "@/lib/adminAuth";
import { listAllJobs, createJob } from "@/lib/manualJobs";
import { sendApiError } from "@/lib/dbErrors";

export default requireAdmin(async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const jobs = await listAllJobs();
      res.status(200).json(jobs);
    } catch (err) {
      return sendApiError(res, "admin/jobs GET", err, "Could not load jobs. Please try again.");
    }
    return;
  }

  if (req.method === "POST") {
    const { title, company, url } = req.body || {};
    if (!title || !company || !url) {
      res.status(400).json({ error: "title, company and url are required" });
      return;
    }
    try {
      const job = await createJob(req.body);
      res.status(201).json(job);
    } catch (err) {
      return sendApiError(res, "admin/jobs POST", err, "Could not save the job. Please try again.");
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
