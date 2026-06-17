// Kenya job sources — RSS feeds + Jobicy Kenya geo filter
// Sources: BrighterMonday KE, MyJobMag KE, VacancyKenya, KenyaJob.com, Jobicy (KE geo)

const RSS_FEEDS = [
  {
    url: "https://www.brightermonday.co.ke/listings.rss",
    source: "BrighterMonday Kenya",
  },
  {
    url: "https://www.myjobmag.co.ke/rss-jobs.xml",
    source: "MyJobMag Kenya",
  },
  {
    url: "https://vacancykenya.co.ke/feed/",
    source: "Vacancy Kenya",
  },
  {
    url: "https://kenyajob.com/feed/",
    source: "KenyaJob",
  },
];

// Lightweight XML parser — no dependencies needed
function parseRSS(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const title = get("title");
    const link = get("link") || get("guid");
    const pubDate = get("pubDate");
    const description = get("description");
    const company = get("author") || get("dc:creator") || source;
    const location = get("location") || "Kenya";

    if (title && link) {
      items.push({
        id: `ke-${source.toLowerCase().replace(/\s+/g, "-")}-${encodeURIComponent(link).slice(0, 40)}`,
        title,
        company,
        location,
        type: "Full-time",
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url: link,
        description: description.replace(/<[^>]*>/g, "").slice(0, 300),
        source,
      });
    }
  }

  return items;
}

// Fetch with timeout using AbortController
function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// Fetch Kenya jobs from Jobicy (free API, geo=kenya)
async function fetchJobicyKenya() {
  const r = await fetchWithTimeout(
    "https://jobicy.com/api/v2/remote-jobs?count=20&geo=kenya",
    {},
    8000
  );
  if (!r.ok) throw new Error(`Jobicy Kenya: HTTP ${r.status}`);
  const d = await r.json();
  return (d.jobs || []).map(j => ({
    id: `jobicy-ke-${j.id}`,
    title: j.jobTitle,
    company: j.companyName,
    location: j.jobGeo || "Kenya",
    type: j.jobType || "Full-time",
    date: j.pubDate,
    url: j.url,
    description: (j.jobDescription || "").replace(/<[^>]*>/g, "").slice(0, 300),
    source: "Jobicy Kenya",
  }));
}

export default async function handler(req, res) {
  // Cache 30 min
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; KenyaJobs/1.0; +https://kenyajobs.com)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  };

  // Fetch all sources in parallel with timeout
  const results = await Promise.allSettled([
    // Jobicy Kenya — reliable API, goes first
    fetchJobicyKenya().catch(err => {
      console.error("Jobicy Kenya error:", err.message);
      return [];
    }),

    // RSS feeds with 8s timeout each
    ...RSS_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(url, { headers }, 8000)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then(xml => parseRSS(xml, source))
        .catch(err => {
          console.error(`Kenya RSS error [${source}]: ${err.message}`);
          return [];
        })
    ),
  ]);

  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value)
    .filter(j => j.title && j.url);

  // Deduplicate by URL
  const seen = new Set();
  const unique = jobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  // Sort newest first
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`Kenya jobs loaded: ${unique.length} total (from ${results.filter(r => r.status === "fulfilled" && r.value.length > 0).length} sources)`);
  res.status(200).json(unique);
}
