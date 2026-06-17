// Africa & global job sources — RSS feeds + free APIs
// Sources: BrighterMonday KE, MyJobMag KE/NG/ZA, Fuzu, NGCareers, Jobicy Africa geos

import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const RSS_FEEDS = [
  // Kenya
  { url: "https://www.brightermonday.co.ke/listings.rss", source: "BrighterMonday" },
  { url: "https://www.myjobmag.co.ke/rss-jobs.xml", source: "MyJobMag" },
  { url: "https://vacancykenya.co.ke/feed/", source: "VacancyKenya" },
  { url: "https://kenyajob.com/feed/", source: "KenyaJob.com" },
  // Nigeria
  { url: "https://www.myjobmag.com/rss-jobs.xml", source: "MyJobMag NG" },
  { url: "https://ngcareers.com/feed/", source: "NGCareers" },
  { url: "https://www.jobgurus.com.ng/feed/", source: "JobGurus NG" },
  // South Africa
  { url: "https://www.pnet.co.za/rss/jobs.xml", source: "PNet SA" },
  { url: "https://www.myjobmag.co.za/rss-jobs.xml", source: "MyJobMag SA" },
  // Ghana
  { url: "https://www.myjobmag.com.gh/rss-jobs.xml", source: "MyJobMag GH" },
  // East Africa / Pan-Africa
  { url: "https://www.fuzu.com/feed", source: "Fuzu" },
  { url: "https://www.jobwebkenya.com/feed/", source: "JobwebKenya" },
];

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
    const location = get("location") || "Africa";
    if (title && link) {
      items.push({
        id: `af-${source.toLowerCase().replace(/\s+/g, "-")}-${encodeURIComponent(link).slice(0, 40)}`,
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

// Pull multiple Jobicy geo filters for African countries
async function fetchJobicyAfrica() {
  const geos = ["kenya", "nigeria", "south-africa", "ghana", "egypt", "ethiopia"];
  const results = await Promise.allSettled(
    geos.map(geo =>
      fetchWithTimeout(`https://jobicy.com/api/v2/remote-jobs?count=10&geo=${geo}`, {}, 8000)
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

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  };

  const [jobicyJobs, ...rssResults] = await Promise.allSettled([
    fetchJobicyAfrica(),
    ...RSS_FEEDS.map(({ url, source }) =>
      fetchWithTimeout(url, { headers }, 7000)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
        .then(xml => parseRSS(xml, source))
        .catch(err => { console.error(`RSS [${source}]: ${err.message}`); return []; })
    ),
  ]);

  const jobs = [
    ...(jobicyJobs.status === "fulfilled" ? jobicyJobs.value : []),
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
  console.log(`Africa jobs loaded: ${unique.length}`);
  res.status(200).json(unique);
}
