import crypto from "crypto";
import { query } from "@/lib/db";
import { enqueueJobs } from "@/lib/distribution";

const VALID_CATEGORIES = ["remote", "entry", "graduate", "wfh", "general"];
function sanitizeCategories(categories) { return Array.isArray(categories) ? categories.filter((c) => VALID_CATEGORIES.includes(c)) : []; }
function rowToJob(row) {
  return {
    id: row.id, title: row.title, company: row.company, location: row.location || "Worldwide",
    type: row.type || "Full-time", date: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url, description: row.description || "", requirements: row.requirements || "",
    responsibilities: row.responsibilities || "", qualifications: row.qualifications || "",
    experience: row.experience || "", education: row.education || "", benefits: row.benefits || "",
    applicationInstructions: row.application_instructions || "", applicationDeadline: row.application_deadline || "",
    source: row.source || "Online Jobs", salary: row.salary || undefined,
    companyLogo: row.company_logo || undefined, companyWebsite: row.company_website || undefined,
    categories: row.categories || [], featured: Boolean(row.featured_until ? new Date(row.featured_until)>new Date() : row.featured), packageCode:row.package_code||null, packagePrice:row.package_price||null, packageExpiresAt:row.package_expires_at||null, renewalStatus:row.renewal_status||null, published: Boolean(row.published), manual: true,
  };
}
export function newManualJobId() { return `manual-${crypto.randomUUID()}`; }
export async function listPublishedJobs({ category, search } = {}) {
  const conditions = ["published = true", "(package_expires_at IS NULL OR package_expires_at > now())"], params = [];
  if (category) { params.push(category); conditions.push(`$${params.length} = ANY(categories)`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(title ILIKE $${params.length} OR company ILIKE $${params.length})`); }
  const { rows } = await query(`SELECT * FROM manual_jobs WHERE ${conditions.join(" AND ")} ORDER BY featured DESC, created_at DESC`, params);
  return rows.map(rowToJob);
}
export async function getPublishedJobById(id) { const { rows } = await query("SELECT * FROM manual_jobs WHERE id=$1 AND published=true AND (package_expires_at IS NULL OR package_expires_at>now())", [id]); return rows[0] ? rowToJob(rows[0]) : null; }
export async function listAllJobs() { const { rows } = await query("SELECT * FROM manual_jobs ORDER BY created_at DESC"); return rows.map(rowToJob); }
export async function getJobById(id) { const { rows } = await query("SELECT * FROM manual_jobs WHERE id=$1", [id]); return rows[0] ? rowToJob(rows[0]) : null; }
const values = (d) => [d.title, d.company, d.location || "Worldwide", d.type || "Full-time", d.salary || null,
  d.description || "", d.url, d.companyLogo || null, d.companyWebsite || null, sanitizeCategories(d.categories),
  Boolean(d.featured), d.published !== false, "Online Jobs", d.requirements || "", d.responsibilities || "",
  d.qualifications || "", d.experience || "", d.education || "", d.benefits || "",
  d.applicationInstructions || "", d.applicationDeadline || null];
export async function createJob(data) {
  const id = newManualJobId(), v = values(data);
  const { rows } = await query(`INSERT INTO manual_jobs
    (id,title,company,location,type,salary,description,url,company_logo,company_website,categories,featured,published,source,requirements,responsibilities,qualifications,experience,education,benefits,application_instructions,application_deadline)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`, [id,...v]);
  const job = rowToJob(rows[0]); if (job.published) await enqueueJobs([job], "manual"); return job;
}
export async function updateJob(id, data) {
  const v = values(data);
  const { rows } = await query(`UPDATE manual_jobs SET title=$2,company=$3,location=$4,type=$5,salary=$6,description=$7,url=$8,company_logo=$9,company_website=$10,categories=$11,featured=$12,published=$13,source=$14,requirements=$15,responsibilities=$16,qualifications=$17,experience=$18,education=$19,benefits=$20,application_instructions=$21,application_deadline=$22,updated_at=now() WHERE id=$1 RETURNING *`, [id,...v]);
  const job = rows[0] ? rowToJob(rows[0]) : null; if (job?.published) await enqueueJobs([job], "manual"); return job;
}
export async function deleteJob(id) { await query("DELETE FROM manual_jobs WHERE id=$1", [id]); }
export { VALID_CATEGORIES };
