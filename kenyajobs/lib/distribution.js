import { query } from "@/lib/db";

export const DEFAULT_SOCIAL_SETTINGS = {
  whatsapp_channel_url: "https://whatsapp.com/channel/0029Vb9ItcdJf05hVwnE3w2C",
  telegram_channel_url: "https://t.me/+JN0rNZmNbGlkN2I0",
  whatsapp_enabled: true, telegram_enabled: true, auto_queue: true,
  approval_required: true, kenya_enabled: true, africa_enabled: true, remote_enabled: true,
};

export async function getSocialSettings() {
  const { rows } = await query("SELECT * FROM social_channel_settings WHERE id = 1");
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
  await query(
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

function cleanText(value, max = 420) {
  const text = Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value || "");
  return text.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ").trim().slice(0, max);
}

function jobDetailUrl(job) {
  const id = String(job.id || job.job_id || "").trim();
  if (!id) return "";
  const siteUrl = (process.env.SITE_URL || "https://onlinejobs.christech.co.ke").replace(/\/$/, "");
  return `${siteUrl}/job/${encodeURIComponent(id)}`;
}

export function formatJobAnnouncement(job = {}, category = "kenya") {
  const title = cleanText(job.title || job.job_title || "Job opportunity", 160);
  const company = cleanText(job.company || job.company_name || job.employer_name || "Company", 120);
  const location = cleanText(job.location || job.candidate_required_location || job.job_city || "Not specified", 100);
  const type = cleanText(job.type || job.job_type || job.employment_type || "Not specified", 80);
  const salary = cleanText(job.salary || "", 100);
  const experience = cleanText(job.experience || job.experience_level || job.seniority || "", 100);
  const deadline = cleanText(job.application_deadline || job.deadline || job.expiryDate || job.expiry_date || "", 80);
  const requirements = cleanText(job.requirements || job.qualifications || job.job_requirements || job.skills_required || "", 420);
  const description = cleanText(job.description || job.job_description || "", 320);
  const detailUrl = jobDetailUrl(job);
  const label = category === "remote" ? "WORLDWIDE REMOTE OPPORTUNITY" : category === "africa" ? "AFRICA JOB OPPORTUNITY" : "KENYA JOB OPPORTUNITY";
  const source = cleanText(job.source || "Original employer / job board", 80);
  const lines = [
    `📢 ${label}`, "",
    `💼 ${title}`,
    `🏢 Employer: ${company}`,
    `📍 Location: ${location}`,
    `🕒 Employment: ${type}`,
    salary ? `💰 Salary: ${salary}` : "",
    experience ? `🎓 Experience: ${experience}` : "",
    deadline ? `📅 Application deadline: ${deadline}` : "",
    requirements ? `\n✅ KEY REQUIREMENTS\n${requirements}` : "",
    description ? `\nABOUT THE ROLE\n${description}` : "",
    `\n🔎 Source: ${source}`,
    detailUrl ? `\n👉 VIEW FULL DETAILS & APPLY: ${detailUrl}` : `\n👉 Browse opportunities: ${(process.env.SITE_URL || "https://onlinejobs.christech.co.ke").replace(/\/$/, "")}`,
    "",
    "Open the job page to review the full description, requirements and application instructions. Applications are completed through the original employer or job-board link.",
    "",
    "Follow JOBS HUB KENYA for more opportunities."
  ];
  return lines.filter(Boolean).join("\n").slice(0, 3500);
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
  for (const job of jobs) {
    if (!job || !(job.id || job.job_id) || isExpired(job)) continue;
    const category = classifyJob(job, route);
    if (!category || !settings[`${category}_enabled`]) continue;
    const jobId = String(job.id || job.job_id);
    for (const channel of channels) {
      const result = await query(
        `INSERT INTO job_distribution_queue (job_id, channel, category, payload, message, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4::jsonb,$5,$6,now(),now())
         ON CONFLICT (job_id, channel) DO NOTHING RETURNING id`,
        [jobId,channel,category,JSON.stringify(job),formatJobAnnouncement(job,category),settings.approval_required ? "pending_approval" : "ready"]
      );
      if (result.rowCount) {
        queued += 1;
        await query("INSERT INTO job_distribution_logs (queue_id,action,status,detail) VALUES ($1,'queued',$2,$3)", [result.rows[0].id, settings.approval_required ? "pending_approval" : "ready", `Auto-queued from ${route || "manual job entry"}`]);
      }
    }
  }
  return { queued };
}

export async function listDistributionQueue({ limit = 100 } = {}) {
  const { rows } = await query("SELECT id, job_id, channel, category, payload, message, status, error, created_at, updated_at, posted_at FROM job_distribution_queue ORDER BY created_at DESC LIMIT $1",[Math.min(Math.max(Number(limit)||100,1),200)]);
  return rows;
}

export async function updateDistributionItem(id, status, error = null, expectedStatuses = null, action = "status_changed") {
  const allowed = ["pending_approval","ready","posted","failed"];
  if (!allowed.includes(status)) throw new Error("Invalid distribution status.");
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
