// Africa & global job sources
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

// These direct RSS feeds mostly 403 from Vercel (Cloudflare bot protection)
// Kept as cheap 3s attempts — if they work, great; if not, fail fast
const RSS_FEEDS = [
  { url: "https://www.brightermonday.co.ke/listings.rss",   source: "BrighterMonday" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml",         source: "MyJobMag" },
  { url: "https://vacancykenya.co.ke/feed/",                source: "VacancyKenya" },
  { url: "https://kenyajob.com/feed/",                      source: "KenyaJob.com" },
  { url: "https://www.jobwebkenya.com/feed/",               source: "Jobweb" },
  { url: "https://www.brightermonday.co.ug/listings.rss",   source: "BrighterMonday UG" },
  { url: "https://www.brightermonday.co.tz/listings.rss",   source: "BrighterMonday TZ" },
  { url: "https://www.myjobmag.com/rss-jobs.xml",           source: "MyJobMag NG" },
  { url: "https://ngcareers.com/feed/",                     source: "NGCareers" },
  { url: "https://www.jobgurus.com.ng/feed/",               source: "JobGurus NG" },
  { url: "https://www.myjobmag.com.gh/rss-jobs.xml",        source: "MyJobMag GH" },
  { url: "https://www.myjobmag.co.za/rss-jobs.xml",         source: "MyJobMag SA" },
  { url: "https://www.pnet.co.za/rss/jobs.xml",             source: "PNet SA" },
  { url: "https://www.wuzzuf.net/feed/jobs",                source: "Wuzzuf EG" },
  { url: "https://www.fuzu.com/feed",                       source: "Fuzu" },
  { url: "https://africahrservices.com/feed/",              source: "Africa HR" },
  { url: "https://www.careersportal.co.za/feed/",           source: "CareersPortal" },
];

function parseRSS(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`
      ));
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const title = get("title");
    const link  = get("link") || get("guid");
    const pubDate = get("pubDate");
    const description = get("description");
    const company = get("author") || get("dc:creator") || source;
    const location = get("location") || "Africa";
    if (title && link) {
      items.push({
        id: `af-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(link).toString("base64").slice(0, 30)}`,
        title, company, location,
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

// Jobicy — reduced from 10 geos to 5 most active
async function fetchJobicy() {
  const geos = ["kenya", "nigeria", "south-africa", "ghana", "uganda"];
  const results = await Promise.allSettled(
    geos.map(geo =>
      fetchWithTimeout(`https://jobicy.com/api/v2/remote-jobs?count=10&geo=${geo}`, {}, 5000)
        .then(r => r.ok ? r.json() : { jobs: [] })
        .then(d => (d.jobs || []).map(j => ({
          id: `jobicy-${geo}-${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || geo,
          type: j.jobType || "Full-time",
          date: j.pubDate,
          url: j.url,
          description: (j.jobDescription || "").replace(/<[^>]*>/g, "").slice(0, 300),
          source: "Jobicy",
        })))
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// Himalayas — batch all countries in ONE request using keyword search
async function fetchHimalayas() {
  // Use browse endpoint with Africa keyword — one request instead of 8
  const results = await Promise.allSettled([
    fetchWithTimeout("https://himalayas.app/jobs/api/search?q=africa&limit=20", {}, 6000)
      .then(r => r.ok ? r.json() : { jobs: [] })
      .then(d => (d.jobs || []).map(j => ({
        id: `himalayas-${j.id || j.slug}`,
        title: j.title,
        company: j.company?.name || "Company",
        location: j.locationRestrictions?.join(", ") || "Africa",
        type: j.employmentType || "Full-time",
        date: j.pubDate || j.createdAt || new Date().toISOString(),
        url: j.applicationLink || `https://himalayas.app/jobs/${j.slug}`,
        description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
        source: "Himalayas",
      })))
      .catch(() => []),
    fetchWithTimeout("https://himalayas.app/jobs/api/search?country=Kenya&limit=20", {}, 6000)
      .then(r => r.ok ? r.json() : { jobs: [] })
      .then(d => (d.jobs || []).map(j => ({
        id: `himalayas-ke-${j.id || j.slug}`,
        title: j.title,
        company: j.company?.name || "Company",
        location: "Kenya",
        type: j.employmentType || "Full-time",
        date: j.pubDate || j.createdAt || new Date().toISOString(),
        url: j.applicationLink || `https://himalayas.app/jobs/${j.slug}`,
        description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
        source: "Himalayas",
      })))
      .catch(() => []),
  ]);
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ReliefWeb — batch all countries in ONE request using filter
async function fetchReliefWeb() {
  // Single request for all Africa jobs instead of 10 separate country requests
  try {
    const r = await fetchWithTimeout(
      "https://api.reliefweb.int/v1/jobs?appname=kenyajobs&profile=list&slim=1&limit=50&sort[]=date:desc" +
      "&filter[operator]=OR" +
      "&filter[conditions][0][field]=region.name&filter[conditions][0][value]=Africa" +
      "&filter[conditions][1][field]=country.name&filter[conditions][1][value]=Kenya",
      {}, 6000
    );
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).map(j => {
      const f = j.fields || {};
      return {
        id: `reliefweb-${j.id}`,
        title: f.title || "Job",
        company: f.source?.[0]?.name || "NGO",
        location: f.country?.[0]?.name || "Africa",
        type: f["job-type"]?.[0]?.name || "Full-time",
        date: f.date?.created || new Date().toISOString(),
        url: f.url || `https://reliefweb.int/job/${j.id}`,
        description: (f.body || "").replace(/<[^>]*>/g, "").slice(0, 300),
        source: "ReliefWeb",
      };
    });
  } catch {
    return [];
  }
}

