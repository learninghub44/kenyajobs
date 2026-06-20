import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";
import { cachedFetch } from "@/lib/apiResponseCache";
import { attachSalaries } from "@/utils/extractSalary";

async function fetchAll(page) {
  const sources = [
    // 1. The Muse — internship level filter
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
      })))
      .catch(() => []),

    // 2. Remotive — internship tagged roles
    fetchWithTimeout("https://remotive.com/api/remote-jobs?search=intern&limit=40", {}, 5000)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-intern-${j.id}`,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || "Remote",
        type: "Internship",
        date: j.publication_date,
        url: j.url,
        description: j.description,
        source: "Remotive",
        companyLogo: j.company_logo_url || j.company_logo || undefined,
      })))
      .catch(() => []),

    // 3. JSearch (if key set)
    ...(process.env.RAPIDAPI_KEY ? [
      fetchWithTimeout(`https://jsearch.p.rapidapi.com/search?query=internship+Kenya+Africa&page=${page}&num_pages=1`, {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      })
        .then(r => r.json())
        .then(d => (d.data || []).map(j => ({
          id: `jsearch-intern-${j.job_id}`,
          title: j.job_title,
          company: j.employer_name,
          location: j.job_city || j.job_country || "Worldwide",
          type: "Internship",
          date: j.job_posted_at_datetime_utc,
          url: j.job_apply_link,
          description: j.job_description,
          source: "JSearch",
          companyLogo: j.employer_logo || undefined,
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
  const { page = 1 } = req.query;

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const jobs = await cachedFetch(`internship-jobs:${page}`, () => fetchAll(page));

  cacheJobs(jobs);
  res.status(200).json(jobs);
}
