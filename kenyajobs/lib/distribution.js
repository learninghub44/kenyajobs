import { createHash } from "node:crypto";
import { query, rawQuery } from "@/lib/db";
import { isDeadlinePassed, formatJobRef, WORK_MODES } from "@/lib/jobOptions";
import { isEmploymentVacancy, getEmploymentRejectionReason } from "@/lib/jobValidation";

// The social_channel_settings table is created by supabase/migrations; this only
// makes sure the singleton settings row exists (plain DML, no schema changes).
let socialSettingsRowReady;
async function ensureSocialSettingsTable() {
  if (!socialSettingsRowReady) {
    socialSettingsRowReady = rawQuery("INSERT INTO social_channel_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING")
      .catch((error) => { socialSettingsRowReady = null; throw error; });
  }
  return socialSettingsRowReady;
}

export const DEFAULT_SOCIAL_SETTINGS = {
  whatsapp_channel_url: "https://whatsapp.com/channel/0029Vb9ItcdJf05hVwnE3w2C",
  telegram_channel_url: "https://t.me/+JN0rNZmNbGlkN2I0",
  whatsapp_enabled: true, telegram_enabled: true, auto_queue: true,
  approval_required: true, kenya_enabled: true, africa_enabled: true, remote_enabled: true,
};

export async function getSocialSettings() {
  await ensureSocialSettingsTable();
  const { rows } = await rawQuery("SELECT * FROM social_channel_settings WHERE id = 1");
  return { ...DEFAULT_SOCIAL_SETTINGS, ...(rows[0] || {}) };
}

export async function saveSocialSettings(input = {}) {
  const allowed = ["whatsapp_channel_url","telegram_channel_url","whatsapp_enabled","telegram_enabled","auto_queue","approval_required","kenya_enabled","africa_enabled","remote_enabled"];
  const next = { ...(await getSocialSettings()) };
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(input, key)) next[key] = input[key];
  for (const [key, hosts] of Object.entries({
    whatsapp_channel_url: ["whatsapp.com", "www.whatsapp.com"],
    telegram_channel_url: ["t.me", "www.t.me", "telegram.me", "www.telegram.me"],
  })) {
    const value = String(next[key] || "").trim();
    if (value) {
      let parsed;
      try { parsed = new URL(value); } catch { throw new Error(`${key} must be a valid channel URL.`); }
      if (parsed.protocol !== "https:" || !hosts.includes(parsed.hostname.toLowerCase()) || value.length > 500) {
        throw new Error(`${key} must use an official ${key.startsWith("whatsapp") ? "WhatsApp" : "Telegram"} channel domain.`);
      }
    }
    next[key] = value;
  }
  for (const key of ["whatsapp_enabled","telegram_enabled","auto_queue","approval_required","kenya_enabled","africa_enabled","remote_enabled"]) next[key] = Boolean(next[key]);
  await ensureSocialSettingsTable();
  await rawQuery(
    `INSERT INTO social_channel_settings
      (id, whatsapp_channel_url, telegram_channel_url, whatsapp_enabled, telegram_enabled, auto_queue, approval_required, kenya_enabled, africa_enabled, remote_enabled, updated_at)
     VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,now())
     ON CONFLICT (id) DO UPDATE SET
       whatsapp_channel_url=EXCLUDED.whatsapp_channel_url, telegram_channel_url=EXCLUDED.telegram_channel_url,
       whatsapp_enabled=EXCLUDED.whatsapp_enabled, telegram_enabled=EXCLUDED.telegram_enabled,
       auto_queue=EXCLUDED.auto_queue, approval_required=EXCLUDED.approval_required,
       kenya_enabled=EXCLUDED.kenya_enabled, africa_enabled=EXCLUDED.africa_enabled,
       remote_enabled=EXCLUDED.remote_enabled, updated_at=now()`,
    [next.whatsapp_channel_url,next.telegram_channel_url,next.whatsapp_enabled,next.telegram_enabled,next.auto_queue,next.approval_required,next.kenya_enabled,next.africa_enabled,next.remote_enabled]
  );
  return next;
}