// rss2json — proxy for blocked RSS feeds, batched to 4 most important
async function fetchViaRss2Json() {
  const feeds = [
    { url: "https://www.brightermonday.co.ke/listings.rss",  source: "BrighterMonday KE" },
    { url: "https://www.jobwebkenya.com/feed/",              source: "Jobweb KE" },
    { url: "https://www.fuzu.com/feed",                      source: "Fuzu" },
    { url: "https://www.myjobmag.com/rss-jobs.xml",          source: "MyJobMag NG" },
  ];

  const results = await Promise.allSettled(
    feeds.map(({ url, source }) =>
      fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`,
        {}, 6000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `rss2json-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(j.link || j.title).toString("base64").slice(0, 20)}`,
            title: j.title,
            company: j.author || source,
            location: "Africa",
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: j.link || j.guid,
            description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
            source,
          })).filter(j => j.title && j.url);
        })
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

export default async function handler(req, res) {
  // Cache for 30 mins on CDN — most users hit cache, not the slow fetches
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  };

  // All sources fire in parallel — but direct RSS uses 3s timeout (fail fast)
  const [jobicyResult, himalayasResult, reliefWebResult, rss2jsonResult, ...rssResults] = await Promise.allSettled([
    fetchJobicy(),
    fetchHimalayas(),
    fetchReliefWeb(),
    fetchViaRss2Json(),
    ...RSS_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(url, { headers }, 3000) // 3s — fail fast on 403s
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source))
        .catch(() => [])
    ),
  ]);

  const jobs = [
    ...(jobicyResult.status === "fulfilled" ? jobicyResult.value : []),
    ...(himalayasResult.status === "fulfilled" ? himalayasResult.value : []),
    ...(reliefWebResult.status === "fulfilled" ? reliefWebResult.value : []),
    ...(rss2jsonResult.status === "fulfilled" ? rss2jsonResult.value : []),
    ...rssResults.filter(r => r.status === "fulfilled").flatMap(r => r.value),
  ].filter(j => j.title && j.url);

  const seen = new Set();
  const unique = jobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`Africa jobs: ${unique.length} total`);
  res.status(200).json(unique);
}
