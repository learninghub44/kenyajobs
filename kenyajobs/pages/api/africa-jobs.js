import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { cachedFetch } from "@/lib/apiResponseCache";
import crypto from "crypto";

function hashId(input) {
  return crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, 16);
}

// ── Confirmed working RSS feeds (correct URLs, verified active) ──────────────
const RSS_FEEDS = [
  // Kenya — confirmed active RSS feeds
  { url: "https://www.brightermonday.co.ke/listings.rss",         source: "BrighterMonday",     location: "Kenya" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml",               source: "MyJobMag Kenya",     location: "Kenya" },
  { url: "https://vacancykenya.co.ke/feed/",                      source: "VacancyKenya",       location: "Kenya" },
  { url: "https://www.jobwebkenya.com/feed/",                     source: "Jobweb Kenya",       location: "Kenya" },
  { url: "https://www.corporatestaffing.co.ke/feed/",             source: "Corporate Staffing", location: "Kenya" },
  { url: "https://kenyacurrent.com/category/jobs/feed/",          source: "Kenya Current",      location: "Kenya" },
  // East Africa
  { url: "https://www.brightermonday.co.ug/listings.rss",         source: "BrighterMonday UG",  location: "Uganda" },
  { url: "https://www.brightermonday.co.tz/listings.rss",         source: "BrighterMonday TZ",  location: "Tanzania" },
  { url: "https://www.fuzu.com/feed",                             source: "Fuzu",               location: "East Africa" },
  // West Africa
  { url: "https://www.myjobmag.com/rss-jobs.xml",                 source: "MyJobMag Nigeria",   location: "Nigeria" },
  { url: "https://ngcareers.com/feed/",                           source: "NGCareers",          location: "Nigeria" },
  { url: "https://www.myjobmag.com.gh/rss-jobs.xml",              source: "MyJobMag Ghana",     location: "Ghana" },
  // Southern Africa
  { url: "https://www.myjobmag.co.za/rss-jobs.xml",               source: "MyJobMag SA",        location: "South Africa" },
  // North Africa
  { url: "https://www.wuzzuf.net/feed/jobs",                      source: "Wuzzuf Egypt",       location: "Egypt" },
  // International NGO / Dev
  { url: "https://reliefweb.int/jobs/kenya/rss.xml",              source: "ReliefWeb Kenya",    location: "Kenya" },
  { url: "https://www.devex.com/jobs/rss?country=KE",             source: "Devex Kenya",        location: "Kenya" },
  { url: "https://jobs.undp.org/cgi-bin/helpers/rss.cgi?region=Africa", source: "UNDP Africa", location: "Africa" },
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
    // Many WordPress-based job sites (Jobweb Kenya, VacancyKenya, Corporate Staffing,
    // Kenya Current, etc.) emit a short auto-generated excerpt in <description> but
    // publish the FULL job posting body in <content:encoded>. Prefer that when present,
    // since <description> alone was the cause of incomplete job details for these feeds.
    const fullContent = get("content:encoded");
    const shortDescription = get("description");
    const description = fullContent.length > shortDescription.length ? fullContent : shortDescription;
    const company = get("author") || get("dc:creator") || source;
    const location = get("location") || defaultLocation || "Africa";
    if (title && link) {
      items.push({
        id: `rss-${hashId(source + link)}`,
        title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#039;/g, "'"),
        company: company.replace(/&amp;/g, "&"),
        location,
        type: "Full-time",
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url: link,
        description: description.replace(/<[^>]*>/g, "").trim(),
        source,
      });
    }
  }
  return items;
}

// ── Remotive — free JSON API, no key ─────────────────────────────────────────
async function fetchRemotive() {
  try {
    const r = await fetchWithTimeout("https://remotive.com/api/remote-jobs?limit=40", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" }
    }, 8000);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return (d.jobs || []).map(j => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || "Remote",
      type: j.job_type || "Full-time",
      date: j.publication_date,
      url: j.url,
      description: (j.description || "").replace(/<[^>]*>/g, ""),
      source: "Remotive",
      companyLogo: j.company_logo_url || j.company_logo,
    }));
  } catch(e) { console.warn("[Remotive]", e.message); return []; }
}