const AFRICAN_COUNTRIES = ["kenya","uganda","tanzania","rwanda","burundi","ethiopia","somalia","south africa","nigeria","ghana","zambia","zimbabwe","malawi","mozambique","botswana","namibia","senegal","ivory coast","cote d'ivoire","cameroon","egypt","morocco","tunisia","algeria","sudan","south sudan","liberia","sierra leone","gambia","lesotho","eswatini"];
const KENYA_LOCATIONS = ["kenya","nairobi","mombasa","kisumu","nakuru","eldoret","thika","bomet","nyeri","machakos","kiambu","kakamega","garissa","kilifi","meru"];

export function classifyJob(job = {}, route = "") {
  const hint = String(route).toLowerCase();
  const location = String(job.location || job.candidate_required_location || job.job_city || "").toLowerCase();
  const type = String(job.type || job.job_type || job.employment_type || "").toLowerCase();
  if (hint.includes("remote") || /remote|work from home|worldwide|anywhere/.test(location + " " + type)) return "remote";
  if (KENYA_LOCATIONS.some((x) => location.includes(x))) return "kenya";
  if (hint.includes("africa") || AFRICAN_COUNTRIES.some((x) => location.includes(x))) return "africa";
  return "";
}

function isExpired(job = {}) {
  if (isDeadlinePassed(job.applicationDeadline)) return true;
  const expiry = job.expiryDate || job.expiry_date || job.application_deadline || job.deadline;
  if (expiry) {
    const date = new Date(expiry);
    if (!Number.isNaN(date.getTime()) && date.getTime() < Date.now()) return true;
  }
  const posted = job.date || job.publication_date || job.job_posted_at_datetime_utc;
  if (posted) {
    const date = new Date(posted);
    if (!Number.isNaN(date.getTime()) && Date.now() - date.getTime() > 45 * 86400000) return true;
  }
  return false;
}

function decodeHtmlEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(value || "").replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
    if (code[0] !== "#") return named[code.toLowerCase()] ?? entity;
    const number = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    try { return Number.isFinite(number) && number >= 0 && number <= 0x10ffff ? String.fromCodePoint(number) : " "; }
    catch { return " "; }
  });
}

function cleanText(value, max = 420) {
  let input = Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value || "");
  // Decode escaped source HTML BEFORE removing tags, or entities leak into posts.
  for (let pass = 0; pass < 2; pass += 1) {
    const decoded = decodeHtmlEntities(input);
    if (decoded === input) break;
    input = decoded;
  }
  input = input
    .replace(/\\</g, "<").replace(/\\>/g, ">")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<hr\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ");
  return input.split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, max)
    .trim();
}
function jobDetailUrl(job) {
  const id = String(job.id || job.job_id || "").trim();
  if (!id) return "";
  const siteUrl = (process.env.SITE_URL || "https://onlinejobs.christech.co.ke").replace(/\/$/, "");
  return `${siteUrl}/job/${encodeURIComponent(id)}`;
}

