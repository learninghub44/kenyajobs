// Pesapal — Create Order edge function
// Deploy: supabase functions deploy pesapal-create --no-verify-jwt
//
// Required secrets (Supabase → Edge Functions → Secrets):
//   PESAPAL_CONSUMER_KEY
//   PESAPAL_CONSUMER_SECRET
//   PESAPAL_ENV               = "live" or "sandbox"
//   PESAPAL_IPN_ID            = the IPN ID you registered (see PESAPAL-DEPLOY.md)
//   APP_BASE_URL              = e.g. https://yourdomain.com  (no trailing slash)
//   SUPABASE_URL              = auto-injected by Supabase
//   SUPABASE_SERVICE_ROLE_KEY = from Project Settings → API (service_role)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  if (!j.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(j)}`);
  return j.token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      purpose,        // 'membership' | 'welfare'
      memberId,       // uuid (for membership) | null
      campaignId,     // uuid (for welfare)    | null
      amount,
      payerName,
      payerPhone,
      payerEmail,
      description,
    } = body;

    if (!purpose || !amount || !payerName || !payerPhone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env = Deno.env.get("PESAPAL_ENV") || "live";
    const ipnId = Deno.env.get("PESAPAL_IPN_ID");
    const appBase = Deno.env.get("APP_BASE_URL") || "";
    if (!ipnId) throw new Error("PESAPAL_IPN_ID secret not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const merchantRef = crypto.randomUUID();

    // 1. Insert payment row (PENDING)
    const { error: insErr } = await supabase.from("payments").insert({
      purpose,
      member_id: memberId || null,
      campaign_id: campaignId || null,
      payer_name: payerName,
      payer_phone: payerPhone,
      payer_email: payerEmail || null,
      amount,
      currency: "KES",
      merchant_reference: merchantRef,
      status: "PENDING",
    });
    if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);

    // 2. Get token & submit order
    const token = await getToken();
    const orderRes = await fetch(`${baseUrl(env)}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: merchantRef,
        currency: "KES",
        amount: Number(amount),
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

    const orderJson = await orderRes.json();
    if (!orderJson.redirect_url) {
      await supabase.from("payments").update({
        status: "FAILED",
        raw_callback: orderJson,
      }).eq("merchant_reference", merchantRef);
      throw new Error(`Pesapal order failed: ${JSON.stringify(orderJson)}`);
    }

    // 3. Save tracking id + redirect
    await supabase.from("payments").update({
      pesapal_tracking_id: orderJson.order_tracking_id,
      pesapal_redirect_url: orderJson.redirect_url,
    }).eq("merchant_reference", merchantRef);

    return new Response(JSON.stringify({
      redirect_url: orderJson.redirect_url,
      merchant_reference: merchantRef,
      order_tracking_id: orderJson.order_tracking_id,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