// ── Jobicy — free JSON API, no key ───────────────────────────────────────────
async function fetchJobicy() {
  const geos = ["kenya", "nigeria", "south-africa", "ghana", "egypt", "worldwide"];
  const results = await Promise.allSettled(
    geos.map(geo =>
      fetchWithTimeout(`https://jobicy.com/api/v2/remote-jobs?count=15&geo=${geo}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" }
      }, 7000)
        .then(r => r.ok ? r.json() : { jobs: [] })
        .then(d => (d.jobs || []).map(j => ({
          id: `jobicy-${geo}-${j.id}`,
          title: j.jobTitle,
          company: j.companyName,
          location: j.jobGeo || geo,
          type: j.jobType || "Full-time",
          date: j.pubDate,
          url: j.url,
          description: (j.jobDescription || "").replace(/<[^>]*>/g, ""),
          source: "Jobicy",
          companyLogo: j.companyLogo,
        })))
        .catch(e => { console.warn(`[Jobicy ${geo}]`, e.message); return []; })
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Arbeitnow — free JSON API ─────────────────────────────────────────────────
async function fetchArbeitnow() {
  try {
    const r = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" }
    }, 7000);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return (d.data || []).slice(0, 30).map(j => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title,
      company: j.company_name,
      location: j.location || "Europe",
      type: j.remote ? "Remote" : "Full-time",
      date: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
      url: j.url,
      description: (j.description || "").replace(/<[^>]*>/g, ""),
      source: "Arbeitnow",
    }));
  } catch(e) { console.warn("[Arbeitnow]", e.message); return []; }
}

// ── The Muse — free JSON API ──────────────────────────────────────────────────
async function fetchTheMuse() {
  try {
    const r = await fetchWithTimeout(
      "https://www.themuse.com/api/public/jobs?page=0&descending=true&api_key=public",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" } },
      7000
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return (d.results || []).map(j => ({
      id: `muse-${j.id}`,
      title: j.name,
      company: j.company?.name || "Company",
      location: j.locations?.map(l => l.name).join(", ") || "Worldwide",
      type: j.levels?.[0]?.name || "Full-time",
      date: j.publication_date || new Date().toISOString(),
      url: j.refs?.landing_page || `https://www.themuse.com/jobs/${j.id}`,
      description: (j.contents || "").replace(/<[^>]*>/g, ""),
      source: "The Muse",
    }));
  } catch(e) { console.warn("[TheMuse]", e.message); return []; }
}

// ── Himalayas — free JSON API ─────────────────────────────────────────────────
async function fetchHimalayas() {
  try {
    const r = await fetchWithTimeout("https://himalayas.app/jobs/api?limit=30", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" }
    }, 7000);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return (d.jobs || []).map(j => ({
      id: `himalayas-${j.id || j.slug}`,
      title: j.title,
      company: j.company?.name || "Company",
      location: j.locationRestrictions?.join(", ") || "Worldwide",
      type: j.employmentType || "Remote",
      date: j.pubDate || j.createdAt || new Date().toISOString(),
      url: j.applicationLink || `https://himalayas.app/jobs/${j.slug}`,
      description: (j.description || "").replace(/<[^>]*>/g, ""),
      source: "Himalayas",
      companyLogo: j.company?.logo,
    }));
  } catch(e) { console.warn("[Himalayas]", e.message); return []; }
}

// ── ReliefWeb — free JSON API (most reliable for Africa NGO jobs) ─────────────
async function fetchReliefWeb() {
  try {
    const r = await fetchWithTimeout(
      "https://api.reliefweb.int/v1/jobs?appname=jobsworldwide&profile=list&slim=1&limit=30&sort[]=date:desc&filter[field]=country&filter[value][]=Kenya&filter[value][]=Uganda&filter[value][]=Tanzania&filter[value][]=Nigeria&filter[value][]=Ethiopia",
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" } },
      8000
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
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
        description: (f.body || "").replace(/<[^>]*>/g, ""),
        source: "ReliefWeb",
      };
    });
  } catch(e) { console.warn("[ReliefWeb]", e.message); return []; }
}

