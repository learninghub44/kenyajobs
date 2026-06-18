// Providers: Adzuna (if key) + Remotive customer-support + Jobicy (free)
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  const { page = 1 } = req.query;

  const sources = [
    // 1. Remotive — customer support / writing as WFH proxy
    fetchWithTimeout("https://remotive.com/api/remote-jobs?category=customer-support&limit=15", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-wfh-${j.id}`,
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
      .catch(err => { console.error("Remotive wfh error:", err.message); return []; }),

    // 2. Jobicy — remote general
    fetchWithTimeout("https://jobicy.com/api/v2/remote-jobs?count=15&geo=worldwide", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `jobicy-wfh-${j.id}`,
        title: j.jobTitle,
        company: j.companyName,
        location: j.jobGeo || "Remote",
        type: j.jobType || "Full-time",
        date: j.pubDate,
        url: j.url,
        description: j.jobDescription,
        source: "Jobicy",
        companyLogo: j.companyLogo || undefined,
        annualSalaryMin: j.annualSalaryMin || undefined,
        annualSalaryMax: j.annualSalaryMax || undefined,
        salaryCurrency: j.salaryCurrency || undefined,
      })))
      .catch(err => { console.error("Jobicy wfh error:", err.message); return []; }),

    // 3. Adzuna (only if keys set)
    ...(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? [
      fetchWithTimeout(`https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=20&what=work+from+home`, {}, 5000)
        .then(r => r.json())
        .then(d => (d.results || []).map(j => ({
          id: `adzuna-${j.id}`,
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
        })))
        .catch(err => { console.error("Adzuna error:", err.message); return []; })
    ] : []),
  ];

  const results = await Promise.allSettled(sources);
  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  cacheJobs(jobs);
  res.status(200).json(jobs);
}
