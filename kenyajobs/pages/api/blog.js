import { query } from "@/lib/db";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { rows } = await query("SELECT id,slug,title,excerpt,category,cover_image,author,published_at,created_at FROM blog_posts WHERE status='published' ORDER BY COALESCE(published_at,created_at) DESC");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("blog API:", error.message);
    return res.status(503).json({ error: "Blog content is temporarily unavailable." });
  }
}