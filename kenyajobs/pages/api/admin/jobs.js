import { requireAdmin } from "@/lib/adminAuth";
import { listAllJobs, createJob } from "@/lib/manualJobs";

export default requireAdmin(async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const jobs = await listAllJobs();
      res.status(200).json(jobs);
    } catch (err) {
      console.error("admin/jobs GET error:", err.message);
      res.status(500).json({ error: err.message });
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
      console.error("admin/jobs POST error:", err.message);
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
