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
        { role: "system", content: "Act as a professional job-board translator. Translate the entire job listing into clear, natural professional English. If the source is already English, return it unchanged. Preserve HTML structure, headings, lists, company names, people names, locations, URLs, currencies, numbers, dates and job-specific terms exactly. Do not summarize, omit, invent, or add information. Do not translate proper names. Return ONLY valid JSON with exactly two keys: title and description." },
        { role: "user", content: JSON.stringify({ language: language || "unknown", title: clean(title, 500), description: clean(description) }) }
      ],
      temperature: 0.1,
      max_tokens: 6000,
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
