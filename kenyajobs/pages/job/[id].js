import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DOMPurify from "dompurify";
import { loadJob, saveJob } from "@/utils/jobCache";
import { MapPin, BriefcaseBusiness, Clock3, Building2, ExternalLink, Share2, ArrowLeft, Globe2, Banknote, CheckCircle2 } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "Recently posted";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Recently posted";
  const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  return `Posted ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
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

function initials(name) {
  return String(name || "Company").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase() || "CO";
}

async function findRelated(found) {
  const endpoints = ["/api/africa-jobs", "/api/remote-jobs", "/api/entry-level-jobs", "/api/graduate-jobs", "/api/wfh-jobs"];
  const results = await Promise.allSettled(endpoints.map(u => fetch(u).then(r => r.json()).catch(() => [])));
  return results.flatMap(r => r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [])
    .filter(j => String(j.id || j.job_id) !== String(found.id || found.job_id))
    .filter(j => j.source === found.source || String(j.location || "").toLowerCase() === String(found.location || "").toLowerCase())
    .slice(0, 3);
}

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [translatedJob, setTranslatedJob] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      const cached = loadJob(id);
      if (cached) {
        setJob(cached);
        setLoading(false);
        findRelated(cached).then(x => !cancelled && setRelated(x)).catch(() => {});
        return;
      }

      try {
        const response = await fetch(`/api/job-lookup/${encodeURIComponent(id)}`);
        if (response.ok) {
          const found = await response.json();
          if (cancelled) return;
          setJob(found);
          saveJob(id, found);
          setLoading(false);
          findRelated(found).then(x => !cancelled && setRelated(x)).catch(() => {});
          return;
        }
      } catch {}

      setNotFound(true);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!job) return;
    const title = job.title || job.job_title || "";
    const description = job.description || job.job_description || "";
    const sourceLanguage = job.language || job.lang || job.originalLanguage || "";
    const sample = (title + " " + description).toLowerCase();
    const foreignMarkers = [
      " français ", " français", " español ", " español", " deutsch ", " português ", " italiano ",
      " arbeiten ", " deutschland ", " experiencia ", " requisitos ", " responsabilidades ",
      " candidature ", " veuillez ", " poste ", " entreprise ", " emploi ", " compétences ",
      " trabajo ", " salario ", " beneficios ", " candidato ", " experiencia "
    ];
    const looksForeign = foreignMarkers.some(marker => sample.includes(marker)) ||
      (sourceLanguage && !String(sourceLanguage).toLowerCase().startsWith("en"));
    if (!looksForeign) return;
    let cancelled = false;
    setTranslationLoading(true);
    fetch("/api/translate-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, language: sourceLanguage })
    }).then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data?.title) setTranslatedJob(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTranslationLoading(false); });
    return () => { cancelled = true; };
  }, [job]);

  if (loading) return (
    <main className="job-detail-page">
      <div className="job-detail-shell">
        <div className="job-skeleton-head" />
        <div className="job-detail-layout">
          <div><div className="job-skeleton-card" /><div className="job-skeleton-card tall" /></div>
          <div className="job-skeleton-card side" />
        </div>
      </div>
    </main>
  );

  if (notFound || !job) return (
    <main className="job-detail-page">
      <div className="job-not-found">
        <Image src="/dream-job-signpost.jpg" alt="" width={640} height={426} className="job-not-found-image" />
        <h1>Job no longer available</h1>
        <p>This listing may have expired, been filled, or been removed from its original source.</p>
        <Link href="/" className="button-primary">Browse current jobs</Link>
      </div>
    </main>
  );

  const rawTitle = job.title || job.job_title || "Job opportunity";
  const rawDescription = job.description || job.job_description || "No description is available for this listing.";
  const title = translatedJob?.title || rawTitle;
  const description = translatedJob?.description || rawDescription;
  const company = job.company || job.company_name || job.employer_name || "Company";
  const location = String(job.location || job.candidate_required_location || job.job_city || "Worldwide");
  const type = String(job.type || job.job_type || job.employment_type || "Full-time");
  const source = String(job.source || "Original source");
  const applyUrl = job.url || job.job_apply_link || job.redirect_url || "#";
  const salary = formatSalary(job);
  const remote = location.toLowerCase().includes("remote") || type.toLowerCase().includes("remote");
  const logo = job.companyLogo || job.company_logo || job.employer_logo;
  const safeDescription = typeof window !== "undefined"
    ? DOMPurify.sanitize(description, { ALLOWED_TAGS: ["p","br","ul","ol","li","strong","em","b","i","h2","h3","h4","a"], ALLOWED_ATTR: ["href","target","rel"] })
    : String(description).replace(/<script[\\s\\S]*?<\/script>/gi, "");

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  const meta = [
    [MapPin, "Location", location],
    [BriefcaseBusiness, "Job type", type],
    [Clock3, "Posted", timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc)],
    ...(salary ? [[Banknote, "Salary", salary]] : []),
  ];

  return (
    <>
      <Head>
        <title>{title} at {company} | Online Jobs</title>
        <meta name="description" content={`Apply for ${title} at ${company}. ${location}.`} />
        <meta property="og:title" content={`${title} at ${company}`} />
        <meta property="og:description" content={`${type} · ${location} — Online Jobs`} />
        <meta property="og:url" content={`https://onlinejobs.christech.co.ke/job/${id}`} />
      </Head>

      <main className="job-detail-page">
        <div className="job-detail-shell">
          <Link href="/" className="job-back"><ArrowLeft size={15} /> Back to jobs</Link>

          <div className="job-detail-layout">
            <div className="job-detail-main">
              <header className="job-detail-header">
                <div className="job-company-mark">
                  {logo ? <img src={logo} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <span>{initials(company)}</span>}
                </div>
                <div className="job-detail-title-wrap">
                  <div className="job-eyebrow">{source}</div>
                  <h1>{title}</h1>
                  <Link href={`/company/${company.toLowerCase().replace(/[^a-z0-9\\s-]/g, "").trim().replace(/\\s+/g, "-")}?name=${encodeURIComponent(company)}`} className="job-company-link">
                    <Building2 size={15} /> {company}
                  </Link>
                  <div className="job-meta-line">
                    <span><MapPin size={15} />{location}</span>
                    <span><BriefcaseBusiness size={15} />{type}</span>
                    {remote && <span><Globe2 size={15} />Remote</span>}
                  </div>
                </div>
              </header>

              {translatedJob && (
                <div className="translation-note">
                  <CheckCircle2 size={16} />
                  <span>Translated to English from {job.language || job.lang || "the original language"}.</span>
                </div>
              )}
              {translationLoading && !translatedJob && (
                <div className="translation-note muted">Preparing the English version of this listing…</div>
              )}

              <article className="job-description-panel">
                <div className="job-section-heading"><span /> <h2>Job description</h2></div>
                <div className="job-prose" dangerouslySetInnerHTML={{ __html: safeDescription }} />
              </article>

              {Array.isArray(job.tags) && job.tags.length > 0 && (
                <section className="job-description-panel">
                  <div className="job-section-heading"><span /><h2>Skills & tags</h2></div>
                  <div className="job-tags">{job.tags.slice(0, 12).map((tag, i) => <span key={i}>{tag}</span>)}</div>
                </section>
              )}

              <div className="job-source-note">
                <Globe2 size={16} />
                <div><strong>Application source</strong><p>This listing is provided by {source}. You will complete your application on the original source.</p></div>
              </div>
            </div>

            <aside className="job-detail-sidebar">
              <div className="apply-panel">
                <div>
                  <p className="apply-kicker">Ready to apply?</p>
                  <h2>{title}</h2>
                </div>
                <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="apply-button">
                  Apply on {source} <ExternalLink size={16} />
                </a>
                <button onClick={copyLink} className="share-button"><Share2 size={15} />{copied ? "Link copied" : "Share job"}</button>
              </div>

              <div className="summary-panel">
                <h2>Job summary</h2>
                {meta.map(([Icon, label, value]) => (
                  <div className="summary-row" key={label}>
                    <Icon size={17} />
                    <div><span>{label}</span><strong>{value}</strong></div>
                  </div>
                ))}
                <div className="summary-row"><Globe2 size={17} /><div><span>Source</span><strong>{source}</strong></div></div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <section className="related-jobs">
              <div className="related-heading"><div><p className="job-eyebrow">Keep looking</p><h2>More opportunities</h2></div><Link href="/">View all jobs</Link></div>
              <div className="related-list">
                {related.map((item, index) => (
                  <Link key={item.id || index} href={`/job/${item.id || item.job_id}`} onClick={() => saveJob(item.id || item.job_id, item)} className="related-job">
                    <div><strong>{item.title || item.job_title}</strong><span>{item.company || item.company_name || "Company"} · {item.location || "Worldwide"}</span></div>
                    <ExternalLink size={16} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
