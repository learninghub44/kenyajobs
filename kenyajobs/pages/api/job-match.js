// pages/api/job-match.js
// AI job-matching: takes user skills/CV text, fetches live jobs, returns ranked matches.

import OpenAI from "openai";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { attachSalaries } from "@/utils/extractSalary";

// ── Rate limiter (shared same window as ai-assistant) ──────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT = 5; // fewer calls — this is heavier
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 30 * 60 * 1000);

// ── Fetch a live pool of jobs relevant to the user's keywords ─────────────
async function fetchLiveJobs(keywords) {
  const q = encodeURIComponent(keywords.slice(0, 60));

  const sources = [
    // Remotive
    fetchWithTimeout(`https://remotive.com/api/remote-jobs?search=${q}&limit=20`)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `remotive-${j.id}`,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || "Remote",
        type: j.job_type || "Full-time",
        date: j.publication_date,
        url: j.url,
        description: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 400),
        tags: j.tags || [],
        source: "Remotive",
        salary: j.salary || undefined,
      })))
      .catch(() => []),

    // Jobicy
    fetchWithTimeout(`https://jobicy.com/api/v2/remote-jobs?count=20&tag=${q}`)
      .then(r => r.json())
      .then(d => (d.jobs || []).map(j => ({
        id: `jobicy-${j.id}`,
        title: j.jobTitle,
        company: j.companyName,
        location: j.jobGeo || "Remote",
        type: j.jobType || "Full-time",
        date: j.pubDate,
        url: j.url,
        description: (j.jobDescription || "").replace(/<[^>]*>/g, "").slice(0, 400),
        tags: j.jobIndustry || [],
        source: "Jobicy",
        annualSalaryMin: j.annualSalaryMin || undefined,
        annualSalaryMax: j.annualSalaryMax || undefined,
        salaryCurrency: j.salaryCurrency || undefined,
      })))
      .catch(() => []),

    // The Muse (general pool, filtered by keyword)
    fetchWithTimeout(`https://www.themuse.com/api/public/jobs?descending=true&page=1`)
      .then(r => r.json())
      .then(d => (d.results || [])
        .filter(j => {
          const kw = keywords.toLowerCase();
          return (j.name || "").toLowerCase().includes(kw) ||
            (j.categories || []).some(c => c.name?.toLowerCase().includes(kw));
        })
        .slice(0, 10)
        .map(j => ({
          id: `muse-${j.id}`,
          title: j.name,
          company: j.company?.name || "Company",
          location: j.locations?.[0]?.name || "Remote",
          type: j.type || "Full-time",
          date: j.publication_date,
          url: j.refs?.landing_page,
          description: (j.contents || "").replace(/<[^>]*>/g, "").slice(0, 400),
          tags: (j.categories || []).map(c => c.name),
          source: "The Muse",
        })))
      .catch(() => []),
  ];

  const results = await Promise.allSettled(sources);
  const jobs = attachSalaries(
    results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value)
  );

  return jobs.slice(0, 30); // cap at 30 for AI context
}

// ── Strip HTML & trim job list for AI context ─────────────────────────────
function formatJobsForAI(jobs) {
  return jobs.map((j, i) =>
    `[${i + 1}] "${j.title}" at ${j.company} | ${j.location} | ${j.type} | ${j.source}
     ${j.salary || (j.annualSalaryMin ? `$${j.annualSalaryMin}–$${j.annualSalaryMax}` : "")}
     Description: ${j.description || "N/A"}`.trim()
  ).join("\n\n");
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${Math.ceil(rate.retryAfter / 60)} minute(s).`,
      retryAfter: rate.retryAfter,
    });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "AI assistant not configured." });

  const { userProfile } = req.body; // skills/CV text from the user
  if (!userProfile || typeof userProfile !== "string" || userProfile.trim().length < 10) {
    return res.status(400).json({ error: "Please provide your skills or CV text." });
  }

  // Extract a short keyword summary from the profile for job fetching
  // (We'll use the first ~80 chars of the profile as keyword hint)
  const keywordHint = userProfile.slice(0, 80).replace(/[^a-zA-Z0-9 ]/g, " ").trim();

  // Fetch live jobs in parallel with keyword hint
  const liveJobs = await fetchLiveJobs(keywordHint);

  if (liveJobs.length === 0) {
    return res.status(200).json({
      reply: "I couldn't find any live jobs at the moment. Please try again shortly — our job feeds update frequently.",
      matches: [],
      remaining: rate.remaining,
    });
  }

  const jobsText = formatJobsForAI(liveJobs);

  const systemPrompt = `You are an expert AI career advisor and job-matching engine for KenyaJobs.
Your job is to read a user's skills or CV, compare them to a list of live job openings, and return the BEST 5 matches.

For each match:
1. Pick the job number from the list
2. Give a short, specific reason why it fits this person (2–3 sentences)
3. Note any skill gaps or things to highlight in their application

Be honest — if the match is partial, say so. Prioritise relevance over seniority.

You MUST respond in this exact JSON format (no markdown, no extra text):
{
  "summary": "1–2 sentence overall assessment of the user's profile vs the job market",
  "matches": [
    { "jobIndex": 1, "matchScore": 92, "reason": "...", "tips": "..." },
    { "jobIndex": 3, "matchScore": 85, "reason": "...", "tips": "..." },
    { "jobIndex": 7, "matchScore": 78, "reason": "...", "tips": "..." },
    { "jobIndex": 12, "matchScore": 71, "reason": "...", "tips": "..." },
    { "jobIndex": 19, "matchScore": 65, "reason": "...", "tips": "..." }
  ]
}`;

  const userMessage = `## My Profile / CV / Skills:
${userProfile.slice(0, 2000)}

## Live Job Openings:
${jobsText}

Please match my profile to the best 5 jobs from the list above.`;

  try {
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1200,
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content || "";

    // Parse JSON response
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      // Fallback — return raw text if JSON parsing fails
      return res.status(200).json({
        reply: raw,
        matches: [],
        remaining: rate.remaining,
      });
    }

    // Hydrate matches with actual job data
    const hydratedMatches = (parsed.matches || []).map(m => {
      const job = liveJobs[m.jobIndex - 1];
      if (!job) return null;
      return {
        ...m,
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          url: job.url,
          source: job.source,
          salary: job.salary || (job.annualSalaryMin ? `${job.salaryCurrency || "$"}${job.annualSalaryMin}–${job.annualSalaryMax}` : null),
          date: job.date,
        },
      };
    }).filter(Boolean);

    return res.status(200).json({
      summary: parsed.summary || "",
      matches: hydratedMatches,
      remaining: rate.remaining,
    });

  } catch (err) {
    console.error("job-match error:", err?.message);
    return res.status(500).json({ error: "AI error: " + (err?.message || "Unknown") });
  }
}
