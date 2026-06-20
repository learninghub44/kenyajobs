import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Search, ExternalLink, Briefcase, ArrowRight } from "lucide-react";

function companySlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const FEATURED_COMPANIES = [
  { name: "Safaricom", sector: "Telecoms", location: "Nairobi", openRoles: "Multiple", query: "safaricom", color: "#16a34a", initials: "SA" },
  { name: "KCB Bank", sector: "Banking & Finance", location: "Nairobi", openRoles: "Multiple", query: "kcb", color: "#1d4ed8", initials: "KC" },
  { name: "Equity Bank", sector: "Banking & Finance", location: "Nairobi", openRoles: "Multiple", query: "equity bank", color: "#b91c1c", initials: "EQ" },
  { name: "Nation Media Group", sector: "Media", location: "Nairobi", openRoles: "Multiple", query: "nation media", color: "#0891b2", initials: "NM" },
  { name: "Kenya Airways", sector: "Aviation", location: "Nairobi", openRoles: "Multiple", query: "kenya airways", color: "#dc2626", initials: "KQ" },
  { name: "Jubilee Insurance", sector: "Insurance", location: "Nairobi", openRoles: "Multiple", query: "jubilee insurance", color: "#7c3aed", initials: "JI" },
  { name: "East African Breweries", sector: "FMCG", location: "Nairobi", openRoles: "Multiple", query: "eabl", color: "#d97706", initials: "EA" },
  { name: "Co-op Bank", sector: "Banking & Finance", location: "Nairobi", openRoles: "Multiple", query: "co-op bank kenya", color: "#059669", initials: "CB" },
  { name: "Twiga Foods", sector: "AgriTech", location: "Nairobi", openRoles: "Multiple", query: "twiga foods", color: "#16a34a", initials: "TW" },
  { name: "M-KOPA", sector: "FinTech / Energy", location: "Nairobi", openRoles: "Multiple", query: "m-kopa", color: "#f59e0b", initials: "MK" },
  { name: "Andela", sector: "Tech", location: "Remote / Africa", openRoles: "Multiple", query: "andela", color: "#2563eb", initials: "AN" },
  { name: "UNICEF Kenya", sector: "NGO / UN", location: "Nairobi", openRoles: "Multiple", query: "unicef kenya", color: "#0ea5e9", initials: "UN" },
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
            Explore roles at Kenya's leading employers — from banks and telcos to NGOs and tech startups. Click any company to search their open jobs.
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
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initials}
                </div>
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
