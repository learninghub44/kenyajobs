// Shared job-detail vocabulary, validation and formatting. No server-only
// imports, so it is used by API routes and by the browser UI alike.

export const WORK_MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];
export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Manager" },
  { value: "executive", label: "Executive" },
];
export const SALARY_PERIODS = [
  { value: "hour", label: "hour" }, { value: "day", label: "day" }, { value: "week", label: "week" },
  { value: "month", label: "month" }, { value: "year", label: "year" },
];
export const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume / CV" },
  { value: "portfolio", label: "Portfolio link" },
  { value: "linkedin", label: "LinkedIn profile" },
  { value: "work_profile", label: "Work profile link" },
  { value: "work_samples", label: "Work samples link" },
];
export const APPLICATION_METHODS = [
  { value: "platform", label: "On this platform (candidates apply here)" },
  { value: "website", label: "Company website / external link" },
  { value: "google_form", label: "Google Form" },
  { value: "email", label: "Email" },
];
export const HOW_HEARD_OPTIONS = ["JOBS HUB KENYA website", "WhatsApp channel", "Telegram channel", "Facebook", "X (Twitter)", "LinkedIn", "Friend or colleague", "Google search", "Other"];

const has = (list, value) => list.some((o) => o.value === value);
const clipText = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, n);

export function formatJobRef(number) {
  const n = Number(number);
  return Number.isInteger(n) && n > 0 ? `JH-${n}` : "";
}
// "JH-1001", "jh1001" or "1001" -> 1001, otherwise null
export function parseJobRef(value) {
  const m = /^(?:jh)?[-\s]?(\d{1,12})$/i.exec(String(value || "").trim());
  return m ? Number(m[1]) : null;
}

export function composeSalary({ salaryMin, salaryMax, salaryCurrency = "KES", salaryPeriod = "month" } = {}) {
  const min = Number(salaryMin), max = Number(salaryMax);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const hasMin = Number.isFinite(min) && min > 0, hasMax = Number.isFinite(max) && max > 0;
  if (!hasMin && !hasMax) return "";
  const range = hasMin && hasMax ? (min === max ? fmt(min) : `${fmt(min)} - ${fmt(max)}`) : hasMin ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  return `${salaryCurrency} ${range} / ${salaryPeriod}`;
}

// Deadline text is free-form (admin form suggests YYYY-MM-DD). A plain date
// closes at the end of that day, Nairobi time. Returns a Date or null.
export function parseDeadline(text) {
  const s = String(text || "").trim();
  if (!s) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const t = iso ? Date.parse(`${s}T23:59:59+03:00`) : Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}
export function isDeadlinePassed(text, now = new Date()) {
  const d = parseDeadline(text);
  return Boolean(d && d.getTime() < now.getTime());
}

// Returns only the keys that were actually supplied, normalised and validated,
// so partial updates never blank fields. Throws a user-safe Error on bad input.
export function sanitizeJobDetails(input = {}) {
  const out = {};
  const given = (k) => Object.prototype.hasOwnProperty.call(input, k) && input[k] !== undefined;
  if (given("workMode")) {
    const v = String(input.workMode || "").toLowerCase();
    if (v && !has(WORK_MODES, v)) throw new Error("Work mode must be onsite, hybrid or remote.");
    out.workMode = v || null;
  }
  if (given("industry")) out.industry = clipText(input.industry, 80) || null;
  if (given("experienceLevel")) {
    const v = String(input.experienceLevel || "").toLowerCase();
    if (v && !has(EXPERIENCE_LEVELS, v)) throw new Error("Unknown experience level.");
    out.experienceLevel = v || null;
  }
  for (const key of ["salaryMin", "salaryMax"]) {
    if (!given(key)) continue;
    const raw = input[key];
    if (raw === "" || raw === null) { out[key] = null; continue; }
    const n = Number(String(raw).replace(/[,\s]/g, ""));
    if (!Number.isFinite(n) || n < 0 || n > 2_000_000_000) throw new Error("Salary amounts must be positive numbers.");
    out[key] = Math.round(n);
  }
  if (out.salaryMin != null && out.salaryMax != null && out.salaryMax < out.salaryMin) throw new Error("Maximum salary cannot be lower than minimum salary.");
  if (given("salaryCurrency")) {
    const v = String(input.salaryCurrency || "KES").toUpperCase();
    if (!/^[A-Z]{3}$/.test(v)) throw new Error("Currency must be a 3-letter code such as KES.");
    out.salaryCurrency = v;
  }
  if (given("salaryPeriod")) {
    const v = String(input.salaryPeriod || "month").toLowerCase();
    if (!has(SALARY_PERIODS, v)) throw new Error("Salary period must be hour, day, week, month or year.");
    out.salaryPeriod = v;
  }
  if (given("skills")) {
    const list = Array.isArray(input.skills) ? input.skills : String(input.skills || "").split(/[,\n]/);
    const seen = new Set();
    out.skills = list.map((s) => clipText(s, 40)).filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase())).slice(0, 20);
  }
  if (given("requiredDocuments")) {
    const list = Array.isArray(input.requiredDocuments) ? input.requiredDocuments : [];
    const docs = [...new Set(list.filter((d) => has(DOCUMENT_TYPES, d)))];
    out.requiredDocuments = docs.includes("resume") ? docs : ["resume", ...docs]; // a CV is always collected
  }
  return out;
}
