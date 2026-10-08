import { MapPin, Clock, ArrowUpRight, Wifi, Banknote, Building2 } from "lucide-react";
import Link from "next/link";
import { saveJob } from "@/utils/jobCache";

function companySlug(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently posted";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Recently posted";
  const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(name) {
  return String(name || "Company").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "CO";
}

function formatSalary(job) {
  if (job.salary && typeof job.salary === "string") return job.salary;
  const min = job.annualSalaryMin ?? job.job_min_salary ?? job.salary_min;
  const max = job.annualSalaryMax ?? job.job_max_salary ?? job.salary_max;
  const currency = job.salaryCurrency || job.job_salary_currency || "";
  if (min && max) return `${currency} ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`.trim();
  if (min) return `${currency} ${Number(min).toLocaleString()}+`.trim();
  return "";
}

function cleanText(value, max = 150) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export default function JobCard({ job }) {
  const title = String(job.title || job.job_title || "Job opportunity");
  const company = String(job.company || job.company_name || job.employer_name || "Company");
  const location = String(job.location || job.candidate_required_location || job.job_city || "Worldwide");
  const jobType = String(job.type || job.job_type || job.employment_type || "Full-time");
  const source = String(job.source || "");
  const id = job.id || job.job_id || encodeURIComponent(title);
  const salary = formatSalary(job);
  const remote = location.toLowerCase().includes("remote") || jobType.toLowerCase().includes("remote");
  const logo = job.companyLogo || job.company_logo || job.employer_logo;
  const description = cleanText(job.description || job.job_description);
  const translated = Boolean(job.translated || job.isTranslated || job.translation);
  
  return (
    <Link
      href={`/job/${id}`}
      onClick={() => saveJob(id, job)}
      className="job-card group"
    >
      <div className="job-card-company">
        {logo ? (
          <img
            src={logo}
            alt=""
            className="job-company-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling.style.display = "flex"; }}
          />
        ) : null}
        <span className="job-company-logo job-company-fallback" style={{ display: logo ? "none" : "flex" }}>
          {initials(company)}
        </span>
      </div>

      <div className="job-card-main">
        <div className="job-card-heading">
          <div className="min-w-0">
            <div className="job-company-name">
              <Building2 size={13} />
              <span>{company}</span>
            </div>
            <h3 className="job-card-title">{title}</h3>
          </div>
          <span className="job-card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
        </div>

        <div className="job-card-meta">
          <span><MapPin size={14} />{location}</span>
          <span><Clock size={14} />{timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc)}</span>
          <span className="job-type">{jobType}</span>
          {remote && !jobType.toLowerCase().includes("remote") && <span className="job-type"><Wifi size={13} />Remote</span>}
          {salary && <span className="job-salary"><Banknote size={13} />{salary}</span>}
        </div>

        {description && <p className="job-card-excerpt">{description}{description.length >= 150 ? "…" : ""}</p>}

        <div className="job-card-footer">
          <span className="job-source">{source ? `via ${source}` : "Online Jobs"}</span>
          {translated && <span className="job-translated">English translation</span>}
          <span className="job-view">View job <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </Link>
  );
}
