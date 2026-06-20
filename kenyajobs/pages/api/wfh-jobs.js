// WFH-specific sources — deliberately different from /api/remote-jobs
// Remote = broad global remote roles (Remotive general, Jobicy global, Arbeitnow)
// WFH    = roles explicitly tagged work-from-home or in categories suited to home-based work
//          Sources used here must NOT duplicate /api/remote-jobs fetch calls
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";
import { cachedFetch } from "@/lib/apiResponseCache";
import { attachSalaries } from "@/utils/extractSalary";

async function fetchAll(page) {
  const sources = [
    // 1. Remotive — customer-support (home-based friendly category, not in remote-jobs general call)
    fetchWithTimeout("https://remotive.com/api/remote-jobs?category=customer-support&limit=25", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-cs-${j.id}`,
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
        categories: ["wfh"],
      })))
      .catch(() => []),

    // 2. Remotive — writing (content/copywriting — strongly WFH-aligned)
    fetchWithTimeout("https://remotive.com/api/remote-jobs?category=writing&limit=20", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-wr-${j.id}`,
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
        categories: ["wfh"],
      })))
      .catch(() => []),

    // 3. Remotive — data (data entry / data analyst — common WFH role)
    fetchWithTimeout("https://remotive.com/api/remote-jobs?category=data&limit=20", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-da-${j.id}`,
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
        categories: ["wfh"],
      })))
      .catch(() => []),

    // 4. Adzuna — explicit "work from home" keyword search (only if keys set)
    ...(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? [
      fetchWithTimeout(
        `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=40&what=work+from+home`,
        {}, 5000
      )
        .then(r => r.json())
        .then(d => (d.results || []).map(j => ({
          id: `adzuna-wfh-${j.id}`,
          title: j.title,
          company: j.company?.display_name || "Company",
          location: j.location?.display_name || "Remote",
          type: "Full-time",
          date: j.created,
          url: j.redirect_url,
          description: j.description,
          source: "Adzuna",
          category: j.category?.label || undefined,
          salary_min: j.salary_min || undefined,
          salary_max: j.salary_max || undefined,
          categories: ["wfh"],
        })))
        .catch(() => [])
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
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  const { page = 1 } = req.query;

  const jobs = await cachedFetch(`wfh-jobs:${page}`, () => fetchAll(page));

  cacheJobs(jobs);
  res.status(200).json(jobs);
}
