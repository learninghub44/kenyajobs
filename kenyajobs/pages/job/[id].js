import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DOMPurify from "dompurify";
import { loadJob, saveJob } from "@/utils/jobCache";
import { MapPin, BriefcaseBusiness, Clock3, Building2, ExternalLink, Share2, ArrowLeft, Globe2, Banknote, CheckCircle2 } from "lucide-react";


function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function schemaEmploymentType(type = "") {
  const value = String(type).toLowerCase();
  if (value.includes("full")) return "FULL_TIME";
  if (value.includes("part")) return "PART_TIME";
  if (value.includes("contract") || value.includes("freelance")) return "CONTRACTOR";
  if (value.includes("temporary")) return "TEMPORARY";
  if (value.includes("intern")) return "INTERN";
  return null;
}

function buildJobPostingSchema(job, { title, description, company, location, type, remote, logo, applyUrl, salary }) {
  const posted = normalizeDate(job.date || job.publication_date || job.job_posted_at_datetime_utc);
  const min = job.annualSalaryMin ?? job.job_min_salary ?? job.salary_min;
  const max = job.annualSalaryMax ?? job.job_max_salary ?? job.salary_max;
  const currency = job.salaryCurrency || job.job_salary_currency || "";
  const employmentType = schemaEmploymentType(type);
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: String(description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    url: `https://onlinejobs.christech.co.ke/job/${encodeURIComponent(job.id || job.job_id || "")}`,
    hiringOrganization: {
      "@type": "Organization",
      name: String(company)
    }
  };

  if (posted) schema.datePosted = posted;
  if (logo) schema.hiringOrganization.logo = logo;
  if (employmentType) schema.employmentType = employmentType;

  if (remote) {
    schema.jobLocationType = "TELECOMMUTE";
  } else {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: String(location)
      }
    };
  }

  if (min != null || max != null) {
    const salaryValue = {};
    if (min != null) salaryValue.minValue = Number(min);
    if (max != null) salaryValue.maxValue = Number(max);
    if (currency) salaryValue.currency = currency;
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      ...salaryValue,
      value: {
        "@type": "QuantitativeValue",
        ...(min != null ? { minValue: Number(min) } : {}),
        ...(max != null ? { maxValue: Number(max) } : {}),
        ...(currency ? { unitText: "YEAR", currency } : {})
      }
    };
  }

  return schema;
}

function detectForeignLanguage(title = "", description = "", explicit = "") {
  const value = ` ${String(title)} ${String(description)} `.toLowerCase().replace(/<[^>]*>/g, " ");
  const declared = String(explicit || "").toLowerCase().trim();
  if (declared && !/^(en|eng|english)([-_]|$)/.test(declared)) return declared;

  const scripts = [
    ["ar", /[\u0600-\u06ff]/],
    ["zh", /[\u4e00-\u9fff]/],
    ["ja", /[\u3040-\u30ff]/],
    ["ru", /[\u0400-\u04ff]/],
    ["el", /[\u0370-\u03ff]/]
  ];
  for (const [language, pattern] of scripts) if (pattern.test(value)) return language;

  const languages = {
    fr: [" veuillez ", " poste ", " entreprise ", " emploi ", " compétences ", " candidature ", " salaire ", " expérience ", " formation ", " recrutement ", " rémunération ", " avantages ", " travailler ", " responsable ", " recherché "],
    es: [" experiencia ", " requisitos ", " responsabilidades ", " trabajo ", " salario ", " beneficios ", " candidato ", " habilidades ", " ofertas ", " oferta ", " empleo ", " vacante ", " empresa ", " puesto ", " buscamos ", " conocimientos "],
    de: [" arbeiten ", " deutschland ", " gesucht ", " bewerbung ", " aufgaben ", " anforderungen ", " qualifikationen ", " erfahrung ", " unternehmen ", " gehalt ", " stellenangebot ", " berufserfahrung "],
    pt: [" português ", " portugues ", " experiência ", " requisitos ", " responsabilidades ", " candidatura ", " salário ", " benefícios ", " empresa ", " vaga ", " trabalho "],
    it: [" italiano ", " esperienza ", " requisiti ", " responsabilità ", " candidatura ", " stipendio ", " azienda ", " lavoro ", " posizione "],
    nl: [" nederlands ", " ervaring ", " vereisten ", " verantwoordelijkheden ", " sollicitatie ", " salaris ", " bedrijf ", " vacature "]
  };

  let best = { language: "", score: 0 };
  for (const [language, words] of Object.entries(languages)) {
    const score = words.reduce((n, word) => n + (value.includes(word) ? 1 : 0), 0);
    if (score > best.score) best = { language, score };
  }
  return best.score >= 2 ? best.language : "";
}

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

