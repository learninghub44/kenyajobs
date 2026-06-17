import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MapPin, Briefcase, Calendar, ArrowUpRight } from "lucide-react";

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadJob() {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          fetch("/api/remote-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/entry-level-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/graduate-jobs").then(r => r.json()).catch(() => []),
          fetch("/api/wfh-jobs").then(r => r.json()).catch(() => []),
        ]);

        const allJobs = results
          .filter(r => r.status === "fulfilled" && Array.isArray(r.value))
          .flatMap(r => r.value);

        const found = allJobs.find(j =>
          String(j.id) === String(id) ||
          String(j.job_id) === String(id) ||
          encodeURIComponent(j.title || j.job_title || "") === String(id)
        );

        if (found) {
          setJob(found);
          setRelated(allJobs.filter(j => j !== found).slice(0, 3));
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

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-100 rounded-lg w-24" />
          <div className="h-8 bg-gray-100 rounded-lg w-20" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-40" />
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
  const location = job.location || job.candidate_required_location || job.job_city || "Worldwide";
  const jobType = job.type || job.job_type || job.employment_type || "Full-time";
  const description = job.description || job.job_description || "No description available.";
  const applyUrl = job.url || job.job_apply_link || job.redirect_url || "#";
  const datePosted = job.date || job.publication_date || job.job_posted_at_datetime_utc || job.created || "";
  const formattedDate = datePosted
    ? new Date(datePosted).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : "Recently";
  const source = job.source || "";

  return (
    <>
      <Head>
        <title>{title} at {company} | JobsWorldwide</title>
        <meta name="description" content={`Apply for ${title} at ${company}. Location: ${location}.`} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="text-blue-600 text-sm hover:underline mb-6 inline-block">
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 font-bold text-xl flex items-center justify-center flex-shrink-0 uppercase">
              {company.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
              <p className="text-blue-600 font-semibold text-lg mt-1">{company}</p>
              {source && <p className="text-xs text-gray-400 mt-0.5">via {source}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-xl">
              <MapPin size={13} /> {location}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-xl">
              <Briefcase size={13} /> {jobType}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-xl">
              <Calendar size={13} /> Posted {formattedDate}
            </span>
          </div>

          <a href={applyUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200 text-base">
            Apply Now <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
          <div className="text-gray-600 leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }} />
        </div>

        <div className="bg-gray-100 text-gray-400 text-center text-sm py-8 rounded-xl mb-8">
          Advertisement
        </div>

        <a href={applyUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors duration-200 text-base mb-10">
          Apply for This Job <ArrowUpRight size={16} />
        </a>

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">More Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((j, i) => {
                const relTitle = j.title || j.job_title || "Job";
                const relCompany = j.company || j.company_name || "Company";
                const relId = j.id || j.job_id || encodeURIComponent(relTitle);
                return (
                  <Link key={i} href={`/job/${relId}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{relTitle}</p>
                    <p className="text-blue-600 text-xs">{relCompany}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
