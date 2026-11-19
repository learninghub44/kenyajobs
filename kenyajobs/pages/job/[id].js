import Head from "next/head";
import JobDetailLayout from "@/components/JobDetailLayout";
import { EXPERIENCE_LEVELS, WORK_MODES, DOCUMENT_TYPES, isDeadlinePassed, parseDeadline } from "@/lib/jobOptions";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { loadJob, saveJob } from "@/utils/jobCache";
import { toPlainJobText, decodeJobEntities } from "@/lib/jobDescription";
import { parseJobDate, normalizeJobDate } from "@/lib/jobDate";
import { MapPin, BriefcaseBusiness, Clock3, Building2, ExternalLink, Share2, ArrowLeft, Globe2, Banknote, CheckCircle2, CalendarDays, Hash } from "lucide-react";


function normalizeDate(value) {
  return normalizeJobDate(value);
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
    description: toPlainJobText(description).replace(/\s+/g, " ").trim(),
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
  const d = parseJobDate(dateStr);
  if (!d) return "Recently posted";
  // Use a fixed UTC date instead of Date.now()/browser-local time so SSR and hydration match.
  return `Posted ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`;
}

function decodeEntities(value) {
  return decodeJobEntities(value);
}

function cleanSectionText(value) {
  return toPlainJobText(value);
}

function splitSectionItems(value) {
  const text = cleanSectionText(value);
  if (!text) return [];

  return text
    .split(/\n+|\s*[•●▪◦]\s*|\s*;\s+/)
    .map(item => item.replace(/^[-–—•●▪◦]+\s*/, "").trim())
    .filter(item => item.length > 1);
}

function classifyDescription(rawDescription) {
  const raw = cleanSectionText(rawDescription);
  const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const headingPattern = /^(about(?: the)? (?:role|job|company)|job description|description|position summary|role overview|overview|responsibilities|key responsibilities|duties|what you.?ll do|what you.?ll need|minimum qualifications|preferred qualifications|requirements|qualifications|job requirements|what we.?re looking for|skills(?: required)?|experience|education|benefits(?: and perks)?|perks|what we offer|compensation|salary|how to apply|application instructions|application process|work schedule|location|primary location)\s*:?\s*$/i;
  const buckets = {
    "Job description": [],
    "Responsibilities": [],
    "Requirements": [],
    "Qualifications": [],
    "Education": [],
    "Benefits": [],
    "Compensation": [],
    "How to apply": [],
    "Location": [],
    "Work schedule": []
  };
  let current = "Job description";

  for (const line of lines) {
    const heading = line.match(headingPattern);
    if (heading) {
      const key = heading[1].toLowerCase();
      if (/responsib|duties|you.?ll do/.test(key)) current = "Responsibilities";
      else if (/minimum qualifications|preferred qualifications|qualif/.test(key)) current = "Qualifications";
      else if (/require|skill|experience|looking for|you.?ll need/.test(key)) current = "Requirements";
      else if (/education/.test(key)) current = "Education";
      else if (/benefit|perk|offer/.test(key)) current = "Benefits";
      else if (/compensation|salary/.test(key)) current = "Compensation";
      else if (/apply|application/.test(key)) current = "How to apply";
      else if (/location/.test(key)) current = "Location";
      else if (/schedule/.test(key)) current = "Work schedule";
      else current = "Job description";
      continue;
    }
    buckets[current].push(line);
  }

  return Object.fromEntries(
    Object.entries(buckets)
      .map(([title, items]) => [title, items.join("\n").trim()])
      .filter(([, content]) => content)
  );
}

function buildJobSections(job, description) {
  const classified = classifyDescription(description);
  const explicit = {
    "Responsibilities": job.responsibilities || job.responsibility || job.duties || job.job_responsibilities,
    "Requirements": job.requirements || job.job_requirements || job.skills_required,
    "Qualifications": job.qualifications || job.minimum_qualifications || job.preferred_qualifications,
    "Benefits": job.benefits || job.job_benefits || job.perks,
    "Education": job.education || job.education_requirements,
    "Compensation": job.compensation || job.salary_details,
    "How to apply": job.applicationInstructions || job.application_instructions
  };

  for (const [title, value] of Object.entries(explicit)) {
    if (value) classified[title] = cleanSectionText(value);
  }

  const sections = [];
  for (const title of ["Job description", "Responsibilities", "Requirements", "Qualifications", "Education", "Benefits", "Compensation", "How to apply"]) {
    const content = classified[title];
    if (!content) continue;
    const items = splitSectionItems(content);
    sections.push({ title, items: items.length > 1 ? items : [content] });
  }
  return sections;
}

function SectionContent({ items }) {
  return (
    <div className="job-prose">
      {items.map((item, i) => {
        const text = String(item).trim();
        const isNotice = /were not provided in the original listing\.$/i.test(text);

        return (
          <p key={i} className={isNotice ? "job-section-notice" : undefined}>
            {!isNotice && items.length > 1 ? <span className="job-bullet" aria-hidden="true">•</span> : null}
            {text}
          </p>
        );
      })}
    </div>
  );
}

