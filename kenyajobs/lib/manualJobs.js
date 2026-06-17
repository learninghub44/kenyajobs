// lib/manualJobs.js
import crypto from "crypto";
import { query } from "@/lib/db";

const VALID_CATEGORIES = ["remote", "entry", "graduate", "wfh", "general"];

function sanitizeCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.filter((c) => VALID_CATEGORIES.includes(c));
}

// Normalize a DB row into the same job shape used by the live-pulled sources
// (utils/api.js / pages/api/*-jobs.js), so JobCard and the detail page need
// no special-casing for manually-posted jobs.
function rowToJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location || "Worldwide",
    type: row.type || "Full-time",
    date: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    url: row.url,
    description: row.description || "",
    source: row.source || "JobsWorldwide",
    salary: row.salary || undefined,
    companyLogo: row.company_logo || undefined,
    companyWebsite: row.company_website || undefined,
    categories: row.categories || [],
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    manual: true,
  };
}

export function newManualJobId() {
  return `manual-${crypto.randomUUID()}`;
}

export async function listPublishedJobs({ category, search } = {}) {
  const conditions = ["published = true"];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`$${params.length} = ANY(categories)`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(title ILIKE $${params.length} OR company ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT * FROM manual_jobs WHERE ${conditions.join(" AND ")} ORDER BY featured DESC, created_at DESC`,
    params
  );
  return rows.map(rowToJob);
}

export async function getPublishedJobById(id) {
  const { rows } = await query(`SELECT * FROM manual_jobs WHERE id = $1 AND published = true`, [id]);
  return rows[0] ? rowToJob(rows[0]) : null;
}

export async function listAllJobs() {
  const { rows } = await query(`SELECT * FROM manual_jobs ORDER BY created_at DESC`);
  return rows.map(rowToJob);
}

export async function getJobById(id) {
  const { rows } = await query(`SELECT * FROM manual_jobs WHERE id = $1`, [id]);
  return rows[0] ? rowToJob(rows[0]) : null;
}

export async function createJob(data) {
  const id = newManualJobId();
  const { rows } = await query(
    `INSERT INTO manual_jobs
      (id, title, company, location, type, salary, description, url, company_logo, company_website, categories, featured, published, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      id,
      data.title,
      data.company,
      data.location || "Worldwide",
      data.type || "Full-time",
      data.salary || null,
      data.description || "",
      data.url,
      data.companyLogo || null,
      data.companyWebsite || null,
      sanitizeCategories(data.categories),
      Boolean(data.featured),
      data.published !== false,
      data.source || "JobsWorldwide",
    ]
  );
  return rowToJob(rows[0]);
}

export async function updateJob(id, data) {
  const { rows } = await query(
    `UPDATE manual_jobs SET
      title = $2, company = $3, location = $4, type = $5, salary = $6,
      description = $7, url = $8, company_logo = $9, company_website = $10,
      categories = $11, featured = $12, published = $13, source = $14,
      updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.title,
      data.company,
      data.location || "Worldwide",
      data.type || "Full-time",
      data.salary || null,
      data.description || "",
      data.url,
      data.companyLogo || null,
      data.companyWebsite || null,
      sanitizeCategories(data.categories),
      Boolean(data.featured),
      data.published !== false,
      data.source || "JobsWorldwide",
    ]
  );
  return rows[0] ? rowToJob(rows[0]) : null;
}

export async function deleteJob(id) {
  await query(`DELETE FROM manual_jobs WHERE id = $1`, [id]);
}

export { VALID_CATEGORIES };
