// pages/company/[slug].js
// Employer profile page — shows all live jobs from one company.
// URL: /company/safaricom, /company/andela, /company/unicef-kenya, etc.

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
import {
  Building2, MapPin, Globe, Briefcase, ChevronRight,
  RefreshCw, ExternalLink, Search, ArrowLeft,
} from "lucide-react";

// Colour palette for avatar (same as JobCard)
function companyPalette(name = "") {
  const palettes = [
    { bg: "#EEF2FF", text: "#3730A3", border: "#C7D2FE" },
    { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
    { bg: "#FDF4FF", text: "#6B21A8", border: "#E9D5FF" },
    { bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
    { bg: "#F0F9FF", text: "#075985", border: "#BAE6FD" },
    { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" },
    { bg: "#F7FEE7", text: "#3F6212", border: "#D9F99D" },
    { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

function companyInitials(name = "") {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

// Derive a display name from the slug
function slugToName(slug = "") {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function CompanyProfile() {
  const router = useRouter();
  const { slug } = router.query;

  // The query param ?name=Exact Company Name is set by companies.js links
  // so we get the canonical name; otherwise we derive it from the slug.
  const companyName = (router.query.name || slugToName(slug || "")).trim();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    if (!companyName) return;
    setLoading(true);
    setData(null);

    fetch(`/api/company-jobs?company=${encodeURIComponent(companyName)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyName]);

  const palette  = companyPalette(companyName);
  const initials = companyInitials(companyName);

  const jobs = data?.jobs || [];

  // Unique job types for filter pills
  const types = ["All", ...new Set(jobs.map(j => j.type).filter(Boolean))];

  const filtered = jobs.filter(j => {
    const matchType   = filter === "All" || j.type === filter;
    const matchSearch = !search || (j.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.location || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const canonicalSlug = slug || "";
  const pageTitle     = `${companyName} Jobs | KenyaJobs`;
  const pageDesc      = `Browse all open jobs at ${companyName}. ${data?.totalJobs || ""} live listings aggregated from top job boards.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <link rel="canonical" href={`https://kenyajobs.online/company/${canonicalSlug}`} />

        {/* JSON-LD Organisation schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": companyName,
              "url": data?.website || undefined,
              "logo": data?.logo || undefined,
              "description": `${companyName} jobs aggregated from live job boards.`,
              "sameAs": data?.website ? [data.website] : [],
            }),
          }}
        />
      </Head>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight size={13} />
          <Link href="/companies" className="hover:text-gray-600 transition-colors">Companies</Link>
          <ChevronRight size={13} />
          <span className="text-gray-700 font-medium truncate">{companyName}</span>
        </div>
      </div>

      {/* ── Company Hero ── */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start gap-6">
            {/* Logo / avatar */}
            <div className="flex-shrink-0">
              {data?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.logo}
                  alt={companyName}
                  className="w-20 h-20 rounded-2xl object-contain border border-gray-100 bg-white p-1 shadow-sm"
                  onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold border shadow-sm"
                style={{
                  backgroundColor: palette.bg,
                  color: palette.text,
                  borderColor: palette.border,
                  display: data?.logo ? "none" : "flex",
                }}
              >
                {initials}
              </div>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{companyName}</h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-sm text-gray-500">
                {data?.locations?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {data.locations.slice(0, 3).join(" · ")}
                  </span>
                )}
                {data?.website && (
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline"
                  >
                    <Globe size={14} /> Website <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                  <Briefcase size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    {loading ? "…" : data?.totalJobs || 0} open {data?.totalJobs === 1 ? "role" : "roles"}
                  </span>
                </div>
                {data?.types?.slice(0, 3).map(t => (
                  <div key={t} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-sm text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Back link — mobile-friendly */}
            <Link
              href="/companies"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={14} /> All companies
            </Link>
          </div>
        </div>
      </div>

      {/* ── Jobs section ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${companyName} jobs…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Type filter pills */}
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                  filter === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && data && (
          <p className="text-sm text-gray-400 mb-5">
            {filtered.length === 0
              ? "No matching jobs found."
              : `Showing ${filtered.length} of ${jobs.length} job${jobs.length !== 1 ? "s" : ""} at ${companyName}`}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        )}

        {/* No jobs state */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <Building2 size={40} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No live listings found</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              We couldn't find any current openings for {companyName} in our live feeds right now. They may not be actively recruiting, or listings may have expired.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/search?q=${encodeURIComponent(companyName)}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Search size={14} /> Try a search
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <ArrowLeft size={14} /> Other companies
              </Link>
            </div>
          </div>
        )}

        {/* Job grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.slice(0, 6).map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Ad slot mid-page */}
            {filtered.length > 6 && (
              <div className="my-8">
                <AdSlot slot="company-mid" />
              </div>
            )}

            {filtered.length > 6 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                {filtered.slice(6).map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Refresh hint */}
        {!loading && jobs.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
            <RefreshCw size={11} />
            Job listings refresh automatically every few hours from live sources.
          </div>
        )}

        {/* Employer CTA */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <Building2 size={28} className="mx-auto text-blue-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Work at {companyName}?</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Know of an opening not listed here? Help us keep this page up to date by getting in touch.
          </p>
          <a
            href={`mailto:hello@jobsworldwide.online?subject=Company Jobs — ${encodeURIComponent(companyName)}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </>
  );
}
