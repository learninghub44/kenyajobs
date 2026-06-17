// Kenya-specific job sources: MyJobMag + BrighterMonday RSS + Fuzu
export default async function handler(req, res) {
  const { page = 1 } = req.query;

  const sources = await Promise.allSettled([

    // 1. MyJobMag Kenya — has a public JSON feed
    fetch("https://www.myjobmag.co.ke/feed/json")
      .then(r => r.json())
      .then(d => (Array.isArray(d) ? d : d.jobs || d.data || []).slice(0, 20).map(j => ({
        id: `myjobmag-${j.id || j.job_id || Math.random()}`,
        title: j.title || j.job_title || j.position,
        company: j.company || j.company_name || j.employer,
        location: j.location || j.city || "Kenya",
        type: j.type || j.job_type || "Full-time",
        date: j.date || j.published_at || j.created_at,
        url: j.url || j.link || j.apply_url,
        description: j.description || j.summary || "",
        source: "MyJobMag Kenya",
      }))),

    // 2. BrighterMonday Kenya RSS (converted to JSON via rss2json)
    fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.brightermonday.co.ke%2Fblog%2Ffeed%2F&api_key=public&count=20")
      .then(r => r.json())
      .then(d => (d.items || []).map(j => ({
        id: `bm-${encodeURIComponent(j.guid || j.link)}`,
        title: j.title,
        company: j.author || "BrighterMonday Kenya",
        location: "Kenya",
        type: "Full-time",
        date: j.pubDate,
        url: j.link,
        description: j.description || j.content || "",
        source: "BrighterMonday Kenya",
      }))),

    // 3. Fuzu Kenya — public job board API
    fetch("https://www.fuzu.com/api/v1/jobs?country=KE&per_page=20&page=" + page)
      .then(r => r.json())
      .then(d => (d.jobs || d.data || []).map(j => ({
        id: `fuzu-${j.id}`,
        title: j.title || j.position,
        company: j.company?.name || j.employer || "Company",
        location: j.location || j.city || "Kenya",
        type: j.employment_type || j.type || "Full-time",
        date: j.published_at || j.created_at,
        url: j.url || `https://www.fuzu.com/kenya/jobs/${j.slug || j.id}`,
        description: j.description || j.summary || "",
        source: "Fuzu Kenya",
      }))),
  ]);

  const jobs = sources
    .filter(r => r.status === "fulfilled" && Array.isArray(r.value))
    .flatMap(r => r.value)
    .filter(j => j.title && j.url); // only valid jobs

  res.status(200).json(jobs);
}
