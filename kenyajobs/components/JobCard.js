import { MapPin, Clock, Building2, ArrowRight, Wifi, Banknote, Star } from "lucide-react";
import Link from "next/link";
import { saveJob } from "@/utils/jobCache";

function companySlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const TYPE_STYLES = {
  "Full-time":  { pill: "bg-success-light text-success border-success/20", dot: "bg-success" },
  "Part-time":  { pill: "bg-warning-light text-[#E8710A] border-[#E8710A]/20", dot: "bg-warning" },
  "Contract":   { pill: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "Remote":     { pill: "bg-info-light text-info border-info/20", dot: "bg-info" },
  "Internship": { pill: "bg-error-light text-error border-error/20", dot: "bg-error" },
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
  if (min && max) return `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`.trim();
  if (min) return `${currency} ${Number(min).toLocaleString()}+`.trim();
  return null;
}

function excerpt(text, max = 120) {
  if (!text) return "";
  const plain = String(text).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length <= max ? plain : plain.slice(0, max).trim() + "...";
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
  const typeStyle = TYPE_STYLES[jobType] || { pill: "bg-surface-muted text-text-secondary border-border", dot: "bg-text-tertiary" };
  const initials  = companyInitials(company);

  return (
    <Link
      href={`/job/${jobId}`}
      onClick={() => saveJob(jobId, job)}
      className="group relative bg-white border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {isFeatured && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded">
          <Star size={12} className="fill-white" /> Featured
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Company row */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 relative">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl} alt={company}
                className="w-12 h-12 rounded-lg object-contain border border-border bg-white p-1"
                onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold border flex-shrink-0"
              style={{ backgroundColor: palette.bg, color: palette.text, borderColor: palette.border, display: logoUrl ? "none" : "flex" }}
            >
              {initials}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/company/${companySlug(company)}?name=${encodeURIComponent(company)}`}
              onClick={e => e.stopPropagation()}
              className="text-xs font-medium text-text-secondary truncate mb-0.5 flex items-center gap-1.5 hover:text-primary transition-colors w-fit"
            >
              <Building2 size={12} className="flex-shrink-0" />
              {company}
            </Link>
            <h3 className="font-semibold text-text-primary text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        {/* Description preview */}
        {preview && (
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{preview}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border ${typeStyle.pill}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeStyle.dot}`} />
            {jobType}
          </span>

          {isRemote && !jobType.toLowerCase().includes("remote") && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border bg-info-light text-info border-info/20">
              <Wifi size={12} /> Remote
            </span>
          )}

          {salary && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border bg-success-light text-success border-success/20">
              <Banknote size={12} /> {salary}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={12} />
              {location.split(",")[0]}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {posted}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
            Apply <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {source && (
        <div className="px-5 pb-3 -mt-1">
          <span className="text-xs text-text-tertiary font-medium">via {source}</span>
        </div>
      )}
    </Link>
  );
}