function normalizeJobSection(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.filter(Boolean).map(String).join("\n");
  return String(value).trim();
}

function buildJobSections(job, description) {
  const sections = [
    ["Responsibilities", job.responsibilities || job.responsibility || job.duties || job.job_responsibilities],
    ["Requirements", job.requirements || job.qualifications || job.job_requirements || job.skills_required],
    ["Benefits", job.benefits || job.job_benefits || job.perks],
  ].map(([title, value]) => ({ title, content: normalizeJobSection(value) })).filter(x => x.content);

  const raw = String(description || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h2|h3|h4)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");

  const blocks = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const headingPattern = /^(about (the )?role|job description|description|responsibilities|key responsibilities|duties|requirements|qualifications|what you.?ll do|what we.?re looking for|benefits|perks|what we offer)\s*:?[\s-]*$/i;
  let current = { title: "Job description", content: [] };

  for (const block of blocks) {
    const match = block.match(headingPattern);
    if (match) {
      if (current.content.length) sections.push({ title: current.title, content: current.content.join("\n") });
      const key = match[1].toLowerCase();
      current = {
        title: /responsib|duties|you.?ll do/.test(key) ? "Responsibilities"
          : /require|qualif|looking for/.test(key) ? "Requirements"
          : /benefit|perk|offer/.test(key) ? "Benefits"
          : "Job description",
        content: []
      };
    } else {
      current.content.push(block);
    }
  }
  if (current.content.length) sections.push({ title: current.title, content: current.content.join("\n") });

  const unique = [];
  for (const section of sections) {
    const content = String(section.content || "").trim();
    if (content && !unique.some(x => x.title === section.title && x.content === content)) {
      unique.push({ title: section.title, content });
    }
  }
  return unique;
}

function SectionContent({ content }) {
  return <div className="job-prose">{String(content).split(/\n+/).map((line, i) => <p key={i}>{line}</p>)}</div>;
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
    const detectedLanguage = detectForeignLanguage(title, description, sourceLanguage);
    if (!detectedLanguage) return;

    let cancelled = false;
    setTranslationLoading(true);
    fetch("/api/translate-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, language: detectedLanguage })
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!cancelled && data?.title && data?.description) setTranslatedJob(data);
      })
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
  const canonicalUrl = `https://onlinejobs.christech.co.ke/job/${encodeURIComponent(id)}`;
  const jobPostingSchema = buildJobPostingSchema(job, {
    title, description, company, location, type, remote, logo, applyUrl, salary
  });

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
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={logo || "https://onlinejobs.christech.co.ke/og-image.jpg"} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
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

              {buildJobSections(job, description).map((section, index) => (
                <article className="job-description-panel" key={section.title + index}>
                  <div className="job-section-heading"><span /> <h2>{section.title}</h2></div>
                  {index === 0 && !job.responsibilities && !job.requirements && !job.benefits
                    ? <div className="job-prose" dangerouslySetInnerHTML={{ __html: safeDescription }} />
                    : <SectionContent content={section.content} />}
                </article>
              ))}

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
