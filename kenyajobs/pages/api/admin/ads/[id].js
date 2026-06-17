import { requireAdmin } from "@/lib/adminAuth";
import { getAdById, updateAd, deleteAd } from "@/lib/ads";

export default requireAdmin(async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const ad = await getAdById(id);
      if (!ad) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json(ad);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "PUT") {
    const { title, url } = req.body || {};
    if (!title || !url) {
      res.status(400).json({ error: "title and url are required" });
      return;
    }
    try {
      const ad = await updateAd(id, req.body);
      if (!ad) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json(ad);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await deleteAd(id);
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});
