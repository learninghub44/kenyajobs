// pages/api/ai-assistant.js
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

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "AI assistant is not configured." });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10), // keep last 10 messages for context
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("AI assistant error:", err.message);
    res.status(500).json({ error: "Failed to get AI response. Please try again." });
  }
}
