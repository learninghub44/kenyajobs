import OpenAI from "openai";

function clean(value, max = 14000) {
  return String(value || "").slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { title, description, language } = req.body || {};
  if (!title || !description) return res.status(400).json({ error: "Title and description are required." });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: "Translation service is not configured." });

  try {
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Translate this job listing into natural professional English. Preserve HTML structure, company names, people names, locations, URLs, currencies, numbers and job-specific terms. Do not add information. Return ONLY JSON with keys title and description." },
        { role: "user", content: JSON.stringify({ language: language || "unknown", title: clean(title, 500), description: clean(description) }) }
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0]?.message?.content || "{}");
    if (!data.title || !data.description) throw new Error("Invalid translation response");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ title: data.title, description: data.description });
  } catch (error) {
    console.error("job translation error:", error?.message);
    return res.status(500).json({ error: "Translation failed." });
  }
}
