import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cacheJobs } from "@/lib/liveJobCache";
import crypto from "crypto";

function hashId(input) {
  return crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, 16);
}

// ── Direct RSS feeds (server-side fetch) ────────────────────────────────────
const RSS_FEEDS = [
  // Kenya — direct RSS
  { url: "https://www.brightermonday.co.ke/listings.rss",        source: "BrighterMonday",      location: "Kenya" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml",              source: "MyJobMag",             location: "Kenya" },
  { url: "https://vacancykenya.co.ke/feed/",                     source: "VacancyKenya",         location: "Kenya" },
  { url: "https://kenyansconsult.co.ke/feed/",                   source: "KenyanSconsult",       location: "Kenya" },
  { url: "https://www.kenyajobsearch.co.ke/feed/",               source: "KenyaJobSearch",       location: "Kenya" },
  { url: "https://jobsinkenya.co.ke/feed/",                      source: "JobsInKenya",          location: "Kenya" },
  { url: "https://joblistkenya.com/feed/",                       source: "JobListKenya",         location: "Kenya" },
  { url: "https://www.careerpoint.co.ke/feed/",                  source: "CareerPoint",          location: "Kenya" },
  { url: "https://natkelp.go.ke/feed/",                          source: "Natkelp Gov",          location: "Kenya" },
  // East Africa
  { url: "https://www.brightermonday.co.ug/listings.rss",        source: "BrighterMonday UG",    location: "Uganda" },
  { url: "https://www.brightermonday.co.tz/listings.rss",        source: "BrighterMonday TZ",    location: "Tanzania" },
  { url: "https://www.fuzu.com/feed",                            source: "Fuzu",                 location: "East Africa" },
  // Rest of Africa
  { url: "https://www.myjobmag.com/rss-jobs.xml",                source: "MyJobMag NG",          location: "Nigeria" },
  { url: "https://www.myjobmag.co.za/rss-jobs.xml",              source: "MyJobMag SA",          location: "South Africa" },
  { url: "https://www.pnet.co.za/rss/jobs.xml",                  source: "PNet SA",              location: "South Africa" },
  { url: "https://www.wuzzuf.net/feed/jobs",                     source: "Wuzzuf EG",            location: "Egypt" },
];

// ── Kenya feeds via rss2json proxy (bypasses CORS/blocks) ───────────────────
const KENYA_PROXY_FEEDS = [
  { url: "https://www.jobwebkenya.com/feed/",                    source: "Jobweb Kenya" },
  { url: "https://kenyacurrent.com/category/jobs/feed/",         source: "Kenya Current" },
  { url: "https://www.corporatestaffing.co.ke/feed/",            source: "Corporate Staffing" },
  { url: "https://turinjobs.com/feed/",                          source: "TurinJobs" },
  { url: "https://jobsikaz.com/feed/",                           source: "JobSiKaz" },
  { url: "https://kenyanjobsearch.com/feed/",                    source: "KenyanJobSearch" },
  { url: "https://www.humaniplex.com/rss/jobs-in-kenya.xml",     source: "Humaniplex" },
  { url: "https://www.developmentaid.org/rss/jobs/kenya",        source: "DevelopmentAid" },
  // NEW Kenya sources
  { url: "https://www.ngojobskenya.com/feed/",                   source: "NGO Jobs Kenya" },
  { url: "https://www.choptaskforce.com/feed/",                  source: "ChopTaskforce KE" },
  { url: "https://kenyajobalert.com/feed/",                      source: "Kenya Job Alert" },
  { url: "https://www.joblistingskenya.com/feed/",               source: "Job Listings Kenya" },
  { url: "https://nafasiwork.com/feed/",                         source: "Nafasi Work" },
  { url: "https://www.jobsboard.co.ke/feed/",                    source: "JobsBoard KE" },
  { url: "https://eastafricajobs.com/feed/",                     source: "East Africa Jobs" },
  { url: "https://www.ajira.go.ke/rss",                          source: "Ajira (Govt KE)" },
  { url: "https://jobs.undp.org/cgi-bin/helpers/rss.cgi?region=Africa", source: "UNDP Africa" },
  { url: "https://reliefweb.int/jobs/kenya/rss.xml",             source: "ReliefWeb Kenya" },
  { url: "https://www.devex.com/jobs/rss?country=KE",            source: "Devex Kenya" },
];

function parseRSS(xml, source, defaultLocation) {
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
    const location = get("location") || defaultLocation || "Worldwide";
    if (title && link) {
      items.push({
        id: `rss-${source.toLowerCase().replace(/\s+/g, "-")}-${hashId(link)}`,
        title, company, location,
        type: "Full-time",
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url: link,
        description: description.replace(/<[^>]*>/g, "").trim().slice(0, 5000),
        source,
      });
    }
  }
  return items;
}

