// pages/api/company-jobs.js
// Aggregates all live jobs for a single employer across all job sources.
// Used by the /company/[slug] profile pages.

import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { attachSalaries } from "@/utils/extractSalary";
import { query, isDatabaseConfigured } from "@/lib/db";

// Normalise a company name into a URL-safe slug
export function companySlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Fuzzy-match: does a job's company field match the requested company name?
function matches(jobCompany = "", targetName = "") {
  const a = jobCompany.toLowerCase().replace(/[^a-z0-9]/g, "");
  const b = targetName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return a.includes(b) || b.includes(a);
}

async function fetchFromLiveSources(companyName) {
  const q = encodeURIComponent(companyName.slice(0, 60));

  const sources = [
    // Remotive
    fetchWithTimeout(`https://remotive.com/api/remote-jobs?search=${q}&limit=20`)
      .then(r => r.json())
      .then(d => (d.jobs || [])
        .filter(j => matches(j.company_name, companyName))
        .map(j => ({
          id: `remotive-${j.id}`,
          title: j.title,
          company: j.company_name,
          location: j.candidate_required_location || "Remote",
          type: j.job_type || "Full-time",
          date: j.publication_date,
          url: j.url,
          description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
          source: "Remotive",
          salary: j.salary || undefined,
          companyLogo: j.company_logo_url || j.company_logo || undefined,
        })))
      .catch(() => []),

    // Jobicy
    fetchWithTimeout(`https://jobicy.com/api/v2/remote-jobs?count=20&tag=${q}`)
      .then(r => r.json())
      .then(d => (d.jobs || [])
        .filter(j => matches(j.companyName, companyName))
        .map(j => ({
          id: `jobicy-${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || "Remote",
          type: j.jobType || "Full-time",
          date: j.pubDate,
          url: j.url,
          description: (j.jobDescription || "").replace(/<[^>]*>/g, "").slice(0, 300),
          source: "Jobicy",
          companyLogo: j.companyLogo || undefined,
          annualSalaryMin: j.annualSalaryMin || undefined,
          annualSalaryMax: j.annualSalaryMax || undefined,
          salaryCurrency: j.salaryCurrency || undefined,
        })))
      .catch(() => []),

    // The Muse
    fetchWithTimeout(`https://www.themuse.com/api/public/jobs?descending=true&page=1`)
      .then(r => r.json())
      .then(d => (d.results || [])
        .filter(j => matches(j.company?.name, companyName))
        .map(j => ({
          id: `muse-${j.id}`,
          title: j.name,
          company: j.company?.name || companyName,
          location: j.locations?.[0]?.name || "Remote",
          type: j.type || "Full-time",
          date: j.publication_date,
          url: j.refs?.landing_page,
          description: (j.contents || "").replace(/<[^>]*>/g, "").slice(0, 300),
          source: "The Muse",
        })))
      .catch(() => []),
  ];

  const results = await Promise.allSettled(sources);
  return attachSalaries(
    results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value)
  );
}

// Also pull from the DB cache if available
async function fetchFromCache(companyName) {
  if (!isDatabaseConfigured()) return [];
  try {
    const { rows } = await query(
      `SELECT data FROM live_job_cache
       WHERE lower(data->>'company') LIKE $1
       ORDER BY updated_at DESC
       LIMIT 50`,
      [`%${companyName.toLowerCase()}%`]
    );
    return rows.map(r => r.data).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { company } = req.query;
  if (!company || typeof company !== "string") {
    return res.status(400).json({ error: "Company name required" });
  }

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const [liveJobs, cachedJobs] = await Promise.all([
    fetchFromLiveSources(company),
    fetchFromCache(company),
  ]);

  // Merge, deduplicate by id
  const seen = new Set();
  const all = [...liveJobs, ...cachedJobs].filter(j => {
    if (!j?.id || seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });

  // Sort newest first
  all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Derive company meta from jobs
  const logo = all.find(j => j.companyLogo || j.company_logo || j.employer_logo)
    ?.companyLogo || null;
  const website = all.find(j => j.companyWebsite)?.companyWebsite || null;
  const locations = [...new Set(all.map(j => j.location).filter(Boolean))].slice(0, 5);
  const types = [...new Set(all.map(j => j.type).filter(Boolean))];

  return res.status(200).json({
    company,
    logo,
    website,
    locations,
    types,
    totalJobs: all.length,
    jobs: all,
  });
}