function shortJobSummary(value, maxLength = 280) {
  const plain = toPlainJobText(value).replace(/\s+/g, " ").trim();
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  const shortened = plain.slice(0, maxLength);
  const boundary = shortened.lastIndexOf(" ");
  return (boundary > 180 ? shortened.slice(0, boundary) : shortened).replace(/[,:;–—-]+$/, "") + "…";
}

function formatSalary(job) {
  if (job.salary && typeof job.salary === "string") return job.salary;
  const min = job.annualSalaryMin ?? job.job_min_salary ?? job.salary_min;
  const max = job.annualSalaryMax ?? job.job_max_salary ?? job.salary_max;
  const currency = job.salaryCurrency || job.job_salary_currency || "";
  if (min && max) return `${currency} ${Number(min).toLocaleString("en-GB")} – ${Number(max).toLocaleString("en-GB")}`.trim();
  if (min) return `${currency} ${Number(min).toLocaleString("en-GB")}+`.trim();
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

const levelLabel = (v) => EXPERIENCE_LEVELS.find((o) => o.value === v)?.label || "";
const modeLabel = (v) => WORK_MODES.find((o) => o.value === v)?.label || "";
// Explicit locale + zone so server and browser always print the same text.
function formatDeadline(text) {
  const d = parseDeadline(text);
  if (!d) return String(text || "");
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d);
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
  const applyUrl = job.applicationMethod === "platform" ? `https://onlinejobs.christech.co.ke/job/${encodeURIComponent(id)}#apply` : (job.url || job.job_apply_link || job.redirect_url || "#");
  const salary = formatSalary(job);
  const onPlatform = job.applicationMethod === "platform";
  const deadlineText = job.applicationDeadline || job.application_deadline || "";
  const deadlineLabel = deadlineText ? formatDeadline(deadlineText) : "";
  const deadlinePassed = isDeadlinePassed(deadlineText);
  const experienceText = levelLabel(job.experienceLevel) ? [levelLabel(job.experienceLevel), job.experience].filter(Boolean).join(" · ") : (job.experience || job.experience_level || "");
  const skillList = [...new Set([...(Array.isArray(job.skills) ? job.skills : []), ...(Array.isArray(job.tags) ? job.tags : [])])];
  const neededDocs = onPlatform ? (job.requiredDocuments || ["resume"]).map((d) => DOCUMENT_TYPES.find((o) => o.value === d)?.label).filter(Boolean) : [];
  const remote = location.toLowerCase().includes("remote") || type.toLowerCase().includes("remote");
  const logo = job.companyLogo || job.company_logo || job.employer_logo;
  const canonicalUrl = `https://onlinejobs.christech.co.ke/job/${encodeURIComponent(id)}`;
  const jobPostingSchema = buildJobPostingSchema(job, {
    title, description, company, location, type, remote, logo, applyUrl, salary
  });

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  const meta = [
    [MapPin, "Location", location],
    [BriefcaseBusiness, "Job type", type],
    ...(job.jobRef ? [[Hash, "Job number", job.jobRef]] : []),
    ...(modeLabel(job.workMode) ? [[Globe2, "Work mode", modeLabel(job.workMode)]] : []),
    ...(job.industry ? [[Building2, "Industry", job.industry]] : []),
    [Clock3, "Posted", timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc)],
    ...(salary ? [[Banknote, "Salary", salary]] : []),
    ...(deadlineLabel ? [[CalendarDays, "Application deadline", deadlineLabel]] : []),
    ...(experienceText ? [[BriefcaseBusiness, "Experience", experienceText]] : []),
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

      <JobDetailLayout
        job={job}
        translatedJob={translatedJob}
        translationLoading={translationLoading}
        copied={copied}
        onCopy={copyLink}
        related={related}
        onRelatedClick={(item) => saveJob(item.id || item.job_id, item)}
        view={{
          title, company, location, type, logo, source, onPlatform, applyUrl, salary, deadlineLabel, deadlinePassed,
          initials: initials(company),
          companySlug: company.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"),
          summary: shortJobSummary(description, 150),
          modeLabel: modeLabel(job.workMode), levelLabel: levelLabel(job.experienceLevel), industry: job.industry || "",
          education: String(job.education || job.education_requirements || "").slice(0, 48),
          sections: buildJobSections(job, description), skillList, neededDocs,
          facts: [
            ...(job.jobRef ? [["Job number", job.jobRef]] : []),
            ["Posted", timeAgo(job.date || job.publication_date || job.job_posted_at_datetime_utc)],
            ["Employment type", type],
            ...(experienceText ? [["Experience", experienceText]] : []),
            ["Source", source],
          ],
        }}
      />
    </>
  );
}
