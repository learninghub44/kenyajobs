// Africa & global job sources
// RSS feeds from major African job boards + Jobicy geo filters + Himalayas + ReliefWeb
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const RSS_FEEDS = [
  // East Africa
  { url: "https://www.brightermonday.co.ke/listings.rss",   source: "BrighterMonday" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml",         source: "MyJobMag" },
  { url: "https://vacancykenya.co.ke/feed/",                source: "VacancyKenya" },
  { url: "https://kenyajob.com/feed/",                      source: "KenyaJob.com" },
  { url: "https://www.jobwebkenya.com/feed/",               source: "Jobweb" },
  { url: "https://www.brightermonday.co.ug/listings.rss",   source: "BrighterMonday UG" },
  { url: "https://www.brightermonday.co.tz/listings.rss",   source: "BrighterMonday TZ" },
  // West Africa
  { url: "https://www.myjobmag.com/rss-jobs.xml",           source: "MyJobMag NG" },
  { url: "https://ngcareers.com/feed/",                     source: "NGCareers" },
  { url: "https://www.jobgurus.com.ng/feed/",               source: "JobGurus NG" },
  { url: "https://www.myjobmag.com.gh/rss-jobs.xml",        source: "MyJobMag GH" },
  // Southern Africa
  { url: "https://www.myjobmag.co.za/rss-jobs.xml",         source: "MyJobMag SA" },
  { url: "https://www.pnet.co.za/rss/jobs.xml",             source: "PNet SA" },
  // North Africa
  { url: "https://www.wuzzuf.net/feed/jobs",                source: "Wuzzuf EG" },
  // Pan-Africa
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
    const company  = get("author") || get("dc:creator") || source;
    const location = get("location") || "Africa";
    if (title && link) {
      items.push({
        id: `af-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(link).toString("base64").slice(0, 30)}`,
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

// Jobicy free API — multiple African + global geos
async function fetchJobicy() {
  const geos = [
    "kenya", "nigeria", "south-africa", "ghana",
    "egypt", "ethiopia", "tanzania", "uganda",
    "rwanda", "senegal",
  ];
  const results = await Promise.allSettled(
    geos.map(geo =>
      fetchWithTimeout(
        `https://jobicy.com/api/v2/remote-jobs?count=10&geo=${geo}`,
        {}, 8000
      )
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

// Himalayas — free public API, no auth, filter by African countries
async function fetchHimalayas() {
  const countries = ["Kenya", "Nigeria", "Ghana", "South Africa", "Uganda", "Tanzania", "Rwanda", "Ethiopia"];
  const results = await Promise.allSettled(
    countries.map(country =>
      fetchWithTimeout(
        `https://himalayas.app/jobs/api/search?country=${encodeURIComponent(country)}&limit=20`,
        {}, 8000
      )
        .then(r => r.ok ? r.json() : { jobs: [] })
        .then(d => (d.jobs || []).map(j => ({
          id: `himalayas-${j.id || j.slug}`,
          title: j.title,
          company: j.company?.name || j.companyName || "Company",
          location: j.locationRestrictions?.join(", ") || country,
          type: j.employmentType || "Full-time",
          date: j.pubDate || j.createdAt || new Date().toISOString(),
          url: j.applicationLink || j.url || `https://himalayas.app/jobs/${j.slug}`,
          description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
          source: "Himalayas",
        })))
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ReliefWeb — UN OCHA API, free, no key needed, great Africa/NGO coverage
async function fetchReliefWeb() {
  const countries = ["Kenya", "Nigeria", "Uganda", "Tanzania", "Ethiopia", "Rwanda", "Ghana", "South Africa", "Somalia", "Sudan"];

  const results = await Promise.allSettled(
    countries.map(country =>
      fetchWithTimeout(
        "https://api.reliefweb.int/v1/jobs?appname=kenyajobs&profile=list&slim=1&limit=20&sort[]=date:desc" +
        `&filter[field]=country.name&filter[value]=${encodeURIComponent(country)}`,
        {}, 8000
      )
        .then(r => r.ok ? r.json() : { data: [] })
        .then(d => (d.data || []).map(j => {
          const f = j.fields || {};
          return {
            id: `reliefweb-${j.id}`,
            title: f.title || "Job",
            company: f.source?.[0]?.name || f.organization || "NGO",
            location: f.country?.[0]?.name || country,
            type: f["job-type"]?.[0]?.name || "Full-time",
            date: f.date?.created || new Date().toISOString(),
            url: f.url || `https://reliefweb.int/job/${j.id}`,
            description: (f.body || "").replace(/<[^>]*>/g, "").slice(0, 300),
            source: "ReliefWeb",
          };
        }))
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// rss2json.com — proxy for RSS feeds that block direct server requests
async function fetchViaRss2Json() {
  const feeds = [
    { url: "https://www.brightermonday.co.ke/listings.rss",  source: "BrighterMonday KE" },
    { url: "https://www.myjobmag.co.ke/rss-jobs.xml",        source: "MyJobMag KE" },
    { url: "https://www.jobwebkenya.com/feed/",              source: "Jobweb KE" },
    { url: "https://kenyajob.com/feed/",                     source: "KenyaJob" },
    { url: "https://www.fuzu.com/feed",                      source: "Fuzu" },
    { url: "https://www.myjobmag.com/rss-jobs.xml",          source: "MyJobMag NG" },
    { url: "https://www.myjobmag.co.za/rss-jobs.xml",        source: "MyJobMag SA" },
  ];

  const results = await Promise.allSettled(
    feeds.map(({ url, source }) =>
      fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`,
        {}, 8000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `rss2json-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(j.link || j.guid || j.title).toString("base64").slice(0, 20)}`,
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
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const [jobicyResult, himalayasResult, reliefWebResult, rss2jsonResult, ...rssResults] = await Promise.allSettled([
    fetchJobicy(),
    fetchHimalayas(),
    fetchReliefWeb(),
    fetchViaRss2Json(),
    ...RSS_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(url, { headers }, 7000)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source))
        .catch(err => { console.error(`[${source}] ${err.message}`); return []; })
    ),
  ]);

  const jobs = [
    ...(jobicyResult.status === "fulfilled" ? jobicyResult.value : []),
    ...(himalayasResult.status === "fulfilled" ? himalayasResult.value : []),
    ...(reliefWebResult.status === "fulfilled" ? reliefWebResult.value : []),
    ...(rss2jsonResult.status === "fulfilled" ? rss2jsonResult.value : []),
    ...rssResults.filter(r => r.status === "fulfilled").flatMap(r => r.value),
  ].filter(j => j.title && j.url);

  // Deduplicate by URL
  const seen = new Set();
  const unique = jobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`Africa jobs: ${unique.length} total (Jobicy + Himalayas + ReliefWeb + rss2json + direct RSS)`);
  res.status(200).json(unique);
}