// ── Kenya via rss2json proxy ─────────────────────────────────────────────────
async function fetchKenyaJobs() {
  const results = await Promise.allSettled(
    KENYA_PROXY_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`,
        {}, 7000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `ke-${source.toLowerCase().replace(/\s+/g, "-")}-${hashId(j.link || j.title)}`,
            title: String(j.title || ""),
            company: String(j.author || source),
            location: "Kenya",
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: String(j.link || j.guid || ""),
            description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 500),
            source,
          })).filter(j => j.title && j.url);
        })
        .catch(err => { console.warn(`[${source}] ${err.message}`); return []; })
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── LinkedIn public job search RSS (no API key needed) ───────────────────────
// LinkedIn exposes a public RSS feed for job search results
async function fetchLinkedInJobs() {
  const searches = [
    { keywords: "jobs+kenya",           location: "Kenya" },
    { keywords: "jobs+nairobi",         location: "Nairobi, Kenya" },
    { keywords: "remote+jobs+africa",   location: "Africa" },
    { keywords: "jobs+east+africa",     location: "East Africa" },
  ];

  const results = await Promise.allSettled(
    searches.map(({ keywords, location }) => {
      const rssUrl = `https://www.linkedin.com/jobs/search/?keywords=${keywords}&f_TPR=r604800&format=rss`;
      return fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`,
        {}, 8000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `linkedin-${hashId(j.link || j.title)}`,
            title: String(j.title || ""),
            company: String(j.author || "Company"),
            location,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: String(j.link || ""),
            description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 500),
            source: "LinkedIn",
          })).filter(j => j.title && j.url);
        })
        .catch(() => []);
    })
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Indeed RSS (no API key, public feed) ─────────────────────────────────────
async function fetchIndeedJobs() {
  const searches = [
    { q: "jobs",         l: "Nairobi,+Kenya",   label: "Nairobi, Kenya" },
    { q: "jobs",         l: "Mombasa,+Kenya",   label: "Mombasa, Kenya" },
    { q: "remote+jobs",  l: "Kenya",             label: "Kenya" },
  ];

  const results = await Promise.allSettled(
    searches.map(({ q, l, label }) => {
      const rssUrl = `https://www.indeed.com/rss?q=${q}&l=${l}&sort=date`;
      return fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`,
        {}, 8000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `indeed-${hashId(j.link || j.title)}`,
            title: String(j.title || ""),
            company: String(j.author || "Company"),
            location: label,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: String(j.link || ""),
            description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 500),
            source: "Indeed",
          })).filter(j => j.title && j.url);
        })
        .catch(() => []);
    })
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Remotive ─────────────────────────────────────────────────────────────────
async function fetchRemotive() {
  try {
    const r = await fetchWithTimeout("https://remotive.com/api/remote-jobs?limit=50", {}, 7000);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.jobs || []).map(j => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || "Worldwide",
      type: j.job_type || "Full-time",
      date: j.publication_date,
      url: j.url,
      description: j.description || "",
      source: "Remotive",
      salary: j.salary || undefined,
      companyLogo: j.company_logo_url || j.company_logo || undefined,
    }));
  } catch { return []; }
}

// ── The Muse ─────────────────────────────────────────────────────────────────
async function fetchTheMuse() {
  try {
    const r = await fetchWithTimeout("https://www.themuse.com/api/public/jobs?page=0&descending=true&api_key=public", {}, 7000);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.results || []).map(j => ({
      id: `muse-${j.id}`,
      title: j.name,
      company: j.company?.name || "Company",
      location: j.locations?.map(l => l.name).join(", ") || "Worldwide",
      type: j.levels?.[0]?.name || "Full-time",
      date: j.publication_date || new Date().toISOString(),
      url: j.refs?.landing_page || `https://www.themuse.com/jobs/${j.id}`,
      description: j.contents || "",
      source: "The Muse",
    }));
  } catch { return []; }
}

// ── Jobicy ───────────────────────────────────────────────────────────────────
async function fetchJobicy() {
  const geos = ["usa", "uk", "canada", "australia", "europe", "india", "nigeria", "south-africa", "kenya"];
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
          description: j.jobDescription || "",
          source: "Jobicy",
          companyLogo: j.companyLogo || undefined,
          annualSalaryMin: j.annualSalaryMin || undefined,
          annualSalaryMax: j.annualSalaryMax || undefined,
          salaryCurrency: j.salaryCurrency || undefined,
        })))
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Arbeitnow ────────────────────────────────────────────────────────────────
async function fetchArbeitnow() {
  try {
    const r = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api", {}, 7000);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || []).slice(0, 40).map(j => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title,
      company: j.company_name,
      location: j.location || "Europe",
      type: j.remote ? "Remote" : "Full-time",
      date: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
      url: j.url,
      description: j.description || "",
      source: "Arbeitnow",
      companyLogo: j.company_logo || undefined,
    }));
  } catch { return []; }
}

