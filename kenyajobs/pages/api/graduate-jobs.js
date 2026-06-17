// Providers: JSearch (if key) + The Muse (free) + Jobicy (free)
export default async function handler(req, res) {
  const { page = 1 } = req.query;

  const sources = [
    // 1. The Muse — internship/associate level
    fetch(`https://www.themuse.com/api/public/jobs?level=Internship&page=${page}&descending=true`)
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
    fetch("https://jobicy.com/api/v2/remote-jobs?count=15&industry=marketing")
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
      }))),

    // 3. JSearch — graduate trainee (only if key set)
    ...(process.env.RAPIDAPI_KEY ? [
      fetch(`https://jsearch.p.rapidapi.com/search?query=graduate+trainee+program&page=${page}&num_pages=1`, {
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
        })))
    ] : []),
  ];

  const results = await Promise.allSettled(sources);
  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  res.status(200).json(jobs);
}
