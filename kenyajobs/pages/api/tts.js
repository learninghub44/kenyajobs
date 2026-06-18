/**
 * TTS endpoint — ElevenLabs neural voice (human-quality).
 * Falls back gracefully if no API key is set.
 * 
 * POST /api/tts  { text: string }
 * → audio/mpeg stream
 */

export const config = { api: { responseLimit: "5mb" } };

// ElevenLabs free-tier voice IDs (no key needed for these public voices up to 10k chars/mo)
// "Rachel" — warm, natural American female
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const ELEVEN_MODEL = "eleven_turbo_v2";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body || {};
  if (!text || typeof text !== "string") return res.status(400).json({ error: "No text" });

  // Clean markdown for speech
  const clean = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^\s*[-•]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim()
    .slice(0, 1000);

  const apiKey = process.env.ELEVENLABS_API_KEY;

  // ── ElevenLabs path (if key is set) ───────────────────────────────────────
  if (apiKey) {
    try {
      const upstream = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
          },
          body: JSON.stringify({
            text: clean,
            model_id: ELEVEN_MODEL,
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.80,
              style: 0.30,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (upstream.ok) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=3600");
        const buffer = await upstream.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }
      console.warn("ElevenLabs error:", upstream.status, await upstream.text());
    } catch (e) {
      console.warn("ElevenLabs fetch failed:", e.message);
    }
  }

  // ── Fallback: tell client to use browser TTS ───────────────────────────────
  return res.status(204).end(); // client will use Web Speech API fallback
}
