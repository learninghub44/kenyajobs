const SITE_URL = "https://jobsworldwide.online";

const STATIC_PAGES = [
  { path: "/",                  priority: "1.0",  changefreq: "hourly"  },
  { path: "/remote-jobs",       priority: "0.9",  changefreq: "hourly"  },
  { path: "/entry-level",       priority: "0.9",  changefreq: "hourly"  },
  { path: "/graduate-jobs",     priority: "0.9",  changefreq: "hourly"  },
  { path: "/work-from-home",    priority: "0.9",  changefreq: "hourly"  },
  { path: "/search",            priority: "0.8",  changefreq: "daily"   },
  { path: "/about",             priority: "0.6",  changefreq: "monthly" },
  { path: "/contact",           priority: "0.6",  changefreq: "monthly" },
  { path: "/privacy-policy",    priority: "0.4",  changefreq: "monthly" },
  { path: "/terms-and-conditions", priority: "0.4", changefreq: "monthly" },
];

function generateSitemap(pages) {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

export default function Sitemap() { return null; }

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(generateSitemap(STATIC_PAGES));
  res.end();
  return { props: {} };
}
