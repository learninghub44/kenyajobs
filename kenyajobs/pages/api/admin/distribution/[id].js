import { requireAdmin } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { updateDistributionItem, sendTelegramMessage } from "@/lib/distribution";
import { isEmploymentVacancy } from "@/lib/jobValidation";

export default requireAdmin(async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid queue item." });
  const { action } = req.body || {};
  try {
    if (action === "approve") {
      const item = await updateDistributionItem(id,"ready",null,["pending_approval"],"approved");
      return item ? res.status(200).json({item}) : res.status(409).json({error:"Only items awaiting approval can be approved."});
    }
    if (action === "mark_posted") {
      const item = await updateDistributionItem(id,"posted",null,["ready"],"marked_published");
      return item ? res.status(200).json({item}) : res.status(409).json({error:"Approve the announcement first. Only ready items can be marked published."});
    }
    if (action === "retry") {
      const item = await updateDistributionItem(id,"ready",null,["failed"],"retried");
      return item ? res.status(200).json({item}) : res.status(409).json({error:"Only failed items can be retried."});
    }
    if (action === "send_telegram") {
      const {rows} = await query("SELECT message,status,payload FROM job_distribution_queue WHERE id=$1 AND channel='telegram'",[id]);
      if (!rows[0]) return res.status(404).json({error:"Telegram queue item not found."});
      if (!isEmploymentVacancy(rows[0].payload || {})) return res.status(409).json({error:"This item failed vacancy validation and is quarantined. It cannot be sent."});
      if (rows[0].status !== "ready") return res.status(409).json({error:"Approve this announcement before sending it."});
      const sent = await sendTelegramMessage(rows[0].message);
      const item = await updateDistributionItem(id,"posted",null,["ready"],"sent_to_telegram");
      if (!item) return res.status(409).json({error:"Telegram sent, but queue status changed concurrently. Check the channel before retrying."});
      return res.status(200).json({item,telegramMessageId:sent.message_id});
    }
    return res.status(400).json({error:"Unsupported action."});
  } catch (error) {
    console.error("distribution action error:",error.message);
    await updateDistributionItem(id,"failed",error.message,["ready"],"send_failed").catch(()=>{});
    return res.status(502).json({error:"Could not complete that distribution action. Please try again."});
  }
});
