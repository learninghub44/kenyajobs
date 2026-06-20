// Providers: The Muse (free) + Remotive (free) + JSearch (if key set)
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";
import { cachedFetch } from "@/lib/apiResponseCache";
import { attachSalaries } from "@/utils/extractSalary";

async function fetchAll(page) {
  const sources = [
    // 1. The Muse — free, no key, has entry level filter
    fetchWithTimeout(`https://www.themuse.com/api/public/jobs?level=Entry+Level&page=${page}&descending=true`, {}, 5000)
      .then(r => r.json())
      .then(d => (d.results || []).map(j => ({
        id: `muse-${j.id}`,
        title: j.name,
        company: j.company?.name || "Company",
        location: j.locations?.[0]?.name || "Remote",
        type: j.type || "Full-time",
        date: j.publication_date,
        url: j.refs?.landing_page,
        description: j.contents,
        source: "The Muse",
      })))
      .catch(err => { console.error("TheMuse error:", err.message); return []; }),

    // 2. Remotive — software-dev as entry-level proxy
    fetchWithTimeout("https://remotive.com/api/remote-jobs?category=software-dev&limit=40", {}, 5000)
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
        salary: j.salary || undefined,
        companyLogo: j.company_logo_url || j.company_logo || undefined,
      })))
      .catch(err => { console.error("Remotive entry error:", err.message); return []; }),

    // 3. JSearch via RapidAPI (only if key set)
    ...(process.env.RAPIDAPI_KEY ? [
      fetchWithTimeout(`https://jsearch.p.rapidapi.com/search?query=entry+level+jobs&page=${page}&num_pages=1`, {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      })
        .then(r => r.json())
        .then(d => (d.data || []).map(j => ({
          id: `jsearch-${j.job_id}`,
          title: j.job_title,
          company: j.employer_name,
          location: j.job_city || j.job_country || "Worldwide",
          type: j.job_employment_type || "Full-time",
          date: j.job_posted_at_datetime_utc,
          url: j.job_apply_link,
          description: j.job_description,
          source: "JSearch",
          companyLogo: j.employer_logo || undefined,
          companyWebsite: j.employer_website || undefined,
          job_min_salary: j.job_min_salary || undefined,
          job_max_salary: j.job_max_salary || undefined,
          job_salary_currency: j.job_salary_currency || undefined,
          highlights: j.job_highlights || undefined,
        })))
        .catch(err => { console.error("JSearch error:", err.message); return []; })
    ] : []),
  ];

  const results = await Promise.allSettled(sources);
  return attachSalaries(
    results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value)
  );
}

export default async function handler(req, res) {
  const { page = 1 } = req.query;

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const jobs = await cachedFetch(`entry-level-jobs:${page}`, () => fetchAll(page));

  cacheJobs(jobs);
  res.status(200).json(jobs);
}
