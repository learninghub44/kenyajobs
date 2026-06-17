import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const RSS_FEEDS = [
  { url: "https://www.brightermonday.co.ke/listings.rss",   source: "BrighterMonday KE" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml",         source: "MyJobMag KE" },
  { url: "https://www.brightermonday.co.ug/listings.rss",   source: "BrighterMonday UG" },
  { url: "https://www.brightermonday.co.tz/listings.rss",   source: "BrighterMonday TZ" },
  { url: "https://www.myjobmag.com/rss-jobs.xml",           source: "MyJobMag NG" },
  { url: "https://www.myjobmag.co.za/rss-jobs.xml",         source: "MyJobMag SA" },
  { url: "https://www.pnet.co.za/rss/jobs.xml",             source: "PNet SA" },
  { url: "https://www.wuzzuf.net/feed/jobs",                source: "Wuzzuf EG" },
  { url: "https://www.fuzu.com/feed",                       source: "Fuzu" },
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
        id: `rss-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(link).toString("base64").slice(0, 30)}`,
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

// Remotive — global remote jobs, reliable free API
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
      description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
      source: "Remotive",
    }));
  } catch { return []; }
}

// The Muse — global jobs API, no key needed
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
      description: (j.contents || "").replace(/<[^>]*>/g, "").slice(0, 300),
      source: "The Muse",
    }));
  } catch { return []; }
}

// Jobicy — global remote jobs across many regions
async function fetchJobicy() {
  const geos = ["usa", "uk", "canada", "australia", "europe", "india", "nigeria", "south-africa"];
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

// Arbeitnow — European jobs, free API
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
      description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
      source: "Arbeitnow",
    }));
  } catch { return []; }
}

// JobsDB Asia — RSS for Asia-Pacific jobs
async function fetchAsiaPacificRSS() {
  const feeds = [
    { url: "https://hk.jobsdb.com/en-hk/rss/JobSearch.ashx?KEYWORD=&LOCATION=&INDUSTRY=&posted=1", source: "JobsDB HK", location: "Hong Kong" },
    { url: "https://www.seek.com.au/jobs-in-all-work-types/rss", source: "Seek AU", location: "Australia" },
    { url: "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.naukri.com%2Frss%2Fjobs%3Fsrc%3Drss", source: "Naukri IN", location: "India" },
  ];
  const results = await Promise.allSettled(
    feeds.map(({ url, source, location }) =>
      fetchWithTimeout(url, {}, 5000)
        .then(r => r.ok ? r.text() : "")
        .then(xml => parseRSS(xml, source, location))
        .catch(() => [])
    )
  );
  return results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
}

// ReliefWeb — international NGO/UN jobs
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
        description: (f.body || "").replace(/<[^>]*>/g, "").slice(0, 300),
        source: "ReliefWeb",
      };
    });
  } catch { return []; }
}

// Himalayas — global remote jobs
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
      description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
      source: "Himalayas",
    }));
  } catch { return []; }
}

// rss2json proxy for feeds that block server-side requests
async function fetchViaRss2Json() {
  const feeds = [
    { url: "https://www.brightermonday.co.ke/listings.rss", source: "BrighterMonday KE", location: "Kenya" },
    { url: "https://www.jobwebkenya.com/feed/",             source: "Jobweb KE",          location: "Kenya" },
    { url: "https://www.careersportal.co.za/feed/",         source: "CareersPortal SA",   location: "South Africa" },
    { url: "https://ngcareers.com/feed/",                   source: "NGCareers",          location: "Nigeria" },
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
            id: `rss2json-${source.toLowerCase().replace(/\s+/g, "-")}-${Buffer.from(j.link || j.title).toString("base64").slice(0, 20)}`,
            title: j.title,
            company: j.author || source,
            location,
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
    asiaResult,
    reliefWebResult,
    himalayasResult,
    rss2jsonResult,
    ...rssResults
  ] = await Promise.allSettled([
    fetchRemotive(),
    fetchTheMuse(),
    fetchJobicy(),
    fetchArbeitnow(),
    fetchAsiaPacificRSS(),
    fetchReliefWeb(),
    fetchHimalayas(),
    fetchViaRss2Json(),
    ...RSS_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(url, { headers }, 3000)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source))
        .catch(() => [])
    ),
  ]);

  const jobs = [
    ...(remotiveResult.status === "fulfilled"   ? remotiveResult.value   : []),
    ...(museResult.status === "fulfilled"        ? museResult.value        : []),
    ...(jobicyResult.status === "fulfilled"      ? jobicyResult.value      : []),
    ...(arbeitnowResult.status === "fulfilled"   ? arbeitnowResult.value   : []),
    ...(asiaResult.status === "fulfilled"        ? asiaResult.value        : []),
    ...(reliefWebResult.status === "fulfilled"   ? reliefWebResult.value   : []),
    ...(himalayasResult.status === "fulfilled"   ? himalayasResult.value   : []),
    ...(rss2jsonResult.status === "fulfilled"    ? rss2jsonResult.value    : []),
    ...rssResults.filter(r => r.status === "fulfilled").flatMap(r => r.value),
  ].filter(j => j.title && j.url);

  const seen = new Set();
  const unique = jobs.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  unique.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`JobsWorldwide: ${unique.length} total jobs from all sources`);
  res.status(200).json(unique);
}
