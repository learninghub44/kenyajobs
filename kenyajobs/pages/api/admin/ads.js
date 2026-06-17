import { requireAdmin } from "@/lib/adminAuth";
import { listAllAds, createAd } from "@/lib/ads";

export default requireAdmin(async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const ads = await listAllAds();
      res.status(200).json(ads);
    } catch (err) {
      console.error("admin/ads GET error:", err.message);
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "POST") {
    const { title, url } = req.body || {};
    if (!title || !url) {
      res.status(400).json({ error: "title and url are required" });
      return;
    }
    try {
      const ad = await createAd(req.body);
      res.status(201).json(ad);
    } catch (err) {
      console.error("admin/ads POST error:", err.message);
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
