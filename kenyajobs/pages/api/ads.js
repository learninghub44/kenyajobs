import { listActiveAds } from "@/lib/ads";
import { isDatabaseConfigured } from "@/lib/db";

export default async function handler(req, res) {
  if (!isDatabaseConfigured()) {
    res.status(200).json([]);
    return;
  }

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  try {
    const { placement = "" } = req.query;
    const ads = await listActiveAds({ placement: placement || undefined });
    res.status(200).json(ads);
  } catch (err) {
    console.error("ads error:", err.message);
    res.status(200).json([]);
  }
}
