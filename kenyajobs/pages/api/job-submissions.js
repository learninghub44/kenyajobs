import crypto from "crypto";
import { query } from "@/lib/db";
import { getPackage } from "@/lib/packages";

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const clip = (value, max = 5000) => String(value || "").trim().slice(0, max);
const ALLOWED_CATEGORIES = ["remote", "entry", "graduate", "wfh", "general"];

function validUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}
function validApplicationDestination(value) {
  const input = String(value || "").trim();
  if (/^mailto:/i.test(input)) {
    const email = input.slice(7).split("?")[0];
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  }
  return validUrl(input);
}

function responseForSubmission(row) {
  return {
    ok: true,
    reference: row.id,
    jobId: row.job_id || null,
    status: row.status,
    autoPublished: row.status === "approved" && Boolean(row.job_id),
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    const token = String(req.query.invite || "");
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
      return res.status(404).json({ error: "This posting link is invalid or expired." });
    }
    try {
      const { rows } = await query(
        "SELECT label,auto_publish,max_uses,uses FROM job_posting_links WHERE token_hash=$1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now()) AND uses<max_uses",
        [hash(token)]
      );
      if (!rows[0]) return res.status(404).json({ error: "This posting link is invalid, expired, or has reached its usage limit." });
      return res.status(200).json({
        label: rows[0].label,
        autoPublish: false,
        reviewRequired: true,
        remaining: rows[0].max_uses - rows[0].uses,
      });
    } catch (error) {
      console.error("posting link validation:", error.message);
      return res.status(503).json({ error: "Could not verify this posting link." });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body || {};
  // Honeypot field catches basic automated form submissions without revealing the check.
  if (clip(body.website, 200)) return res.status(200).json({ ok: true, reference: "received" });

  const submissionKey = clip(body.submissionKey, 80);
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(submissionKey)) {
    return res.status(400).json({ error: "Refresh the form and try submitting again." });
  }

  const fields = {
    title: clip(body.title, 180),
    company: clip(body.company, 180),
    contactName: clip(body.contactName, 120),
    email: clip(body.email, 254).toLowerCase(),
    phone: clip(body.phone, 30),
    packageCode: clip(body.packageCode, 50),
    location: clip(body.location, 180) || "Kenya",
    type: clip(body.type, 80) || "Full-time",
    salary: clip(body.salary, 120),
    description: clip(body.description, 12000),
    requirements: clip(body.requirements, 8000),
    responsibilities: clip(body.responsibilities, 8000),
    qualifications: clip(body.qualifications, 5000),
    experience: clip(body.experience, 300),
    education: clip(body.education, 500),
    benefits: clip(body.benefits, 5000),
    applicationDeadline: clip(body.applicationDeadline, 30),
    url: clip(body.url, 2048),
    applicationMethod: clip(body.applicationMethod, 30),
    applicationEmail: clip(body.applicationEmail, 254).toLowerCase(),
    applicationInstructions: clip(body.applicationInstructions, 5000),
    companyWebsite: clip(body.companyWebsite, 2048),
    companyLogo: clip(body.companyLogo, 2048),
    categories: Array.isArray(body.categories)
      ? [...new Set(body.categories.filter((item) => ALLOWED_CATEGORIES.includes(item)))]
      : [],
  };

  for (const key of ["title", "company", "contactName", "email", "phone", "description", "url", "packageCode"]) {
    if (!fields[key]) return res.status(400).json({ error: key + " is required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return res.status(400).json({ error: "Enter a valid contact email." });
  }
  const digits = fields.phone.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return res.status(400).json({ error: "Enter a valid phone number with country code." });
  const selectedPackage = getPackage("jobs", fields.packageCode);
  if (!selectedPackage) return res.status(400).json({ error: "Choose a valid job promotion package." });
  if (String(body.title||"").length > selectedPackage.limits.title || String(body.description||"").length > selectedPackage.limits.description) return res.status(400).json({ error: "The job title or description exceeds the selected package limits." });
  const inferredMethod = /^mailto:/i.test(fields.url) ? "email" : /^https:\/\/(?:forms\.gle\/|docs\.google\.com\/forms\/)/i.test(fields.url) ? "google_form" : "website";
  fields.applicationMethod = ["website","google_form","email"].includes(fields.applicationMethod) ? fields.applicationMethod : inferredMethod;
  if (fields.applicationMethod === "email" && !/^mailto:/i.test(fields.url)) fields.url = "mailto:" + fields.applicationEmail;
  if (fields.applicationMethod === "email") fields.applicationEmail = fields.url.replace(/^mailto:/i, "").split("?")[0].toLowerCase();
  if (!validApplicationDestination(fields.url) || (fields.companyWebsite && !validUrl(fields.companyWebsite)) || (fields.applicationMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.applicationEmail))) {
    return res.status(400).json({ error: "Use a valid application website, Google Forms link, or mailto application email. Company website must be a valid http or https link." });
  }
  // A company logo is optional. Ignore an invalid optional logo rather than
  // rejecting an otherwise valid job submission.
  if (fields.companyLogo && !validUrl(fields.companyLogo)) fields.companyLogo = "";
  if (fields.applicationDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(fields.applicationDeadline)) {
    return res.status(400).json({ error: "Application deadline must use YYYY-MM-DD." });
  }

  try {
    // Return an existing record for a retried request; never create duplicate jobs.
    const existing = await query(
      "SELECT id,status,job_id FROM job_submissions WHERE submission_key=$1",
      [submissionKey]
    );
    if (existing.rows[0]) return res.status(200).json(responseForSubmission(existing.rows[0]));

    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const ip = forwarded || req.socket?.remoteAddress || "unknown";
    const ipHash = hash((process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "jobs-hub-rate-limit") + ":" + ip);
    const rate = await query(
      "SELECT count(*)::int AS total FROM job_submissions WHERE ip_hash=$1 AND created_at>now()-interval '1 hour'",
      [ipHash]
    );
    if (rate.rows[0]?.total >= 8) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }

    let link = null;
    const token = String(body.postingToken || "");
    if (token) {
      if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
        return res.status(404).json({ error: "This posting link is invalid or expired." });
      }
      const reserved = await query(
        "UPDATE job_posting_links SET uses=uses+1 WHERE token_hash=$1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>now()) AND uses<max_uses RETURNING id,label,auto_publish",
        [hash(token)]
      );
      if (!reserved.rows[0]) {
        return res.status(404).json({ error: "This posting link is invalid, expired, or has reached its usage limit." });
      }
      link = reserved.rows[0];
    }

    // Save the submission first. If the publishing service is temporarily unavailable,
    // the employer's details remain safely queued for admin review.
    const saved = await query(
      `INSERT INTO job_submissions(
        title,company,contact_name,email,location,type,salary,description,requirements,responsibilities,
        qualifications,experience,education,benefits,application_deadline,application_url,application_instructions,
        company_website,company_logo,categories,status,posting_link_id,ip_hash,submission_key,phone,package_code,package_price,package_duration_days,application_method,application_email
      ) VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'pending',$21,$22,$23,$24,$25,$26,$27,$28,$29
      ) ON CONFLICT(submission_key) WHERE submission_key IS NOT NULL DO NOTHING RETURNING id,status,job_id`,
      [
        fields.title, fields.company, fields.contactName, fields.email, fields.location, fields.type,
        fields.salary || null, fields.description, fields.requirements, fields.responsibilities,
        fields.qualifications, fields.experience, fields.education, fields.benefits,
        fields.applicationDeadline || null, fields.url, fields.applicationInstructions,
        fields.companyWebsite || null, fields.companyLogo || null, fields.categories,
        link?.id || null, ipHash, submissionKey, fields.phone, selectedPackage.code, selectedPackage.price, selectedPackage.durationDays, fields.applicationMethod, fields.applicationMethod === "email" ? fields.applicationEmail : null,
      ]
    );

    if (!saved.rows[0]) {
      const duplicate = await query(
        "SELECT id,status,job_id FROM job_submissions WHERE submission_key=$1",
        [submissionKey]
      );
      if (duplicate.rows[0]) return res.status(200).json(responseForSubmission(duplicate.rows[0]));
      return res.status(409).json({ error: "This submission is already being processed. Please refresh and check again." });
    }

    return res.status(201).json({
      ok: true,
      reference: saved.rows[0].id,
      status: "pending",
      autoPublished: false,
      package: { name: selectedPackage.name, price: selectedPackage.price, durationDays: selectedPackage.durationDays },
      message: "The admin team will contact you to confirm the package, payment and publication schedule.",
    });
  } catch (error) {
    console.error("job submission:", error.message);
    return res.status(503).json({ error: "We could not save this job. Please try again later." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
