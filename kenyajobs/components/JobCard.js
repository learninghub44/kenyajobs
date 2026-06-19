import { MapPin, Clock, Building2, ArrowRight, Wifi, Banknote, Star } from "lucide-react";
import Link from "next/link";
import { saveJob } from "@/utils/jobCache";

const TYPE_STYLES = {
  "Full-time":  { pill: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  "Part-time":  { pill: "bg-amber-50 text-amber-800 border-amber-200",       dot: "bg-amber-400"  },
  "Contract":   { pill: "bg-violet-50 text-violet-800 border-violet-200",    dot: "bg-violet-500" },
  "Remote":     { pill: "bg-sky-50 text-sky-800 border-sky-200",             dot: "bg-sky-500"    },
  "Internship": { pill: "bg-rose-50 text-rose-800 border-rose-200",          dot: "bg-rose-400"   },
};

function timeAgo(dateStr) {
  if (!dateStr) return "Recently posted";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days}d ago`;
  if (days < 30) return `Posted ${Math.floor(days / 7)}w ago`;
  return `Posted ${new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function companyInitials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

function companyPalette(name) {
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

function formatSalary(job) {
  if (job.salary && typeof job.salary === "string") return job.salary;
  const min = job.annualSalaryMin ?? job.job_min_salary ?? job.salary_min;
  const max = job.annualSalaryMax ?? job.job_max_salary ?? job.salary_max;
  const currency = job.salaryCurrency || job.job_salary_currency || "";
  if (min && max) return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`.trim();
  if (min) return `${currency} ${Number(min).toLocaleString()}+`.trim();
  return null;
}

function excerpt(text, max = 120) {
  if (!text) return "";
  const plain = String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length <= max ? plain : plain.slice(0, max).trim() + "…";
}

export default function JobCard({ job }) {
  const title     = String(job.title || job.job_title || "Job Title");
  const company   = String(job.company || job.company_name || job.employer_name || "Company");
  const location  = String(job.location || job.candidate_required_location || job.job_city || "Worldwide");
  const jobType   = String(job.type || job.job_type || job.employment_type || "Full-time");
  const source    = String(job.source || "");
  const jobId     = job.id || job.job_id || encodeURIComponent(title);
  const posted    = timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc);
  const isRemote  = location.toLowerCase().includes("remote") || jobType.toLowerCase().includes("remote");
  const palette   = companyPalette(company);
  const logoUrl   = job.companyLogo || job.company_logo || job.employer_logo || job.companyLogo_url;
  const salary    = formatSalary(job);
  const isFeatured = Boolean(job.featured);
  const preview   = excerpt(job.description || job.job_description);
  const typeStyle = TYPE_STYLES[jobType] || { pill: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" };
  const initials  = companyInitials(company);

  return (
    <Link
      href={`/job/${jobId}`}
      onClick={() => saveJob(jobId, job)}
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-[0_4px_24px_rgba(59,130,246,0.10)] transition-all duration-200 flex flex-col"
    >
      {/* Featured ribbon */}
      {isFeatured && (
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 bg-amber-400 text-amber-900 text-sm font-bold px-2.5 py-1 rounded-full shadow-sm">
          <Star size={12} className="fill-amber-900" /> Featured
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Company row */}
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0 relative">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl} alt={company}
                className="w-12 h-12 rounded-lg object-contain border border-gray-100 bg-white p-0.5"
                onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold border flex-shrink-0"
              style={{ backgroundColor: palette.bg, color: palette.text, borderColor: palette.border, display: logoUrl ? "none" : "flex" }}
            >
              {initials}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate mb-0.5 flex items-center gap-1.5">
              <Building2 size={13} className="flex-shrink-0" />
              {company}
            </p>
            <h3 className="font-semibold text-gray-900 text-lg leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {/* Description preview */}
        {preview && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 -mt-1">{preview}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${typeStyle.pill}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeStyle.dot}`} />
            {jobType}
          </span>

          {isRemote && !jobType.toLowerCase().includes("remote") && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border bg-sky-50 text-sky-800 border-sky-200">
              <Wifi size={12} /> Remote
            </span>
          )}

          {salary && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              <Banknote size={12} /> {salary}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={13} />
              {location.split(",")[0]}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {posted}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
            Apply <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* Source strip */}
      {source && (
        <div className="px-5 pb-3 -mt-1">
          <span className="text-sm text-gray-400 font-medium">via {source}</span>
        </div>
      )}
    </Link>
  );
}
