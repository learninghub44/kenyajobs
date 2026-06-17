// Providers: Remotive + Jobicy + Arbeitnow (all free, no key)
export default async function handler(req, res) {
  const { category = "", limit = 30 } = req.query;

  const results = await Promise.allSettled([
    // 1. Remotive
    fetch(category
      ? `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
      : `https://remotive.com/api/remote-jobs?limit=20`)
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

    // 2. Jobicy (free, no key)
    fetch("https://jobicy.com/api/v2/remote-jobs?count=20&geo=worldwide&industry=&tag=")
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
      }))),

    // 3. Arbeitnow (free, no key)
    fetch("https://www.arbeitnow.com/api/job-board-api")
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
      }))),
  ]);

  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  res.status(200).json(jobs);
}
