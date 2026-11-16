import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
function slugify(value) { return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }
export default requireAdmin(async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { rows } = await query("SELECT * FROM blog_posts ORDER BY updated_at DESC");
      return res.status(200).json(rows);
    }
    if (req.method === "POST" || req.method === "PUT") {
      const body = req.body || {};
      const title = String(body.title || "").trim();
      const content = String(body.content || "").trim();
      if (!title || !content) return res.status(400).json({ error: "Title and article content are required." });
      let slug = slugify(body.slug || title);
      if (!slug) return res.status(400).json({ error: "Please provide a valid article slug." });
      if (req.method === "POST") {
        const { rows } = await query(`INSERT INTO blog_posts(slug,title,excerpt,category,content,cover_image,author,status,published_at)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $8='published' THEN now() ELSE NULL END) RETURNING *`,
          [slug,title,String(body.excerpt||""),String(body.category||"Career Advice"),content,String(body.cover_image||""),String(body.author||"JOBS HUB KENYA"),body.status==="published"?"published":"draft"]);
        return res.status(201).json(rows[0]);
      }
      const id = Number(body.id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "A valid article ID is required." });
      const { rows } = await query(`UPDATE blog_posts SET slug=$2,title=$3,excerpt=$4,category=$5,content=$6,cover_image=$7,author=$8,status=$9,
        published_at=CASE WHEN $9='published' THEN COALESCE(published_at,now()) ELSE NULL END,updated_at=now() WHERE id=$1 RETURNING *`,
        [id,slug,title,String(body.excerpt||""),String(body.category||"Career Advice"),content,String(body.cover_image||""),String(body.author||"JOBS HUB KENYA"),body.status==="published"?"published":"draft"]);
      if (!rows[0]) return res.status(404).json({ error: "Article not found." });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "DELETE") {
      const id = Number((req.body||{}).id);
      if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "A valid article ID is required." });
      const result = await query("DELETE FROM blog_posts WHERE id=$1", [id]);
      return res.status(200).json({ ok: true, deleted: result.rowCount });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "That article URL already exists. Change the slug." });
    console.error("admin blog API:", error.message);
    return res.status(500).json({ error: "Could not save the article." });
  }
});