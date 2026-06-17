// Providers: JSearch (if key exists) + The Muse (free) + Arbeitnow (free)
export default async function handler(req, res) {
  const { page = 1 } = req.query;

  const sources = [
    // 1. The Muse — free, no key, has entry level filter
    fetch(`https://www.themuse.com/api/public/jobs?level=Entry+Level&page=${page}&descending=true`)
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
      }))),

    // 2. Remotive — software-dev as entry-level proxy
    fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15")
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
      }))),

    // 3. JSearch via RapidAPI (only if key set)
    ...(process.env.RAPIDAPI_KEY ? [
      fetch(`https://jsearch.p.rapidapi.com/search?query=entry+level+jobs&page=${page}&num_pages=1`, {
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
