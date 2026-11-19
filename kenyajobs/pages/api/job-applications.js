// Public: candidates apply for a job through JOBS HUB KENYA.
import crypto from "crypto";
import { query, withTransaction } from "@/lib/db";
import { sendApiError } from "@/lib/dbErrors";
import { getPublishedJobById } from "@/lib/manualJobs";
import { isDeadlinePassed } from "@/lib/jobOptions";

const MAX_RESUME_BYTES = 3 * 1024 * 1024; // base64 in JSON must stay under Vercel's 4.5 MB request limit
const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");
const clip = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);
const validUrl = (v) => { try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; } };

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (clip(body.website, 200)) return res.status(200).json({ ok: true, reference: "received" }); // honeypot

  const submissionKey = clip(body.submissionKey, 80);
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(submissionKey)) return res.status(400).json({ error: "Refresh the page and try submitting again." });

  const f = {
    jobId: clip(body.jobId, 120),
    firstName: clip(body.firstName, 80), lastName: clip(body.lastName, 80),
    email: clip(body.email, 254).toLowerCase(), phone: clip(body.phone, 20).replace(/[\s()-]/g, ""),
    address: clip(body.address, 200),
    linkedin: clip(body.linkedin, 500), portfolio: clip(body.portfolio, 500),
    workProfile: clip(body.workProfile, 500), workSamples: clip(body.workSamples, 500),
    howHeard: clip(body.howHeard, 100),
    whatsappUpdates: body.whatsappUpdates === true, marketingOptOut: body.marketingOptOut === true,
  };
  if (!f.jobId || !f.firstName || !f.lastName) return res.status(400).json({ error: "Enter your first and last name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (!/^\+\d{8,15}$/.test(f.phone)) return res.status(400).json({ error: "Enter a valid phone number with country code." });
  if (body.acceptTerms !== true) return res.status(400).json({ error: "Please accept the Terms and Conditions to apply." });
  for (const [label, key] of [["LinkedIn", "linkedin"], ["Portfolio", "portfolio"], ["Work profile", "workProfile"], ["Work samples", "workSamples"]]) {
    if (f[key] && !validUrl(f[key])) return res.status(400).json({ error: `${label} must be a valid link starting with https://` });
  }

  // Resume: PDF only, verified by content rather than by the name the browser reports.
  const resume = body.resume && typeof body.resume === "object" ? body.resume : {};
  const b64 = String(resume.data || "").replace(/^data:[^,]*,/, "");
  if (!b64) return res.status(400).json({ error: "Upload your resume as a PDF." });
  const file = Buffer.from(b64, "base64");
  if (!file.length || file.length > MAX_RESUME_BYTES) return res.status(400).json({ error: "Your resume must be a PDF under 3 MB." });
  if (file.subarray(0, 5).toString("latin1") !== "%PDF-") return res.status(400).json({ error: "Your resume must be a valid PDF file." });
  const filename = (clip(resume.name, 120).replace(/[^\w.\- ]+/g, "_").replace(/\.pdf$/i, "") || "resume") + ".pdf";

  try {
    const existing = await query("SELECT id FROM job_applications WHERE submission_key=$1", [submissionKey]);
    if (existing.rows[0]) return res.status(200).json({ ok: true, reference: `APP-${existing.rows[0].id}` }); // retried request

    const job = await getPublishedJobById(f.jobId);
    if (!job) return res.status(404).json({ error: "This job is no longer available." });
    if (job.applicationMethod !== "platform") return res.status(400).json({ error: "This job does not accept applications on JOBS HUB KENYA. Use the application link on the job page." });
    if (isDeadlinePassed(job.applicationDeadline)) return res.status(410).json({ error: "The application deadline for this job has passed." });

    const needs = job.requiredDocuments || ["resume"];
    for (const [doc, key, label] of [["portfolio", "portfolio", "portfolio link"], ["linkedin", "linkedin", "LinkedIn profile"], ["work_profile", "workProfile", "work profile link"], ["work_samples", "workSamples", "work samples link"]]) {
      if (needs.includes(doc) && !f[key]) return res.status(400).json({ error: `This employer requires a ${label}.` });
    }

    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const ipHash = hash((process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "jobs-hub-rate-limit") + ":apply:" + (forwarded || req.socket?.remoteAddress || "unknown"));
    const rate = await query("SELECT count(*)::int AS total FROM job_applications WHERE ip_hash=$1 AND created_at>now()-interval '1 hour'", [ipHash]);
    if (rate.rows[0].total >= 10) return res.status(429).json({ error: "Too many applications from this connection. Please try again later." });

    const id = await withTransaction(async (client) => {
      const ins = await client.query(
        `INSERT INTO job_applications(job_id,job_number,job_title,company,first_name,last_name,email,phone,address,linkedin_url,portfolio_url,
           work_profile_url,work_samples_url,how_heard,whatsapp_updates,marketing_opt_out,terms_accepted_at,resume_filename,resume_size,ip_hash,submission_key)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now(),$17,$18,$19,$20) RETURNING id`,
        [job.id, job.jobNumber, job.title, job.company, f.firstName, f.lastName, f.email, f.phone, f.address || null, f.linkedin || null, f.portfolio || null,
         f.workProfile || null, f.workSamples || null, f.howHeard || null, f.whatsappUpdates, f.marketingOptOut, filename, file.length, ipHash, submissionKey]
      );
      await client.query("INSERT INTO job_application_files(application_id,data) VALUES($1,$2)", [ins.rows[0].id, file]);
      return ins.rows[0].id;
    });
    return res.status(201).json({ ok: true, reference: `APP-${id}`, jobRef: job.jobRef, title: job.title, company: job.company });
  } catch (error) {
    if (error?.code === "23505" && /one_per_job_email/.test(error.constraint || "")) return res.status(409).json({ error: "You have already applied for this job with this email address." });
    if (error?.code === "23505") return res.status(200).json({ ok: true, reference: "received" }); // same submission key submitted concurrently
    return sendApiError(res, "job-applications POST", error, "We could not submit your application. Please try again.");
  }
}

export const config = { api: { bodyParser: { sizeLimit: "4.3mb" } } };
