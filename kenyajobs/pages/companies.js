import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Building2, Search, ArrowRight } from "lucide-react";

function companySlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Logo fetched via Google's S2 favicon service (reliable, no API key, works for any domain)
// Falls back to coloured initials avatar if the logo fails to load.
function CompanyLogo({ domain, name, color, initials, size = 48 }) {
  const [failed, setFailed] = useState(false);
  const logoUrl = `https://logo.dev/img/${domain}?size=128&format=png`;
  const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  if (failed) {
    return (
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
        style={{ width: size, height: size, backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      className="rounded-xl object-contain border border-gray-100 bg-white p-1 flex-shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => {
        // Try Google favicon as first fallback
        if (e.currentTarget.src !== fallbackUrl) {
          e.currentTarget.src = fallbackUrl;
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

const FEATURED_COMPANIES = [
  { name: "Safaricom",              domain: "safaricom.co.ke",        sector: "Telecoms",           location: "Nairobi",         color: "#16a34a", initials: "SA" },
  { name: "KCB Bank",               domain: "kcbgroup.com",            sector: "Banking & Finance",  location: "Nairobi",         color: "#1d4ed8", initials: "KC" },
  { name: "Equity Bank",            domain: "equitybank.co.ke",        sector: "Banking & Finance",  location: "Nairobi",         color: "#b91c1c", initials: "EQ" },
  { name: "Nation Media Group",     domain: "nationmedia.com",         sector: "Media",              location: "Nairobi",         color: "#0891b2", initials: "NM" },
  { name: "Kenya Airways",          domain: "kenya-airways.com",       sector: "Aviation",           location: "Nairobi",         color: "#dc2626", initials: "KQ" },
  { name: "Jubilee Insurance",      domain: "jubileeinsurance.com",    sector: "Insurance",          location: "Nairobi",         color: "#7c3aed", initials: "JI" },
  { name: "East African Breweries", domain: "eabl.com",                sector: "FMCG",               location: "Nairobi",         color: "#d97706", initials: "EA" },
  { name: "Co-op Bank",             domain: "co-opbank.co.ke",         sector: "Banking & Finance",  location: "Nairobi",         color: "#059669", initials: "CB" },
  { name: "Twiga Foods",            domain: "twigafoods.com",          sector: "AgriTech",           location: "Nairobi",         color: "#16a34a", initials: "TW" },
  { name: "M-KOPA",                 domain: "m-kopa.com",              sector: "FinTech / Energy",   location: "Nairobi",         color: "#f59e0b", initials: "MK" },
  { name: "Andela",                 domain: "andela.com",              sector: "Tech",               location: "Remote / Africa", color: "#2563eb", initials: "AN" },
  { name: "UNICEF Kenya",           domain: "unicef.org",              sector: "NGO / UN",           location: "Nairobi",         color: "#0ea5e9", initials: "UN" },
];

const SECTORS = ["All", "Tech", "Banking & Finance", "NGO / UN", "FMCG", "Telecoms", "AgriTech", "FinTech / Energy", "Media", "Insurance", "Aviation"];

export default function Companies() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");

  const filtered = FEATURED_COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === "All" || c.sector === sector;
    return matchSearch && matchSector;
  });

  return (
    <>
      <Head>
        <title>Companies Hiring in Kenya | JobsWorldwide</title>
        <meta name="description" content="Browse top companies actively hiring in Kenya. Find open roles at leading Kenyan and multinational employers." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Employers</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Companies Hiring Now</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Explore roles at Kenya&apos;s leading employers — from banks and telcos to NGOs and tech startups. Click any company to see their open jobs.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies or sectors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Company grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No companies match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filtered.map(c => (
              <Link
                key={c.name}
                href={`/company/${companySlug(c.name)}?name=${encodeURIComponent(c.name)}`}
                className="group flex items-start gap-4 bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-5 hover:shadow-md transition-all duration-200"
              >
                <CompanyLogo
                  domain={c.domain}
                  name={c.name}
                  color={c.color}
                  initials={c.initials}
                  size={48}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sector}</p>
                  <p className="text-xs text-gray-400">{c.location}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600">
                    View open roles <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for employers */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <Building2 size={32} className="mx-auto text-blue-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Is your company hiring?</h2>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Get your open roles in front of thousands of active Kenyan job seekers. No middlemen — your listing goes straight into our feed.
          </p>
          <a
            href="mailto:hello@jobsworldwide.online?subject=Post a Job"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Get Listed — Email Us
          </a>
        </div>
      </div>
    </>
  );
}
