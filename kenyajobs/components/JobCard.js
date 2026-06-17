import { MapPin, Clock, Building2, ArrowRight, Wifi } from "lucide-react";
import Link from "next/link";
import { saveJob } from "@/utils/jobCache";

const TAG_COLORS = {
  "Full-time": "bg-green-50 text-green-700 border-green-200",
  "Part-time": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Contract": "bg-purple-50 text-purple-700 border-purple-200",
  "Remote": "bg-blue-50 text-blue-700 border-blue-200",
  "Internship": "bg-orange-50 text-orange-700 border-orange-200",
};

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Generate a consistent color from company name
function companyColor(name) {
  const colors = [
    ["#1d4ed8", "#dbeafe"], // blue
    ["#047857", "#d1fae5"], // green
    ["#7c3aed", "#ede9fe"], // purple
    ["#dc2626", "#fee2e2"], // red
    ["#d97706", "#fef3c7"], // amber
    ["#0891b2", "#cffafe"], // cyan
    ["#be185d", "#fce7f3"], // pink
    ["#065f46", "#d1fae5"], // emerald
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function JobCard({ job }) {
  const title = String(job.title || job.job_title || "Job Title");
  const company = String(job.company || job.company_name || job.employer_name || "Company");
  const location = String(job.location || job.candidate_required_location || job.job_city || "Worldwide");
  const jobType = String(job.type || job.job_type || job.employment_type || "Full-time");
  const source = String(job.source || "");
  const jobId = job.id || job.job_id || encodeURIComponent(title);
  const posted = timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc);
  const isRemote = location.toLowerCase().includes("remote") || jobType.toLowerCase().includes("remote");
  const [fg, bg] = companyColor(company);

  return (
    <Link href={`/job/${jobId}`} onClick={() => saveJob(jobId, job)}
      className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Company logo placeholder */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 border"
            style={{ backgroundColor: bg, color: fg, borderColor: bg }}>
            {company.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{company}</p>
            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
        {/* Bookmark placeholder */}
        <div className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${TAG_COLORS[jobType] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
          {jobType}
        </span>
        {isRemote && (
          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
            <Wifi size={10} /> Remote
          </span>
        )}
        {source && (
          <span className="text-xs text-gray-400 px-2.5 py-1 rounded-full border border-gray-100 bg-gray-50">
            via {source}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><MapPin size={11} />{location.split(",")[0]}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{posted}</span>
        </div>
        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Job <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
