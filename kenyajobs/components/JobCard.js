import { MapPin, Briefcase, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function JobCard({ job }) {
  const title = job.title || job.job_title || "Job Title";
  const company = job.company || job.company_name || job.employer_name || "Company";
  const location = job.location || job.candidate_required_location || job.job_city || "Worldwide";
  const jobType = job.type || job.job_type || job.employment_type || "Full-time";
  const datePosted = job.date || job.publication_date || job.job_posted_at_datetime_utc || job.created || "";
  const source = job.source || "";
  const jobId = job.id || job.job_id || encodeURIComponent(title);

  const formattedDate = datePosted
    ? new Date(datePosted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Recently";

  return (
    <Link
      href={`/job/${jobId}`}
      className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase">
            {company.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{title}</h3>
            <p className="text-sm text-blue-600 font-medium mt-0.5 truncate">{company}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
            <MapPin size={11} /> {location}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
            <Briefcase size={11} /> {jobType}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
            <Calendar size={11} /> {formattedDate}
          </span>
        </div>

        {source && (
          <p className="text-xs text-gray-400 mt-2">via {source}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 w-full text-center bg-blue-600 group-hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-200">
        View Details <ArrowRight size={13} />
      </div>
    </Link>
  );
}
