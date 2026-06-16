// pages/job/[id].js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { fetchRemoteJobs, fetchEntryLevelJobs, fetchGraduateJobs, fetchWFHJobs } from "@/utils/api";

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadJob() {
      try {
        setLoading(true);
        // Fetch all jobs from all APIs and find matching one
        const [remote, entry, graduate, wfh] = await Promise.all([
          fetchRemoteJobs(),
          fetchEntryLevelJobs(),
          fetchGraduateJobs(),
          fetchWFHJobs(),
        ]);

        const allJobs = [...remote, ...entry, ...graduate, ...wfh];

        // Match by id or job_id
        const found = allJobs.find(
          (j) =>
            String(j.id) === String(id) ||
            String(j.job_id) === String(id) ||
            encodeURIComponent(j.title || j.job_title || "") === String(id)
        );

        if (found) {
          setJob(found);
          // Related = same category, exclude current
          const rel = allJobs
            .filter((j) => j !== found)
            .slice(0, 3);
          setRelated(rel);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  if (loading) return (
    <div className="text-center py-32 text-gray-500 text-lg">⏳ Loading job details...</div>
  );

  if (error || !job) return (
    <div className="text-center py-32">
      <p className="text-red-500 text-lg mb-4">❌ Job not found.</p>
      <Link href="/" className="text-blue-600 underline">← Back to Home</Link>
    </div>
  );

  // Normalize fields across APIs
  const title = job.title || job.job_title || "Job Title";
  const company = job.company_name || job.employer_name || job.company || "Company";
  const location = job.candidate_required_location || job.job_city || job.location?.display_name || "Kenya";
  const jobType = job.job_type || job.employment_type || job.contract_type || "Full-time";
  const description = job.description || job.job_description || "No description available.";
  const applyUrl = job.url || job.job_apply_link || job.redirect_url || "#";
  const datePosted = job.publication_date || job.job_posted_at_datetime_utc || job.created || "";
  const formattedDate = datePosted
    ? new Date(datePosted).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : "Recently";

  return (
    <>
      <Head>
        <title>{title} at {company} | KenyaJobs.co.ke</title>
        <meta name="description" content={`Apply for ${title} at ${company}. Location: ${location}.`} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Back Button */}
        <Link href="/" className="text-blue-600 text-sm hover:underline mb-6 inline-block">
          ← Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-blue-600 font-semibold text-lg mb-4">{company}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-blue-50 text-blue-700 text-sm px-4 py-1.5 rounded-full">📍 {location}</span>
            <span className="bg-green-50 text-green-700 text-sm px-4 py-1.5 rounded-full">💼 {jobType}</span>
            <span className="bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-full">🗓 Posted {formattedDate}</span>
          </div>

         {/* Apply Button */}

<a
  href={applyUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200 text-lg"
>
  Apply Now →
</a>

</div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
          <div
            className="text-gray-600 leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* AdSense Placeholder */}
        <div className="bg-gray-200 text-gray-400 text-center text-sm py-8 rounded-xl mb-8">
          Advertisement
        </div>

        {/* Apply Button Bottom */}

<a
  href={applyUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl transition-colors duration-200 text-lg"
>
  Apply for This Job →
</a>

        {/* Related Jobs */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Related Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((j, index) => {
                const relTitle = j.title || j.job_title || "Job";
                const relCompany = j.company_name || j.employer_name || "Company";
                const relId = j.id || j.job_id || encodeURIComponent(relTitle);
                return (
                  <Link
                    key={index}
                    href={`/job/${relId}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
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