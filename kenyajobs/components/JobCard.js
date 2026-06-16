// components/JobCard.js
import Link from "next/link";

export default function JobCard({ job }) {
  // Normalize fields across different APIs
  const title = job.title || job.job_title || "Job Title";
  const company = job.company_name || job.employer_name || job.company || "Company";
  const location = job.candidate_required_location || job.job_city || job.location?.display_name || "Kenya";
  const jobType = job.job_type || job.employment_type || job.contract_type || "Full-time";
  const datePosted = job.publication_date || job.job_posted_at_datetime_utc || job.created || "";
  const formattedDate = datePosted ? new Date(datePosted).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric"
  }) : "Recently";

  const jobId = job.id || job.job_id || encodeURIComponent(title);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{title}</h3>

      {/* Company */}
      <p className="text-blue-600 font-medium text-sm mb-3">{company}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">📍 {location}</span>
        <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">💼 {jobType}</span>
        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">🗓 {formattedDate}</span>
      </div>

      {/* Button */}
      <Link
        href={`/job/${jobId}`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200"
      >
        View Job →
      </Link>
    </div>
  );
}