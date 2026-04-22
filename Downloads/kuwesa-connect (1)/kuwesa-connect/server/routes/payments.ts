import { Router, Request, Response } from "express";
import { db } from "../db";
import { payments, members, welfareCampaigns } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";
import crypto from "node:crypto";

const router = Router();

const pesapalBaseUrl = (env: string) =>
  env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

async function getPesapalToken() {
  const env = process.env.PESAPAL_ENV || "live";
  const r = await fetch(`${pesapalBaseUrl(env)}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  const j = await r.json() as any;
  if (!j.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(j)}`);
  return j.token as string;
}

router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      purpose, memberId, campaignId, amount, payerName, payerPhone, payerEmail, description,
    } = req.body;

    const numericAmount = Number(amount);
    if (!purpose || !numericAmount || numericAmount <= 0 || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const env = process.env.PESAPAL_ENV || "live";
    const ipnId = process.env.PESAPAL_IPN_ID;
    const appBase = process.env.APP_BASE_URL || `https://${req.get("host")}`;

    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return res.status(500).json({ error: "Pesapal is not configured. Admin must set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET." });
    }
    if (!ipnId) {
      return res.status(500).json({ error: "PESAPAL_IPN_ID is not set." });
    }

    const merchantRef = crypto.randomUUID();

    const [payment] = await db.insert(payments).values({
      purpose,
      memberId: memberId || null,
      campaignId: campaignId || null,
      payerName,
      payerPhone,
      payerEmail: payerEmail || null,
      amount: String(numericAmount),
      currency: "KES",
      merchantReference: merchantRef,
      status: "PENDING",
    }).returning();

    const token = await getPesapalToken();
    const orderRes = await fetch(`${pesapalBaseUrl(env)}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: merchantRef,
        currency: "KES",
        amount: numericAmount,
        description: description || (purpose === "membership" ? "KUWESA Membership Fee" : "KUWESA Welfare Contribution"),
        callback_url: `${appBase}/payment/success?ref=${merchantRef}`,
        notification_id: ipnId,
        billing_address: {
          email_address: payerEmail || undefined,
          phone_number: payerPhone,
          first_name: payerName.split(" ")[0] || payerName,
          last_name: payerName.split(" ").slice(1).join(" ") || "-",
        },
      }),
    });

    const orderJson = await orderRes.json() as any;
    if (!orderJson.redirect_url) {
      await db.update(payments).set({ status: "FAILED", rawCallback: orderJson }).where(eq(payments.merchantReference, merchantRef));
      return res.status(500).json({ error: `Pesapal order failed: ${JSON.stringify(orderJson)}` });
    }

    await db.update(payments).set({
      pesapalTrackingId: orderJson.order_tracking_id,
      pesapalRedirectUrl: orderJson.redirect_url,
    }).where(eq(payments.merchantReference, merchantRef));

    return res.json({
      redirect_url: orderJson.redirect_url,
      merchant_reference: merchantRef,
      order_tracking_id: orderJson.order_tracking_id,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

router.get("/ipn", async (req: Request, res: Response) => {
  try {
    const orderTrackingId = String(req.query.OrderTrackingId || req.query.orderTrackingId || "");
    const merchantReference = String(req.query.OrderMerchantReference || req.query.merchantReference || "");

    if (!orderTrackingId || !merchantReference) {
      return res.status(400).json({ error: "Missing OrderTrackingId or OrderMerchantReference" });
    }

    const result = await processStatus(orderTrackingId, merchantReference);
    return res.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
      paymentStatus: result.status,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
});

async function processStatus(orderTrackingId: string, merchantReference: string) {
  const env = process.env.PESAPAL_ENV || "live";
  const token = await getPesapalToken();
  const r = await fetch(
    `${pesapalBaseUrl(env)}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
  );
  const statusData = await r.json() as any;

  let newStatus = "PENDING";
  if (statusData.status_code === 1 || statusData.payment_status_description === "Completed") newStatus = "COMPLETED";
  else if (statusData.status_code === 2) newStatus = "FAILED";
  else if (statusData.status_code === 0) newStatus = "INVALID";
  else if (statusData.status_code === 3) newStatus = "REVERSED";

  const [payment] = await db.update(payments)
    .set({ status: newStatus, pesapalTrackingId: orderTrackingId, rawCallback: statusData, updatedAt: new Date() })
    .where(eq(payments.merchantReference, merchantReference))
    .returning();

  if (newStatus === "COMPLETED" && payment) {
    if (payment.purpose === "membership" && payment.memberId) {
      await db.update(members).set({ status: "Paid" }).where(eq(members.id, payment.memberId));
    }
    if (payment.purpose === "welfare" && payment.campaignId) {
      const [camp] = await db.select({ raisedAmount: welfareCampaigns.raisedAmount })
        .from(welfareCampaigns).where(eq(welfareCampaigns.id, payment.campaignId));
      const current = Number(camp?.raisedAmount || 0);
      await db.update(welfareCampaigns)
        .set({ raisedAmount: String(current + Number(payment.amount)) })
        .where(eq(welfareCampaigns.id, payment.campaignId));
    }
  }

  return { status: newStatus, payment };
}

router.get("/status", async (req: Request, res: Response) => {
  const { ref } = req.query;
  if (!ref) return res.status(400).json({ error: "ref required" });
  const [row] = await db.select({ status: payments.status, purpose: payments.purpose })
    .from(payments).where(eq(payments.merchantReference, String(ref)));
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(row);
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200);
  return res.json(rows);
});

export default router;
