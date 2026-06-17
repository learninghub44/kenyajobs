// Providers: JSearch (if key) + The Muse (free) + Jobicy (free)
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  const { page = 1 } = req.query;

  const sources = [
    // 1. The Muse — internship/associate level
    fetchWithTimeout(`https://www.themuse.com/api/public/jobs?level=Internship&page=${page}&descending=true`, {}, 5000)
      .then(r => r.json())
      .then(d => (d.results || []).map(j => ({
        id: `muse-intern-${j.id}`,
        title: j.name,
        company: j.company?.name || "Company",
        location: j.locations?.[0]?.name || "Remote",
        type: "Internship",
        date: j.publication_date,
        url: j.refs?.landing_page,
        description: j.contents,
        source: "The Muse",
      }))),

    // 2. Jobicy — marketing/business as graduate proxy
    fetchWithTimeout("https://jobicy.com/api/v2/remote-jobs?count=15&industry=marketing", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `jobicy-grad-${j.id}`,
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
      }))),

    // 3. JSearch — graduate trainee (only if key set)
    ...(process.env.RAPIDAPI_KEY ? [
      fetchWithTimeout(`https://jsearch.p.rapidapi.com/search?query=graduate+trainee+program&page=${page}&num_pages=1`, {
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
        })))
    ] : []),
  ];

  const results = await Promise.allSettled(sources);
  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  res.status(200).json(jobs);
}
