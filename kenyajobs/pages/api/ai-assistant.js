import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a friendly and expert job search assistant for JobsWorldwide, a global job board.
You help job seekers with:
- Finding the right jobs based on their skills and experience
- Writing and improving CVs/resumes
- Interview preparation and common questions
- Career advice and salary negotiation tips
- Understanding job descriptions and requirements
- Cover letter writing tips
- Remote work advice

Keep responses concise, practical and encouraging. Use bullet points where helpful.
If someone asks about specific jobs on the site, remind them to use the search bar or browse categories.
Do not make up specific job listings or salary figures — give ranges based on general knowledge.
Always be positive and supportive.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.error("GROQ_API_KEY is not set in environment variables");
    return res.status(500).json({ error: "AI assistant is not configured. GROQ_API_KEY missing." });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  try {
    const client = new OpenAI({
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Groq API error:", err?.message || err);
    return res.status(500).json({ error: "AI service error: " + (err?.message || "Unknown error") });
  }
}
