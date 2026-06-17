import { requireAdmin } from "@/lib/adminAuth";
import { getJobById, updateJob, deleteJob } from "@/lib/manualJobs";

export default requireAdmin(async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const job = await getJobById(id);
      if (!job) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json(job);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    const { title, company, url } = req.body || {};
    if (!title || !company || !url) {
      res.status(400).json({ error: "title, company and url are required" });
      return;
    }
    try {
      const job = await updateJob(id, req.body);
      if (!job) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json(job);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await deleteJob(id);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
