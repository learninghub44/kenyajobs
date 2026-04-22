// Pesapal — IPN webhook + status checker
// Deploy: supabase functions deploy pesapal-ipn --no-verify-jwt
//
// Pesapal calls this URL after every payment (success or failure).
// The same URL is also called by /payment/success page to verify status.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const baseUrl = (env: string) =>
  env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

async function getToken() {
  const env = Deno.env.get("PESAPAL_ENV") || "live";
  const r = await fetch(`${baseUrl(env)}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: Deno.env.get("PESAPAL_CONSUMER_KEY"),
      consumer_secret: Deno.env.get("PESAPAL_CONSUMER_SECRET"),
    }),
  });
  const j = await r.json();
  return j.token as string;
}

async function getTransactionStatus(orderTrackingId: string) {
  const env = Deno.env.get("PESAPAL_ENV") || "live";
  const token = await getToken();
  const r = await fetch(
    `${baseUrl(env)}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
  );
  return await r.json();
}

async function processStatus(supabase: any, orderTrackingId: string, merchantReference: string) {
  const status = await getTransactionStatus(orderTrackingId);

  // status.status_code: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
  let newStatus = "PENDING";
  if (status.status_code === 1 || status.payment_status_description === "Completed") newStatus = "COMPLETED";
  else if (status.status_code === 2) newStatus = "FAILED";
  else if (status.status_code === 0) newStatus = "INVALID";
  else if (status.status_code === 3) newStatus = "REVERSED";

  // Update payment row
  const { data: payment } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      pesapal_tracking_id: orderTrackingId,
      raw_callback: status,
      updated_at: new Date().toISOString(),
    })
    .eq("merchant_reference", merchantReference)
    .select()
    .single();

  // Side-effects on success
  if (newStatus === "COMPLETED" && payment) {
    if (payment.purpose === "membership" && payment.member_id) {
      await supabase.from("members").update({ status: "Paid" }).eq("id", payment.member_id);
    }
    if (payment.purpose === "welfare" && payment.campaign_id) {
      // Increment raised_amount
      const { data: c } = await supabase
        .from("welfare_campaigns").select("raised_amount").eq("id", payment.campaign_id).single();
      const current = Number(c?.raised_amount || 0);
      await supabase.from("welfare_campaigns")
        .update({ raised_amount: current + Number(payment.amount) })
        .eq("id", payment.campaign_id);
    }
  }

  return { status: newStatus, payment };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const orderTrackingId =
      url.searchParams.get("OrderTrackingId") || url.searchParams.get("orderTrackingId") || "";
    const merchantReference =
      url.searchParams.get("OrderMerchantReference") || url.searchParams.get("merchantReference") || "";

    if (!orderTrackingId || !merchantReference) {
      return new Response(JSON.stringify({ error: "Missing OrderTrackingId or OrderMerchantReference" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await processStatus(supabase, orderTrackingId, merchantReference);

    // Pesapal expects this exact shape in IPN response
    return new Response(JSON.stringify({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
      paymentStatus: result.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
