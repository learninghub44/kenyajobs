import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DOMPurify from "dompurify";
import { loadJob, saveJob } from "@/utils/jobCache";
import AdSlot from "@/components/AdSlot";
import { MapPin, Briefcase, ArrowUpRight, Building2, Clock, Share2, ChevronRight, Banknote, Link as LinkIcon, Tag, ListChecks, CheckCircle2, Gift, Search } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "Recently posted";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  return `Posted on ${new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
}

// Different sources expose salary differently — a plain string (manual jobs,
// Remotive), a min/max range (Jobicy, JSearch, Adzuna), or nothing at all.
function formatSalary(job) {
  if (job.salary && typeof job.salary === "string") return job.salary;
  const min = job.annualSalaryMin ?? job.job_min_salary ?? job.salary_min;
  const max = job.annualSalaryMax ?? job.job_max_salary ?? job.salary_max;
  const currency = job.salaryCurrency || job.job_salary_currency || "";
  if (min && max) return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`.trim();
  if (min) return `${currency} ${Number(min).toLocaleString()}+`.trim();
  return null;
}

function companyColor(name = "") {
  const colors = [
    ["#1d4ed8", "#dbeafe"],
    ["#047857", "#d1fae5"],
    ["#7c3aed", "#ede9fe"],
    ["#dc2626", "#fee2e2"],
    ["#d97706", "#fef3c7"],
    ["#0891b2", "#cffafe"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

async function fetchAllSources() {
  const results = await Promise.allSettled([
    fetch("/api/africa-jobs").then(r => r.json()).catch(() => []),
    fetch("/api/remote-jobs").then(r => r.json()).catch(() => []),
    fetch("/api/entry-level-jobs").then(r => r.json()).catch(() => []),
    fetch("/api/graduate-jobs").then(r => r.json()).catch(() => []),
    fetch("/api/wfh-jobs").then(r => r.json()).catch(() => []),
    fetch("/api/manual-jobs").then(r => r.json()).catch(() => []),
  ]);
  return results.filter(r => r.status === "fulfilled" && Array.isArray(r.value)).flatMap(r => r.value);
}

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Prefer the exact job data the user just saw on the listing page — avoids depending on
    // slow/rate-limited live sources returning the identical job again on a fresh request.
    const cached = loadJob(id);
    if (cached) {
      async function applyCachedJob() {
        setJob(cached);
        setNotFound(false);
        setLoading(false);
        // Still fetch in the background, just to populate "Similar Jobs" — never blocks the
        // main content and never flips this job to "not found" if a source is slow/unavailable.
        try {
          const allJobs = await fetchAllSources();
          setRelated(allJobs.filter(j =>
            (j.id || j.job_id) !== id && (j.source === cached.source || j.location === cached.location)
          ).slice(0, 3));
        } catch {
          // Related jobs are a nice-to-have; ignore failures.
        }
      }
      applyCachedJob();
      return;
    }

    // No cached data (direct link, shared URL, new tab, or cleared session storage).
    let cancelled = false;
    async function findJob() {
      setLoading(true);
      setNotFound(false);
      try {
        // Fast, reliable path: a single DB lookup. Covers manually-posted jobs and any
        // live-pulled job that's been seen by any *-jobs API route recently — which is
        // almost always true, since every listing page writes through to this cache.
        // This is what makes opening a job in a new tab / sharing a link / refreshing the
        // page actually work, instead of depending on every one of ~15 live sources
        // responding identically (and within their timeout) a second time.
        const lookupRes = await fetch(`/api/job-lookup/${id}`);
        if (lookupRes.ok) {
          const found = await lookupRes.json();
          if (cancelled) return;
          setJob(found);
          saveJob(id, found);
          setLoading(false);
          fetchAllSources()
            .then(allJobs => { if (!cancelled) setRelated(allJobs.filter(j => (j.id || j.job_id) !== id && (j.source === found.source || j.location === found.location)).slice(0, 3)); })
            .catch(() => {});
          return;
        }

        // Last resort: the job hasn't been cached yet (e.g. opened within seconds of a
        // cold start) — scan every live source fresh.
        const allJobs = await fetchAllSources();
        if (cancelled) return;
        const found = allJobs.find(j =>
          String(j.id) === String(id) ||
          String(j.job_id) === String(id) ||
          String(j.title || j.job_title || "") === String(id)
        );
        if (found) {
          setJob(found);
          saveJob(id, found);
          setRelated(allJobs.filter(j => j !== found && (j.source === found.source || j.location === found.location)).slice(0, 3));
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    findJob();
    return () => { cancelled = true; };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-5 bg-gray-100 rounded w-1/3" />
            <div className="flex gap-2">
              <div className="h-8 bg-gray-100 rounded-full w-24" />
              <div className="h-8 bg-gray-100 rounded-full w-20" />
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-40" />
          </div>
          <div className="bg-white rounded-2xl border p-8 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${90 - i * 8}%` }} />)}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6 h-64" />
      </div>
    </div>
  );

  if (notFound || !job) return (
    <>
      <Head>
        <title>Job Not Found | JobsWorldwide</title>
      </Head>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="relative w-full max-w-sm mx-auto mb-8 rounded-2xl overflow-hidden">
          <Image
            src="/dream-job-signpost.jpg"
            alt="Signpost pointing the way to your dream job"
            width={1280}
            height={854}
            className="w-full h-auto"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">This job has wandered off</h1>
        <p className="text-gray-500 mb-8">
          It may have expired, been filled, or the link is out of date. Your dream job is still out there though — let&apos;s keep looking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            ← Back to Jobs
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Search size={15} /> Search Jobs
          </Link>
        </div>
      </div>
    </>
  );

  const title = job.title || job.job_title || "Job Title";
  const company = job.company || job.company_name || job.employer_name || "Company";
  const location = String(job.location || job.candidate_required_location || job.job_city || "Worldwide");
  const jobType = String(job.type || job.job_type || job.employment_type || "Full-time");
  const isRemote = location.toLowerCase().includes("remote") || jobType.toLowerCase().includes("remote");
  const description = job.description || job.job_description || "No description available.";
  const sanitizedDescription = typeof window !== "undefined"
    ? DOMPurify.sanitize(description, { ALLOWED_TAGS: ["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "h3", "h4", "a"], ALLOWED_ATTR: ["href", "target", "rel"] })
    : "";
  const applyUrl = job.url || job.job_apply_link || job.redirect_url || "#";
  const source = job.source || "Source";
  const posted = timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc);
  const [fg, bg] = companyColor(company);
  const logoUrl = job.companyLogo || job.company_logo || job.employer_logo;
  const companyWebsite = job.companyWebsite || job.employer_website;
  const salary = formatSalary(job);
  const category = job.category;
  const tags = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
  const highlights = job.highlights && typeof job.highlights === "object" ? job.highlights : null;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": title,
    "description": String(job.description || job.job_description || "").replace(/<[^>]*>/g, " ").slice(0, 500),
    "datePosted": job.date || job.publication_date || job.job_posted_at_datetime_utc || new Date().toISOString(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": company,
      "logo": job.companyLogo || job.company_logo || job.employer_logo || "",
    },
    "jobLocation": {
      "@type": "Place",
      "address": { "@type": "PostalAddress", "addressLocality": location },
    },
    "employmentType": jobType?.toUpperCase().replace("-", "_") || "FULL_TIME",
    "jobLocationType": isRemote ? "TELECOMMUTE" : undefined,
    "url": `https://jobsworldwide.online/job/${id}`,
    "directApply": Boolean(applyUrl),
  };

  return (
    <>
      <Head>
        <title>{title} at {company} | JobsWorldwide</title>
        <meta name="description" content={`Apply for ${title} at ${company}. ${location}.`} />
        <meta property="og:title"       content={`${title} at ${company}`} />
        <meta property="og:description" content={`${jobType} · ${location} — Apply now on JobsWorldwide`} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={`https://jobsworldwide.online/job/${id}`} />
        <meta property="og:image"       content="https://jobsworldwide.online/og-image.jpg" />
        <meta name="twitter:card"       content="summary_large_image" />
        <meta name="twitter:title"      content={`${title} at ${company}`} />
        <meta name="twitter:description" content={`${jobType} · ${location} — Apply now on JobsWorldwide`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-gray-800 font-medium truncate">{title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Job header card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-20 sm:h-24" style={{ background: `linear-gradient(135deg, ${bg}, white)` }} />
                <div className="px-7 pb-7 -mt-10">
                  <div className="flex items-start gap-5 mb-6">
                    {/* Company logo */}
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={company}
                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border-4 border-white shadow-md bg-white"
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 border-4 border-white shadow-md"
                      style={{ backgroundColor: bg, color: fg, display: logoUrl ? "none" : "flex" }}>
                      {company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm mb-0.5" style={{ color: fg }}>{company}</p>
                          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{title}</h1>
                          {source && <p className="text-xs text-gray-400 mt-1">via {source}</p>}
                        </div>
                        <button onClick={handleShare}
                          className="flex-shrink-0 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all text-gray-400"
                          title="Copy link">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                      <MapPin size={13} className="text-blue-500" /> {location}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                      <Briefcase size={13} className="text-green-500" /> {jobType}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                      <Clock size={13} className="text-orange-500" /> {posted}
                    </span>
                    {salary && (
                      <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        <Banknote size={13} className="text-green-600" /> {salary}
                      </span>
                    )}
                    {category && (
                      <span className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full">
                        <Tag size={13} className="text-indigo-500" /> {category}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tags.map((t) => (
                        <span key={t} className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  {tags.length === 0 && <div className="mb-6" />}

                  {/* Apply button */}
                  <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-sm text-base">
                    Apply on {source} <ArrowUpRight size={17} />
                  </a>
                  {copied && <span className="ml-3 text-sm text-green-600 font-medium">Link copied!</span>}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                  Job Description
                </h2>
                <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
              </div>

              {/* Highlights: Qualifications / Responsibilities / Benefits (JSearch sources) */}
              {highlights && (highlights.Qualifications || highlights.Responsibilities || highlights.Benefits) && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {highlights.Responsibilities?.length > 0 && (
                    <HighlightCard icon={ListChecks} color="#2563eb" bg="#eff6ff" title="Responsibilities" items={highlights.Responsibilities} />
                  )}
                  {highlights.Qualifications?.length > 0 && (
                    <HighlightCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" title="Qualifications" items={highlights.Qualifications} />
                  )}
                  {highlights.Benefits?.length > 0 && (
                    <HighlightCard icon={Gift} color="#d97706" bg="#fffbeb" title="Benefits" items={highlights.Benefits} />
                  )}
                </div>
              )}

              {/* Bottom apply */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lg">Ready to apply?</p>
                  <p className="text-blue-100 text-sm">You&apos;ll be directed to {source} to complete your application.</p>
                </div>
                <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 bg-white text-blue-700 font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
                  Apply Now <ArrowUpRight size={14} className="inline ml-1" />
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Job overview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
                <ul className="space-y-4">
                  {[
                    { icon: Building2, label: "Company", value: company, color: "text-blue-500" },
                    { icon: MapPin, label: "Location", value: location, color: "text-red-500" },
                    { icon: Briefcase, label: "Job Type", value: jobType, color: "text-green-500" },
                    { icon: Globe2, label: "Source", value: source, color: "text-purple-500" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <li key={label} className="flex items-start gap-3">
                      <div className={`mt-0.5 ${color}`}><Icon size={16} /></div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    </li>
                  ))}
                  {companyWebsite && (
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 text-indigo-500"><LinkIcon size={16} /></div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">Company Website</p>
                        <a href={companyWebsite} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:underline truncate block">
                          {companyWebsite.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Ad slot */}
              <AdSlot placement="sidebar" adSlot="0000000000" />

              {/* Related jobs */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-3">
                    {related.map((j, i) => {
                      const relTitle = j.title || j.job_title || "Job";
                      const relCompany = j.company || j.company_name || "Company";
                      const relId = j.id || j.job_id || encodeURIComponent(relTitle);
                      const [rfg, rbg] = companyColor(relCompany);
                      return (
                        <Link key={i} href={`/job/${relId}`} onClick={() => saveJob(relId, j)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: rbg, color: rfg }}>
                            {relCompany.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate transition-colors">{relTitle}</p>
                            <p className="text-xs text-gray-400 truncate">{relCompany}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Need to import Globe2 separately
function Globe2({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}

function HighlightCard({ icon: Icon, color, bg, title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
          <Icon size={14} />
        </span>
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.slice(0, 8).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-snug">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
