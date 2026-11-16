import { requireAdmin } from "@/lib/adminAuth";
import { updateDistributionItem, sendTelegramMessage } from "@/lib/distribution";

export default requireAdmin(async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid queue item." });
  const { action } = req.body || {};
  try {
    if (action === "approve") {
      const item = await updateDistributionItem(id, "ready");
      return item ? res.status(200).json({ item }) : res.status(404).json({ error: "Queue item not found." });
    }
    if (action === "mark_posted") {
      const item = await updateDistributionItem(id, "posted");
      return item ? res.status(200).json({ item }) : res.status(404).json({ error: "Queue item not found." });
    }
    if (action === "retry") {
      const item = await updateDistributionItem(id, "ready");
      return item ? res.status(200).json({ item }) : res.status(404).json({ error: "Queue item not found." });
    }
    if (action === "send_telegram") {
      const { rows } = await (await import("@/lib/db")).query("SELECT message FROM job_distribution_queue WHERE id=$1 AND channel='telegram'", [id]);
      if (!rows[0]) return res.status(404).json({ error: "Telegram queue item not found." });
      const sent = await sendTelegramMessage(rows[0].message);
      const item = await updateDistributionItem(id, "posted");
      return res.status(200).json({ item, telegramMessageId: sent.message_id });
    }
    return res.status(400).json({ error: "Unsupported action." });
  } catch (error) {
    console.error("distribution action error:", error.message);
    await updateDistributionItem(id, "failed", error.message).catch(() => {});
    return res.status(502).json({ error: error.message || "Distribution action failed." });
  }
});