// ── LinkedIn via rss2json proxy ───────────────────────────────────────────────
async function fetchLinkedIn() {
  const searches = [
    { q: "jobs+in+kenya",       label: "Kenya" },
  ];
  const results = await Promise.allSettled(
    searches.map(({ q, label }) => {
      const rssUrl = `https://www.linkedin.com/jobs/search/?keywords=${q}&f_TPR=r604800&format=rss`;
      return fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=15`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" } },
        8000
      )
        .then(r => r.ok ? r.json() : { items: [], status: "error" })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `linkedin-${hashId(j.link || j.title)}`,
            title: j.title,
            company: j.author || "Company",
            location: label,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: j.link,
            description: (j.description || "").replace(/<[^>]*>/g, ""),
            source: "LinkedIn",
          })).filter(j => j.title && j.url);
        })
        .catch(e => { console.warn("[LinkedIn]", e.message); return []; });
    })
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Indeed via rss2json proxy ─────────────────────────────────────────────────
async function fetchIndeed() {
  const searches = [
    { q: "jobs", l: "Nairobi,+Kenya",  label: "Nairobi, Kenya" },
  ];
  const results = await Promise.allSettled(
    searches.map(({ q, l, label }) => {
      const rssUrl = `https://www.indeed.com/rss?q=${q}&l=${l}&sort=date&fromage=14`;
      return fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=15`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" } },
        8000
      )
        .then(r => r.ok ? r.json() : { items: [], status: "error" })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `indeed-${hashId(j.link || j.title)}`,
            title: j.title,
            company: j.author || "Company",
            location: label,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: j.link,
            description: (j.description || "").replace(/<[^>]*>/g, ""),
            source: "Indeed",
          })).filter(j => j.title && j.url);
        })
        .catch(e => { console.warn("[Indeed]", e.message); return []; });
    })
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Kenya RSS via rss2json proxy ──────────────────────────────────────────────
const KE_RSS_VIA_PROXY = [
  { url: "https://www.ngojobskenya.com/feed/",         source: "NGO Jobs Kenya",     location: "Kenya" },
  { url: "https://turinjobs.com/feed/",                source: "TurinJobs",          location: "Kenya" },
  { url: "https://kenyajobalert.com/feed/",            source: "Kenya Job Alert",    location: "Kenya" },
  { url: "https://nafasiwork.com/feed/",               source: "Nafasi Work",        location: "East Africa" },
  { url: "https://eastafricajobs.com/feed/",           source: "East Africa Jobs",   location: "East Africa" },
  { url: "https://www.developmentaid.org/rss/jobs/kenya", source: "DevelopmentAid", location: "Kenya" },
];

async function fetchKenyaViaProxy() {
  const results = await Promise.allSettled(
    KE_RSS_VIA_PROXY.map(({ url, source, location }) =>
      fetchWithTimeout(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=20`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)" } },
        7000
      )
        .then(r => r.ok ? r.json() : { status: "error", items: [] })
        .then(d => {
          if (d.status !== "ok") return [];
          return (d.items || []).map(j => ({
            id: `proxy-${hashId(source + (j.link || j.title))}`,
            title: (j.title || "").replace(/<[^>]*>/g, ""),
            company: j.author || source,
            location,
            type: "Full-time",
            date: j.pubDate ? new Date(j.pubDate).toISOString() : new Date().toISOString(),
            url: j.link || j.guid,
            description: (j.description || "").replace(/<[^>]*>/g, ""),
            source,
          })).filter(j => j.title && j.url);
        })
        .catch(e => { console.warn(`[${source}]`, e.message); return []; })
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ── Main handler ──────────────────────────────────────────────────────────────
async function fetchAll() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const [
    remotiveRes, jobicyRes, arbeitnowRes, museRes,
    himalayasRes, reliefWebRes, linkedinRes, indeedRes,
    kenyaProxyRes,
    ...rssResults
  ] = await Promise.allSettled([
    fetchRemotive(),
    fetchJobicy(),
    fetchArbeitnow(),
    fetchTheMuse(),
    fetchHimalayas(),
    fetchReliefWeb(),
    fetchLinkedIn(),
    fetchIndeed(),
    fetchKenyaViaProxy(),
    // Direct RSS feeds
    ...RSS_FEEDS.map(({ url, source, location }) =>
      fetchWithTimeout(url, { headers }, 7000)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source, location))
        .catch(e => { console.warn(`[RSS:${source}]`, e.message); return []; })
    ),
  ]);

  const getValue = r => r.status === "fulfilled" ? r.value : [];

  const jobs = [
    ...getValue(kenyaProxyRes),   // Kenya-specific first
    ...getValue(linkedinRes),
    ...getValue(indeedRes),
    ...getValue(reliefWebRes),
    ...getValue(remotiveRes),
    ...getValue(museRes),
    ...getValue(jobicyRes),
    ...getValue(arbeitnowRes),
    ...getValue(himalayasRes),
    ...rssResults.flatMap(r => getValue(r)),
  ].filter(j => j.title && j.url);

  // Deduplicate by URL
  const seen = new Set();
  const unique = jobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  unique.sort((a, b) => new Date(b.date) - new Date(a.date));

  const sourceCounts = {};
  unique.forEach(j => { sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1; });
  console.log(`[africa-jobs] Total: ${unique.length} | Sources:`, JSON.stringify(sourceCounts));

  return unique;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  // This route is the heaviest fan-out (RSS feeds + rss2json.com proxy calls for
  // LinkedIn/Indeed/Kenya feeds), so it gets a longer fresh window than the other
  // job routes to minimize how often we hit the free rss2json.com rate limit.
  const unique = await cachedFetch("africa-jobs", fetchAll, {
    freshMs: 20 * 60 * 1000,   // 20 min fully fresh
    staleMs: 2 * 60 * 60 * 1000, // up to 2h stale-while-revalidate
  });

  res.status(200).json(unique);
}
