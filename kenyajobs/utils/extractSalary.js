// utils/extractSalary.js
// Scans a job's title + description for salary/pay mentions and returns a
// clean, human-readable salary string. Falls back to "Salary not disclosed"
// when nothing is found, so every job object always has a `salary` field.

const CURRENCY = "(?:KES|Ksh|KSh|Kshs|K[Ss]h\\.?|USD|US\\$|\\$|GBP|£|EUR|€)";
const NUMBER = "[0-9]{1,3}(?:[,.][0-9]{3})*(?:\\.[0-9]+)?\\s*(?:[kKmM]\\b)?";

// Ordered from most specific (range) to least specific (single figure).
const PATTERNS = [
  // "KES 80,000 - 120,000" / "Ksh 50k-70k" / "USD 1,200 – 1,800"
  new RegExp(`${CURRENCY}\\s*${NUMBER}\\s*(?:-|–|to)\\s*${CURRENCY}?\\s*${NUMBER}`, "i"),
  // "80,000 - 120,000 KES" (currency after the range)
  new RegExp(`${NUMBER}\\s*(?:-|–|to)\\s*${NUMBER}\\s*${CURRENCY}`, "i"),
  // "Salary: KES 150,000" / "Pay: $2,000"
  new RegExp(`(?:salary|pay|compensation|remuneration)\\s*[:\\-]?\\s*${CURRENCY}\\s*${NUMBER}`, "i"),
  // bare "KES 150,000 per month" / "$2,000/month"
  new RegExp(`${CURRENCY}\\s*${NUMBER}\\s*(?:per\\s*(?:month|annum|year|hour|day)|/\\s*(?:mo|month|yr|year|hr|hour))?`, "i"),
];

const PERIOD_WORDS = /\b(per\s*month|monthly|per\s*annum|per\s*year|annually|yearly|per\s*hour|hourly|per\s*day|daily)\b/i;
const LABEL_PREFIX = /^(?:salary|pay|compensation|remuneration)\s*[:\-]?\s*/i;
const VAGUE_PATTERNS = [
  /competitive\s+salary/i,
  /salary\s+commensurate\s+with\s+experience/i,
  /negotiable\s+salary/i,
  /salary\s*:?\s*negotiable/i,
  /attractive\s+(?:salary|remuneration|package)/i,
];

function cleanup(match, context) {
  let text = match.trim().replace(/\s+/g, " ");
  // Strip a leading "Salary:" / "Pay:" label so we just show the figure
  text = text.replace(LABEL_PREFIX, "");
  // Normalize common currency spellings
  text = text.replace(/\bKshs?\.?\b/gi, "Ksh").replace(/\bK[Ss]h\b/g, "Ksh");
  // Attach a pay period if it appears just after the match but wasn't captured
  if (!PERIOD_WORDS.test(text)) {
    const after = context.slice(context.indexOf(match) + match.length, context.indexOf(match) + match.length + 25);
    const periodMatch = after.match(PERIOD_WORDS);
    if (periodMatch) text += ` ${periodMatch[0]}`;
  }
  return text;
}

export function extractSalary(job) {
  const haystack = `${job.title || ""}. ${job.description || ""}`;
  for (const pattern of PATTERNS) {
    const m = haystack.match(pattern);
    if (m && m[0] && /\d/.test(m[0])) {
      return cleanup(m[0], haystack);
    }
  }
  for (const pattern of VAGUE_PATTERNS) {
    if (pattern.test(haystack)) return "Competitive / Negotiable";
  }
  return "Salary not disclosed";
}

// Mutates-free helper: returns a new array with `.salary` attached to every job.
export function attachSalaries(jobs = []) {
  return jobs.map((j) => (j.salary ? j : { ...j, salary: extractSalary(j) }));
}
