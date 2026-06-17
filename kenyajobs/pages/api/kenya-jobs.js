// Kenya job sources using RSS feeds parsed server-side
// Sources: BrighterMonday KE, MyJobMag KE, Fuzu KE, Nation Jobs KE

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

export default async function handler(req, res) {
  // Add cache header — 30 min cache to avoid hammering RSS feeds
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate");

  const results = await Promise.allSettled(
    RSS_FEEDS.map(({ url, source }) =>
      fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; JobsWorldwide/1.0)",
          "Accept": "application/rss+xml, application/xml, text/xml",
        },
      })
        .then(r => {
          if (!r.ok) throw new Error(`${source}: HTTP ${r.status}`);
          return r.text();
        })
        .then(xml => parseRSS(xml, source))
        .catch(err => {
          console.error(`Kenya jobs error [${source}]:`, err.message);
          return [];
        })
    )
  );

  const jobs = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value)
    .filter(j => j.title && j.url);

  console.log(`Kenya jobs loaded: ${jobs.length} total`);
  res.status(200).json(jobs);
}