// ── ReliefWeb (NGO/UN jobs globally) ────────────────────────────────────────
async function fetchReliefWeb() {
  try {
    const r = await fetchWithTimeout(
      "https://api.reliefweb.int/v1/jobs?appname=jobsworldwide&profile=list&slim=1&limit=40&sort[]=date:desc",
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
        location: f.country?.[0]?.name || "Worldwide",
        type: f["job-type"]?.[0]?.name || "Full-time",
        date: f.date?.created || new Date().toISOString(),
        url: f.url || `https://reliefweb.int/job/${j.id}`,
        description: (f.body || "").replace(/<[^>]*>/g, ""),
        source: "ReliefWeb",
      };
    });
  } catch { return []; }
}

// ── Himalayas ────────────────────────────────────────────────────────────────
async function fetchHimalayas() {
  try {
    const r = await fetchWithTimeout("https://himalayas.app/jobs/api?limit=30", {}, 6000);
    if (!r.ok) return [];
    const d = await r.json();
    return (d.jobs || []).map(j => ({
      id: `himalayas-${j.id || j.slug}`,
      title: j.title,
      company: j.company?.name || "Company",
      location: j.locationRestrictions?.join(", ") || "Worldwide",
      type: j.employmentType || "Remote",
      date: j.pubDate || j.createdAt || new Date().toISOString(),
      url: j.applicationLink || `https://himalayas.app/jobs/${j.slug}`,
      description: j.description || "",
      source: "Himalayas",
      companyLogo: j.company?.logo || undefined,
    }));
  } catch { return []; }
}

// ── Other Africa via rss2json ─────────────────────────────────────────────────
async function fetchViaRss2Json() {
  const feeds = [
    { url: "https://www.careersportal.co.za/feed/",         source: "CareersPortal SA",   location: "South Africa" },
    { url: "https://ngcareers.com/feed/",                   source: "NGCareers",           location: "Nigeria" },
  ];
  const results = await Promise.allSettled(
    feeds.map(({ url, source, location }) =>
      fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`,
        {}, 6000
      )
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `rss2json-${source.toLowerCase().replace(/\s+/g, "-")}-${hashId(j.link || j.title)}`,
            title: j.title,
            company: j.author || source,
            location,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: j.link || j.guid,
            description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 5000),
            source,
          })).filter(j => j.title && j.url);
        })
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  };

  const [
    remotiveResult,
    museResult,
    jobicyResult,
    arbeitnowResult,
    reliefWebResult,
    himalayasResult,
    rss2jsonResult,
    kenyaResult,
    linkedinResult,
    indeedResult,
    ...rssResults
  ] = await Promise.allSettled([
    fetchRemotive(),
    fetchTheMuse(),
    fetchJobicy(),
    fetchArbeitnow(),
    fetchReliefWeb(),
    fetchHimalayas(),
    fetchViaRss2Json(),
    fetchKenyaJobs(),
    fetchLinkedInJobs(),
    fetchIndeedJobs(),
    ...RSS_FEEDS.map(({ url, source, location }) =>
      fetchWithTimeout(url, { headers }, 7000)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source, location))
        .catch(err => { console.warn(`[${source}] ${err.message}`); return []; })
    ),
  ]);

  const jobs = [
    ...(kenyaResult.status === "fulfilled"      ? kenyaResult.value      : []),
    ...(linkedinResult.status === "fulfilled"   ? linkedinResult.value   : []),
    ...(indeedResult.status === "fulfilled"     ? indeedResult.value     : []),
    ...(remotiveResult.status === "fulfilled"   ? remotiveResult.value   : []),
    ...(museResult.status === "fulfilled"       ? museResult.value       : []),
    ...(jobicyResult.status === "fulfilled"     ? jobicyResult.value     : []),
    ...(arbeitnowResult.status === "fulfilled"  ? arbeitnowResult.value  : []),
    ...(reliefWebResult.status === "fulfilled"  ? reliefWebResult.value  : []),
    ...(himalayasResult.status === "fulfilled"  ? himalayasResult.value  : []),
    ...(rss2jsonResult.status === "fulfilled"   ? rss2jsonResult.value   : []),
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
  console.log(`JobsWorldwide: ${unique.length} total jobs from all sources`);
  cacheJobs(unique);
  res.status(200).json(unique);
}
