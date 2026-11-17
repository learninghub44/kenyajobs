import { getSocialSettings, DEFAULT_SOCIAL_SETTINGS } from "@/lib/distribution";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  try {
    const settings = await getSocialSettings();
    return res.status(200).json({
      whatsapp: settings.whatsapp_enabled ? settings.whatsapp_channel_url : "",
      telegram: settings.telegram_enabled ? settings.telegram_channel_url : "",
    });
  } catch (error) {
    console.error("social-links error:", error.message);
    return res.status(200).json({
      whatsapp: DEFAULT_SOCIAL_SETTINGS.whatsapp_channel_url,
      telegram: DEFAULT_SOCIAL_SETTINGS.telegram_channel_url,
      fallback: true,
    });
  }
}
