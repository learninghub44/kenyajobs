// Providers: Adzuna (if key) + Remotive customer-support + Jobicy (free)
export default async function handler(req, res) {
  const { page = 1 } = req.query;

  const sources = [
    // 1. Remotive — customer support / writing as WFH proxy
    fetch("https://remotive.com/api/remote-jobs?category=customer-support&limit=15")
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
      }))),

    // 2. Jobicy — remote general
    fetch("https://jobicy.com/api/v2/remote-jobs?count=15&geo=worldwide")
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
      }))),

    // 3. Adzuna (only if keys set)
    ...(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? [
      fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/${page}?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&results_per_page=20&what=work+from+home`)
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
        })))
    ] : []),
  ];

  const results = await Promise.allSettled(sources);
  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  res.status(200).json(jobs);
}