export function formatJobAnnouncement(job = {}, category = "kenya") {
  const title = cleanText(job.title || job.job_title || "Job opportunity", 120);
  const company = cleanText(job.company || job.company_name || job.employer_name || "Employer not specified", 90);
  const location = cleanText(job.location || job.candidate_required_location || job.job_city || "Not specified", 70);
  const type = cleanText(job.type || job.job_type || job.employment_type || "Not specified", 45);
  const base = (process.env.SITE_URL || "https://onlinejobs.christech.co.ke").replace(/\/$/, "");
  const detailUrl = jobDetailUrl(job) || base;
  const label = category === "remote" ? "REMOTE JOB" : category === "africa" ? "AFRICA JOB" : "KENYA JOB";
  const description = cleanText(job.description || job.job_description || "", 360);
  const salary = job.salary && !/^salary not disclosed$/i.test(String(job.salary)) ? cleanText(job.salary, 70) : "";
  const instructions = cleanText(job.applicationInstructions || job.application_instructions || "", 180);
  const onPlatform = job.applicationMethod === "platform";
  const ref = job.jobRef || formatJobRef(job.jobNumber);
  const mode = WORK_MODES.find((m) => m.value === job.workMode)?.label || "";
  let deadline = "";
  if (job.applicationDeadline) {
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(job.applicationDeadline)) ? `${job.applicationDeadline}T12:00:00+03:00` : job.applicationDeadline);
    if (!Number.isNaN(d.getTime())) deadline = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d);
  }
  const parts = [
    "📢 " + label, "",
    "💼 " + title,
    "🏢 Employer: " + company,
    "📍 Location: " + location,
    "🕒 Type: " + type + (mode ? " · " + mode : ""),
    salary ? "💰 Salary: " + salary : "",
    deadline ? "⏳ Deadline: " + deadline : "",
    ref ? "🔢 Job No: " + ref : "",
    description ? "\n" + description : "",
    instructions ? "\nHOW TO APPLY\n" + instructions : "",
    "",
    (onPlatform ? "✅ APPLY DIRECTLY ON JOBS HUB KENYA (free, no external forms): " : "🔗 VIEW JOB & APPLY: ") + detailUrl,
    "JOBS HUB KENYA"
  ].filter(Boolean);
  // Keep messages compact and always retain the application link.
  return parts.join("\n").slice(0, 1100);
}
function normalizedIdentity(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

export function jobDedupeKey(job = {}) {
  const applyUrl = String(job.url || job.job_url || job.apply_url || job.application_url || job.redirect_url || "").trim();
  let identity;
  if (applyUrl) {
    try {
      const parsed = new URL(applyUrl);
      parsed.hash = "";
      parsed.search = "";
      identity = "url:" + parsed.toString().replace(/\/$/, "").toLowerCase();
    } catch {
      identity = "url:" + applyUrl.split("#")[0].split("?")[0].replace(/\/$/, "").toLowerCase();
    }
  } else {
    identity = [
      normalizedIdentity(job.title || job.job_title),
      normalizedIdentity(job.company || job.company_name || job.employer_name),
      normalizedIdentity(job.location || job.candidate_required_location || job.job_city),
    ].join("|");
  }
  return createHash("md5").update(identity).digest("hex");
}

export async function enqueueJobs(jobs, route = "") {
  if (!Array.isArray(jobs) || jobs.length === 0) return { queued: 0 };
  const settings = await getSocialSettings();
  if (!settings.auto_queue) return { queued: 0, disabled: true };
  const channels = [
    ...(settings.whatsapp_enabled && settings.whatsapp_channel_url ? ["whatsapp"] : []),
    ...(settings.telegram_enabled && settings.telegram_channel_url ? ["telegram"] : []),
  ];
  if (!channels.length) return { queued: 0 };
  let queued = 0;
  const stats = { seen: jobs.length, queued: 0, rejected: 0, expired: 0, unclassified: 0, duplicateInBatch: 0 };
  const rejectedReasons = {};
  const items = [];
  const seenInBatch = new Set();
  for (const job of jobs) {
    if (!job || !(job.id || job.job_id)) { stats.rejected++; rejectedReasons.missing_id = (rejectedReasons.missing_id || 0) + 1; continue; }
    const rejectionReason = getEmploymentRejectionReason(job);
    if (rejectionReason) { stats.rejected++; rejectedReasons[rejectionReason] = (rejectedReasons[rejectionReason] || 0) + 1; continue; }
    if (isExpired(job)) { stats.expired++; continue; }
    // Jobs the owner posts from the admin are always shared; the location-based
    // categories only decide where automatically imported jobs may go.
    const category = classifyJob(job, route) || (route === "manual" ? "kenya" : "");
    if (!category || (route !== "manual" && !settings[category + "_enabled"])) { stats.unclassified++; continue; }
    const jobId = String(job.id || job.job_id);
    const dedupeKey = jobDedupeKey(job);
    if (seenInBatch.has(dedupeKey)) { stats.duplicateInBatch++; continue; }
    seenInBatch.add(dedupeKey);
    for (const channel of channels) {
      const result = await query(
        "INSERT INTO job_distribution_queue (job_id, dedupe_key, channel, category, payload, message, status, created_at, updated_at) " +
        "VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,now(),now()) " +
        "ON CONFLICT (channel, dedupe_key) DO NOTHING RETURNING id",
        [jobId,dedupeKey,channel,category,JSON.stringify(job),formatJobAnnouncement(job,category),settings.approval_required ? "pending_approval" : "ready"]
      );
      if (result.rowCount) {
        queued += 1;
        items.push({ id: result.rows[0].id, channel, message: formatJobAnnouncement(job, category), status: settings.approval_required ? "pending_approval" : "ready" });
        await query("INSERT INTO job_distribution_logs (queue_id,action,status,detail) VALUES ($1,'queued',$2,$3)", [result.rows[0].id, settings.approval_required ? "pending_approval" : "ready", `Auto-queued from ${route || "manual job entry"}`]);
      }
    }
  }
  stats.queued = queued;
  return { ...stats, rejectedReasons, items };
}

export async function listDistributionQueue({ limit = 100 } = {}) {
  const { rows } = await query("SELECT id, job_id, channel, category, payload, message, status, error, created_at, updated_at, posted_at FROM job_distribution_queue ORDER BY created_at DESC LIMIT $1",[Math.min(Math.max(Number(limit)||100,1),200)]);
  return rows.map((row) => {
    const quarantineReason = getEmploymentRejectionReason(row.payload || {});
    return quarantineReason ? { ...row, original_status: row.status, status: "quarantined", quarantined: true, quarantineReason } : row;
  });
}

export async function updateDistributionItem(id, status, error = null, expectedStatuses = null, action = "status_changed") {
  const allowed = ["pending_approval","ready","posted","failed"];
  if (!allowed.includes(status)) throw new Error("Invalid distribution status.");
  if (["ready", "posted"].includes(status)) {
    const current = await query("SELECT payload FROM job_distribution_queue WHERE id=$1", [Number(id)]);
    if (!current.rows[0] || !isEmploymentVacancy(current.rows[0].payload || {})) {
      throw new Error("This item failed vacancy validation and is quarantined. It cannot be approved or marked as published.");
    }
  }
  const { rows } = await query(
    `UPDATE job_distribution_queue SET status=$2,error=$3,
       posted_at=CASE WHEN $2='posted' THEN now() ELSE posted_at END,updated_at=now()
     WHERE id=$1 AND ($4::text[] IS NULL OR status=ANY($4::text[]))
     RETURNING id,job_id,channel,category,status,posted_at`,
    [Number(id),status,error ? String(error).slice(0,1000) : null,expectedStatuses]
  );
  if (!rows[0]) return null;
  await query("INSERT INTO job_distribution_logs (queue_id,action,status,detail) VALUES ($1,$2,$3,$4)",[Number(id),action,status,error ? String(error).slice(0,1000) : null]);
  return rows[0];
}

export async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram bot is not connected. Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the hosting environment.");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:false})});
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram API returned HTTP ${response.status}`);
  return data.result;
}

// Telegram can be posted automatically; WhatsApp channels have no posting API,
// so those items stay "ready" for the admin to copy from Admin > Distribution.
// Only items that are already approved (approval_required off) are sent, and a
// failure here never affects the job that triggered it.
export async function autoSendTelegram(items = []) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return { sent: 0 };
  let sent = 0;
  for (const item of items) {
    if (item.channel !== "telegram" || item.status !== "ready") continue;
    try {
      await sendTelegramMessage(item.message);
      await updateDistributionItem(item.id, "posted", null, ["ready"], "auto_sent_to_telegram");
      sent += 1;
    } catch (error) {
      await updateDistributionItem(item.id, "failed", error.message, ["ready"], "send_failed").catch(() => {});
      console.error("auto telegram send failed:", error.message);
    }
  }
  return { sent };
}
