import crypto from "crypto";
import { query } from "@/lib/db";
import { enqueueJobs } from "@/lib/distribution";
import { filterEmploymentVacancies } from "@/lib/jobValidation";
import { sanitizeJobDetails, composeSalary, formatJobRef } from "@/lib/jobOptions";

const VALID_CATEGORIES = ["remote", "entry", "graduate", "wfh", "general"];
function sanitizeCategories(categories) { return Array.isArray(categories) ? categories.filter((c) => VALID_CATEGORIES.includes(c)) : []; }
function rowToJob(row) {
  return {
    id: row.id, jobNumber: row.job_number ? Number(row.job_number) : null, jobRef: formatJobRef(row.job_number),
    workMode: row.work_mode || "", industry: row.industry || "", experienceLevel: row.experience_level || "",
    salaryMin: row.salary_min ?? null, salaryMax: row.salary_max ?? null, salaryCurrency: row.salary_currency || "KES", salaryPeriod: row.salary_period || "month",
    skills: row.skills || [], requiredDocuments: row.required_documents || ["resume"], title: row.title, company: row.company, location: row.location || "Worldwide",
    type: row.type || "Full-time", date: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url, applicationMethod: row.application_method || "website", applicationEmail: row.application_email || "", description: row.description || "", requirements: row.requirements || "",
    responsibilities: row.responsibilities || "", qualifications: row.qualifications || "",
    experience: row.experience || "", education: row.education || "", benefits: row.benefits || "",
    applicationInstructions: row.application_instructions || "", applicationDeadline: row.application_deadline || "",
    source: row.source || "Online Jobs", salary: row.salary || composeSalary({ salaryMin: row.salary_min, salaryMax: row.salary_max, salaryCurrency: row.salary_currency, salaryPeriod: row.salary_period }) || undefined,
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
  return filterEmploymentVacancies(rows.map(rowToJob));
}
export async function getPublishedJobById(id) { const { rows } = await query("SELECT * FROM manual_jobs WHERE id=$1 AND published=true AND (package_expires_at IS NULL OR package_expires_at>now())", [id]); const job = rows[0] ? rowToJob(rows[0]) : null; return job && filterEmploymentVacancies([job]).length ? job : null; }
export async function listAllJobs() { const { rows } = await query("SELECT * FROM manual_jobs ORDER BY created_at DESC"); return rows.map(rowToJob); }
export async function getJobById(id) { const { rows } = await query("SELECT * FROM manual_jobs WHERE id=$1", [id]); return rows[0] ? rowToJob(rows[0]) : null; }
const values = (d) => [d.title, d.company, d.location || "Worldwide", d.type || "Full-time", d.salary || null,
  d.description || "", d.url, d.companyLogo || null, d.companyWebsite || null, sanitizeCategories(d.categories),
  Boolean(d.featured), d.published !== false, "Online Jobs", d.requirements || "", d.responsibilities || "",
  d.qualifications || "", d.experience || "", d.education || "", d.benefits || "",
  d.applicationInstructions || "", d.applicationDeadline || null, d.applicationMethod || (/^mailto:/i.test(d.url || "") ? "email" : /^https:\/\/(?:forms\.gle\/|docs\.google\.com\/forms\/)/i.test(d.url || "") ? "google_form" : "website"), d.applicationEmail || (/^mailto:/i.test(d.url || "") ? d.url.replace(/^mailto:/i, "").split("?")[0] : null)];
// Jobs people apply for on this site have no external link: point the stored
// url at the job page itself. A structured salary range also fills the text
// salary so listings, share posts and older consumers keep working.
function prepareJobData(data, ex, id) {
  const out = { ...data };
  if (out.applicationMethod === "platform") { out.url = `/job/${id}`; out.applicationEmail = ""; }
  if (!String(out.salary || "").trim() && (ex.salaryMin != null || ex.salaryMax != null)) out.salary = composeSalary(ex);
  return out;
}
const DETAIL_COLUMNS = { workMode: "work_mode", industry: "industry", experienceLevel: "experience_level", salaryMin: "salary_min", salaryMax: "salary_max", salaryCurrency: "salary_currency", salaryPeriod: "salary_period", skills: "skills", requiredDocuments: "required_documents" };
async function saveJobDetails(id, ex, row) {
  const keys = Object.keys(ex).filter((k) => DETAIL_COLUMNS[k]);
  if (!keys.length) return row;
  const sets = keys.map((k, i) => `${DETAIL_COLUMNS[k]}=$${i + 2}`);
  const { rows } = await query(`UPDATE manual_jobs SET ${sets.join(",")} WHERE id=$1 RETURNING *`, [id, ...keys.map((k) => ex[k])]);
  return rows[0] || row;
}
export async function getPublishedJobByNumber(number) {
  const { rows } = await query("SELECT * FROM manual_jobs WHERE job_number=$1 AND published=true AND (package_expires_at IS NULL OR package_expires_at>now())", [number]);
  return rows[0] ? rowToJob(rows[0]) : null;
}
export async function createJob(rawData) {
  const id = newManualJobId(), ex = sanitizeJobDetails(rawData), data = prepareJobData(rawData, ex, id), v = values(data);
  const { rows } = await query(`INSERT INTO manual_jobs
    (id,title,company,location,type,salary,description,url,company_logo,company_website,categories,featured,published,source,requirements,responsibilities,qualifications,experience,education,benefits,application_instructions,application_deadline,application_method,application_email,source_submission_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING *`, [id,...v,data.sourceSubmissionId||null]);
  const job = rowToJob(await saveJobDetails(id, ex, rows[0])); if (job.published) await enqueueJobs([job], "manual"); return job;
}
export async function updateJob(id, rawData) {
  const ex = sanitizeJobDetails(rawData), data = prepareJobData(rawData, ex, id), v = values(data);
  const { rows } = await query(`UPDATE manual_jobs SET title=$2,company=$3,location=$4,type=$5,salary=$6,description=$7,url=$8,company_logo=$9,company_website=$10,categories=$11,featured=$12,published=$13,source=$14,requirements=$15,responsibilities=$16,qualifications=$17,experience=$18,education=$19,benefits=$20,application_instructions=$21,application_deadline=$22,application_method=$23,application_email=$24,updated_at=now() WHERE id=$1 RETURNING *`, [id,...v]);
  const job = rows[0] ? rowToJob(await saveJobDetails(id, ex, rows[0])) : null; if (job?.published) await enqueueJobs([job], "manual"); return job;
}
export async function deleteJob(id) { await query("DELETE FROM manual_jobs WHERE id=$1", [id]); }
export { VALID_CATEGORIES };
