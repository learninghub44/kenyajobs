const SITE_URL = "https://kenyajobs.vercel.app";

const PAGES = [
  { path: "/",                     priority: "1.0", changefreq: "daily"   },
  { path: "/remote-jobs",          priority: "0.9", changefreq: "daily"   },
  { path: "/entry-level",          priority: "0.9", changefreq: "daily"   },
  { path: "/graduate-jobs",        priority: "0.9", changefreq: "daily"   },
  { path: "/work-from-home",       priority: "0.9", changefreq: "daily"   },
  { path: "/internships",          priority: "0.9", changefreq: "daily"   },
  { path: "/africa-jobs",          priority: "0.9", changefreq: "daily"   },
  { path: "/search",               priority: "0.8", changefreq: "daily"   },
  { path: "/companies",            priority: "0.7", changefreq: "weekly"  },
  { path: "/job-trends",           priority: "0.7", changefreq: "weekly"  },
  { path: "/cv-tips",              priority: "0.7", changefreq: "monthly" },
  { path: "/advertise",            priority: "0.7", changefreq: "monthly" },
  { path: "/faq",                  priority: "0.6", changefreq: "monthly" },
  { path: "/about",                priority: "0.6", changefreq: "monthly" },
  { path: "/contact",              priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy",       priority: "0.4", changefreq: "monthly" },
  { path: "/terms-and-conditions", priority: "0.4", changefreq: "monthly" },
];

export default function SitemapXML() {
  return null;
}

export async function getServerSideProps({ res }) {
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.write(xml);
  res.end();

  return { props: {} };
}
