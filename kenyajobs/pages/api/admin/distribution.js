import { requireAdmin } from "@/lib/adminAuth";
import { getSocialSettings, saveSocialSettings, listDistributionQueue } from "@/lib/distribution";

export default requireAdmin(async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const [settings, queue] = await Promise.all([getSocialSettings(), listDistributionQueue()]);
      return res.status(200).json({
        settings,
        queue,
        telegramBotConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      });
    }
    if (req.method === "PUT") {
      const settings = await saveSocialSettings(req.body || {});
      return res.status(200).json({ settings });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("admin/distribution error:", error.message);
    return res.status(500).json({ error: error.message || "Distribution request failed" });
  }
});
