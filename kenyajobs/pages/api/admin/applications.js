import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { sendApiError } from "@/lib/dbErrors";

const STATUSES = ["new", "reviewed", "shortlisted", "rejected"];
const COLUMNS = `id,job_id,job_number,job_title,company,first_name,last_name,email,phone,address,linkedin_url,portfolio_url,
  work_profile_url,work_samples_url,how_heard,whatsapp_updates,marketing_opt_out,resume_filename,resume_size,status,admin_notes,created_at`;

export default requireAdmin(async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const where = [], params = [];
      const { jobId, status, q } = req.query;
      if (jobId) { params.push(String(jobId).slice(0, 120)); where.push(`job_id=$${params.length}`); }
      if (status) {
        if (!STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status." });
        params.push(status); where.push(`status=$${params.length}`);
      }
      if (q) { params.push(`%${String(q).slice(0, 80)}%`); where.push(`(first_name||' '||last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR job_title ILIKE $${params.length})`); }
      const { rows } = await query(`SELECT ${COLUMNS} FROM job_applications ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 500`, params);
      return res.status(200).json(rows);
    }
    if (req.method === "PATCH") {
      const { id, status, adminNotes } = req.body || {};
      const n = Number(id);
      if (!Number.isInteger(n) || n < 1) return res.status(400).json({ error: "Valid application ID required." });
      if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status." });
      const { rows } = await query(
        `UPDATE job_applications SET status=COALESCE($2,status), admin_notes=CASE WHEN $3::boolean THEN $4 ELSE admin_notes END WHERE id=$1 RETURNING ${COLUMNS}`,
        [n, status ?? null, adminNotes !== undefined, adminNotes === undefined ? null : String(adminNotes).slice(0, 2000)]
      );
      return rows[0] ? res.status(200).json(rows[0]) : res.status(404).json({ error: "Application not found." });
    }
    if (req.method === "DELETE") {
      const n = Number((req.body || {}).id);
      if (!Number.isInteger(n) || n < 1) return res.status(400).json({ error: "Valid application ID required." });
      await query("DELETE FROM job_applications WHERE id=$1", [n]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return sendApiError(res, "admin/applications " + req.method, e, "Could not process applications.");
  }
});
