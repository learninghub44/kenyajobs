import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MapPin, Briefcase, Calendar, ArrowUpRight, Building2, Clock, Share2, Bookmark, ChevronRight } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "Recently posted";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  return `Posted on ${new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
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
    async function loadJob() {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          fetch("/api/africa-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/remote-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/entry-level-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/graduate-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/wfh-jobs").then(r => r.json()).catch(() => []),
        ]);
        const allJobs = results.filter(r => r.status === "fulfilled" && Array.isArray(r.value)).flatMap(r => r.value);
        const found = allJobs.find(j =>
          String(j.id) === String(id) ||
          String(j.job_id) === String(id) ||
          encodeURIComponent(j.title || j.job_title || "") === String(id)
        );
        if (found) {
          setJob(found);
          setRelated(allJobs.filter(j => j !== found && (j.source === found.source || j.location === found.location)).slice(0, 3));
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
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
    <div className="text-center py-32">
      <p className="text-gray-500 text-lg mb-4">Job not found.</p>
      <Link href="/" className="text-blue-600 hover:underline">← Back to Jobs</Link>
    </div>
  );

  const title = job.title || job.job_title || "Job Title";
  const company = job.company || job.company_name || job.employer_name || "Company";
  const location = job.location || job.candidate_required_location || job.job_city || "Africa";
  const jobType = job.type || job.job_type || job.employment_type || "Full-time";
  const description = job.description || job.job_description || "No description available.";
  const applyUrl = job.url || job.job_apply_link || job.redirect_url || "#";
  const source = job.source || "Source";
  const posted = timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc);
  const [fg, bg] = companyColor(company);

  return (
    <>
      <Head>
        <title>{title} at {company} | KenyaJobs</title>
        <meta name="description" content={`Apply for ${title} at ${company}. ${location}.`} />
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
              <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
                <div className="flex items-start gap-5 mb-6">
                  {/* Company logo */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0 border-2"
                    style={{ backgroundColor: bg, color: fg, borderColor: bg }}>
                    {company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-blue-600 font-semibold text-sm mb-0.5">{company}</p>
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
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    <MapPin size={13} className="text-blue-500" /> {location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    <Briefcase size={13} className="text-green-500" /> {jobType}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                    <Clock size={13} className="text-orange-500" /> {posted}
                  </span>
                </div>

                {/* Apply button */}
                <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-sm text-base">
                  Apply on {source} <ArrowUpRight size={17} />
                </a>
                {copied && <span className="ml-3 text-sm text-green-600 font-medium">Link copied!</span>}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                  Job Description
                </h2>
                <div className="text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: description }} />
              </div>

              {/* Bottom apply */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-lg">Ready to apply?</p>
                  <p className="text-blue-100 text-sm">You'll be directed to {source} to complete your application.</p>
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
                </ul>
              </div>

              {/* Ad slot */}
              <div className="bg-gray-100 text-gray-400 text-center text-xs py-8 rounded-2xl border border-dashed border-gray-300">
                Advertisement
              </div>

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
                        <Link key={i} href={`/job/${relId}`}
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
