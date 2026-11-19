import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { sendApiError } from "@/lib/dbErrors";

export default requireAdmin(async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method not allowed" }); }
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Valid application ID required." });
  try {
    const { rows } = await query(
      "SELECT a.resume_filename, f.data, f.mime_type FROM job_applications a JOIN job_application_files f ON f.application_id=a.id WHERE a.id=$1", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Resume not found." });
    const name = String(rows[0].resume_filename || "resume.pdf").replace(/[^\w.\- ]+/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(rows[0].data);
  } catch (e) {
    return sendApiError(res, "admin/applications resume", e, "Could not load the resume.");
  }
});
