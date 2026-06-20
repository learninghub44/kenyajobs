// Providers: Remotive + Jobicy + Arbeitnow (all free, no key)
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";
import { cachedFetch } from "@/lib/apiResponseCache";

async function fetchAll(category) {
  const results = await Promise.allSettled([
    // 1. Remotive
    fetchWithTimeout(
      category
        ? `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
        : `https://remotive.com/api/remote-jobs?limit=20`
    )
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-${j.id}`,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || "Remote",
        type: j.job_type || "Full-time",
        date: j.publication_date,
        url: j.url,
        description: j.description,
        source: "Remotive",
        category: j.category || undefined,
        salary: j.salary || undefined,
        companyLogo: j.company_logo_url || j.company_logo || undefined,
      })))
      .catch(err => { console.error("Remotive error:", err.message); return []; }),

    // 2. Jobicy (free, no key)
    fetchWithTimeout("https://jobicy.com/api/v2/remote-jobs?count=20&geo=worldwide&industry=&tag=", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `jobicy-${j.id}`,
        title: j.jobTitle,
        company: j.companyName,
        location: j.jobGeo || "Remote",
        type: j.jobType || "Full-time",
        date: j.pubDate,
        url: j.url,
        description: j.jobDescription,
        source: "Jobicy",
        companyLogo: j.companyLogo || undefined,
        category: j.jobIndustry || undefined,
        annualSalaryMin: j.annualSalaryMin || undefined,
        annualSalaryMax: j.annualSalaryMax || undefined,
        salaryCurrency: j.salaryCurrency || undefined,
      })))
      .catch(err => { console.error("Jobicy error:", err.message); return []; }),

    // 3. Arbeitnow (free, no key)
    fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api", {}, 5000)
      .then(r => r.json())
      .then(d => (d.data || []).slice(0, 20).map(j => ({
        id: `arbeitnow-${j.slug}`,
        title: j.title,
        company: j.company_name,
        location: j.location || "Remote",
        type: j.job_types?.[0] || "Full-time",
        date: new Date(j.created_at * 1000).toISOString(),
        url: j.url,
        description: j.description,
        source: "Arbeitnow",
        companyLogo: j.company_logo || undefined,
        tags: Array.isArray(j.tags) ? j.tags : undefined,
      })))
      .catch(err => { console.error("Arbeitnow error:", err.message); return []; }),
  ]);

  return results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);
}

export default async function handler(req, res) {
  const { category = "", limit = 30 } = req.query;

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const jobs = await cachedFetch(`remote-jobs:${category}`, () => fetchAll(category));

  cacheJobs(jobs);
  res.status(200).json(jobs);
}
