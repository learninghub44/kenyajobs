import crypto from "crypto";
import { query } from "@/lib/db";
import { createJob } from "@/lib/manualJobs";
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
        autoPublish: rows[0].auto_publish,
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
  const selectedPackage = getPackage("jobs", fields.packageCode);
  if (!selectedPackage) return res.status(400).json({ error: "Choose a valid job promotion package." });
  if (
    !validUrl(fields.url) ||
    (fields.companyWebsite && !validUrl(fields.companyWebsite)) ||
    (fields.companyLogo && !validUrl(fields.companyLogo))
  ) {
    return res.status(400).json({ error: "Use valid http or https links for application, company website and logo." });
  }
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
        company_website,company_logo,categories,status,posting_link_id,ip_hash,submission_key,phone,package_code,package_price,package_duration_days
      ) VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'pending',$21,$22,$23,$24,$25,$26,$27
      ) ON CONFLICT(submission_key) WHERE submission_key IS NOT NULL DO NOTHING RETURNING id,status,job_id`,
      [
        fields.title, fields.company, fields.contactName, fields.email, fields.location, fields.type,
        fields.salary || null, fields.description, fields.requirements, fields.responsibilities,
        fields.qualifications, fields.experience, fields.education, fields.benefits,
        fields.applicationDeadline || null, fields.url, fields.applicationInstructions,
        fields.companyWebsite || null, fields.companyLogo || null, fields.categories,
        link?.id || null, ipHash, submissionKey, fields.phone, selectedPackage.code, selectedPackage.price, selectedPackage.durationDays,
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

    let publishedJob = null;
    let publishWarning = "";
    if (false && link?.auto_publish) {
      try {
        publishedJob = await createJob({
          title: fields.title,
          company: fields.company,
          location: fields.location,
          type: fields.type,
          salary: fields.salary,
          description: fields.description,
          requirements: fields.requirements,
          responsibilities: fields.responsibilities,
          qualifications: fields.qualifications,
          experience: fields.experience,
          education: fields.education,
          benefits: fields.benefits,
          categories: fields.categories,
          applicationDeadline: fields.applicationDeadline,
          url: fields.url,
          applicationInstructions: fields.applicationInstructions,
          companyWebsite: fields.companyWebsite,
          companyLogo: fields.companyLogo,
          published: true,
        });
        await query(
          "UPDATE job_submissions SET status='approved',job_id=$2,reviewed_at=now() WHERE id=$1 AND status='pending'",
          [saved.rows[0].id, publishedJob.id]
        );
      } catch (publishError) {
        console.error("automatic employer publishing:", publishError.message);
        publishWarning = "The submission was saved for admin review because automatic publishing is temporarily unavailable.";
      }
    }

    return res.status(201).json({
      ok: true,
      reference: saved.rows[0].id,
      jobId: publishedJob?.id || null,
      status: publishedJob ? "approved" : "pending",
      autoPublished: Boolean(publishedJob),
      package: { name: selectedPackage.name, price: selectedPackage.price, durationDays: selectedPackage.durationDays },
      message: publishWarning || "The admin team will contact you to confirm the package, payment and publication schedule.",
    });
  } catch (error) {
    console.error("job submission:", error.message);
    return res.status(503).json({ error: "We could not save this job. Please try again later." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
