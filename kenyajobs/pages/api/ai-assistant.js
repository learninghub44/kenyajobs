import OpenAI from "openai";

// ── In-memory rate limiter ──────────────────────────────────────────────────
// 10 messages per IP per 10 minutes. Resets per serverless instance (good enough
// for abuse prevention without needing Redis).
const rateLimitMap = new Map(); // ip → { count, resetAt }
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

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

// Clean up old entries every 30 min to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 30 * 60 * 1000);

// ── System prompts per mode ─────────────────────────────────────────────────
const PROMPTS = {
  chat: `You are a friendly, expert career assistant for JobsWorldwide — a global job board.
Help users with: job searching, CV/resume writing, interview preparation, salary negotiation, career advice, cover letters, and remote work tips.
Be concise, practical, and encouraging. Use bullet points where helpful. Keep replies under 300 words unless writing a full CV or cover letter.
Do not invent specific job listings or exact salaries — give realistic ranges based on role and region.`,

  cv: `You are an expert CV/resume writer with 15+ years of experience helping candidates land jobs at top companies worldwide.
When given a job title, skills, or experience, write a complete, professional CV including:
- Professional Summary (3–4 lines)
- Key Skills (bullet list, 8–10 skills)
- Work Experience (2–3 example roles with bullet achievements, use action verbs)
- Education section
- Optional: Certifications or Languages

Format it cleanly with clear section headers. Make it ATS-friendly. Use strong action verbs. Tailor it to the role if mentioned.
If the user provides their own experience, improve and rewrite it professionally.
Keep it to 1–2 pages worth of content.`,

  cover: `You are an expert cover letter writer. Write compelling, personalised cover letters that get interviews.
Structure: Opening hook → Why this role → What you bring → Call to action closing.
Keep it to 3–4 paragraphs, under 350 words. Professional but warm tone.
If a job title or company is mentioned, tailor the letter specifically to it.`,

  interview: `You are an expert interview coach with experience preparing candidates for interviews at top companies.
Help users with: common interview questions and strong answers, STAR method responses, technical interview tips, salary negotiation scripts, questions to ask the interviewer, and how to handle tricky questions.
Give specific example answers when asked. Be direct and practical.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${Math.ceil(rate.retryAfter / 60)} minute(s) before sending more messages.`,
      retryAfter: rate.retryAfter,
    });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "AI assistant is not configured." });

  const { messages, mode = "chat" } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid request." });
  }

  // Validate mode
  const systemPrompt = PROMPTS[mode] || PROMPTS.chat;

  // Sanitise messages
  const sanitised = messages
    .slice(-12)
    .filter(m => m.role && m.content && typeof m.content === "string")
    .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content.slice(0, 2000) }));

  try {
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: systemPrompt }, ...sanitised],
      max_tokens: mode === "cv" || mode === "cover" ? 1200 : 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return res.status(200).json({ reply, remaining: rate.remaining });
  } catch (err) {
    console.error("Groq error:", err?.message);
    return res.status(500).json({ error: "AI error: " + (err?.message || "Unknown") });
  }
}
