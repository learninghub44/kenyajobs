import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader, ChevronDown, FileText, MessageSquare, Mic, BookOpen, Volume2, VolumeX, MicOff } from "lucide-react";

function AIBotIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* antenna */}
      <circle cx="12" cy="2.6" r="1.1" fill="currentColor" />
      <line x1="12" y1="3.7" x2="12" y2="5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* head */}
      <rect x="4" y="5.6" width="16" height="13" rx="4.5" fill="currentColor" opacity="0.16" />
      <rect x="4" y="5.6" width="16" height="13" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
      {/* eyes */}
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      {/* side nodes */}
      <line x1="2.4" y1="11" x2="4" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="20" y1="11" x2="21.6" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
      <AIBotIcon size={17} className="text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  );
}

const TABS = [
  { id: "chat",      label: "Chat",        Icon: MessageSquare, placeholder: "Ask about jobs, career advice...",   hint: "General career assistant" },
  { id: "cv",        label: "CV Writer",   Icon: FileText,      placeholder: "Tell me your job title & skills...", hint: "Generate a full CV" },
  { id: "cover",     label: "Cover Letter",Icon: BookOpen,      placeholder: "Job title and company name...",      hint: "Write a cover letter" },
  { id: "interview", label: "Interview",   Icon: Mic,           placeholder: "Ask any interview question...",      hint: "Interview coaching" },
];

const SUGGESTED = {
  chat:      ["How do I find remote jobs?", "What skills are most in demand?", "How to negotiate salary?", "Tips for career change"],
  cv:        ["Write a CV for a Software Engineer", "CV for an Accountant with 3 years experience", "Graduate CV with no experience", "Marketing Manager CV"],
  cover:     ["Cover letter for a Sales Manager role", "Cover letter for remote customer service", "Graduate cover letter", "Cover letter for career change"],
  interview: ["Common interview questions & answers", "Tell me about yourself — best answer", "How to answer salary questions", "Questions to ask the interviewer"],
};

const WELCOME = {
  chat:      "Hi! I'm your AI career assistant.\n\nAsk me anything about job searching, salaries, career advice, or the job market. You can also speak to me using the mic button!",
  cv:        "I'll write you a professional, ATS-friendly CV.\n\nJust tell me your job title, years of experience, and key skills — or paste your existing CV and I'll improve it.",
  cover:     "I'll write a compelling cover letter that gets interviews.\n\nTell me the job title, company name (optional), and anything about your background.",
  interview: "Let's get you interview-ready!\n\nAsk me for common interview questions, how to answer specific questions, salary negotiation scripts, or mock interview practice.",
};

function MessageContent({ content }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <p key={i} className="font-bold text-gray-900 text-base mt-2 first:mt-0">{line.slice(3)}</p>;
        if (line.startsWith("# "))  return <p key={i} className="font-bold text-gray-900 text-lg mt-2 first:mt-0">{line.slice(2)}</p>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <div key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"></span>
            <span>{line.slice(2)}</span>
          </div>
        );
        if (/^\d+\./.test(line)) return (
          <div key={i} className="flex items-start gap-2">
            <span className="text-blue-500 font-semibold flex-shrink-0 text-xs mt-0.5">{line.match(/^\d+/)[0]}.</span>
            <span>{line.replace(/^\d+\.\s*/, "")}</span>
          </div>
        );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

// Soundwave animation shown while recording
function SoundWave() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <span
          key={i}
          className="w-[3px] bg-red-500 rounded-full animate-bounce"
          style={{ height: `${h * 4}px`, animationDelay: `${i * 60}ms`, animationDuration: "0.6s" }}
        />
      ))}
    </div>
  );
}

export default function AIAssistant() {
  const [open, setOpen]           = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [allMessages, setAllMessages] = useState({
    chat:      [{ role: "assistant", content: WELCOME.chat }],
    cv:        [{ role: "assistant", content: WELCOME.cv }],
    cover:     [{ role: "assistant", content: WELCOME.cover }],
    interview: [{ role: "assistant", content: WELCOME.interview }],
  });
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [pulse, setPulse]       = useState(false);
  const [rateInfo, setRateInfo] = useState({ remaining: 10, limited: false });
  const [copied, setCopied]     = useState(false);

  // Avoid overlapping the cookie consent banner (fixed bottom-0, full-width) on first visit
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false);
  useEffect(() => {
    try {
      setCookieBannerVisible(!localStorage.getItem("jw_cookie_consent"));
    } catch {}
    const onChange = () => setCookieBannerVisible(false);
    window.addEventListener("jw-cookie-consent-changed", onChange);
    return () => window.removeEventListener("jw-cookie-consent-changed", onChange);
  }, []);
  const dockOffset = cookieBannerVisible ? "bottom-[150px] sm:bottom-[170px]" : "bottom-6";
  const winHeight = minimized
    ? "h-[64px]"
    : cookieBannerVisible
      ? "h-[min(560px,calc(100vh-200px))]"
      : "h-[min(620px,calc(100vh-100px))]";

  // Voice states
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript]     = useState("");
  const [voiceSupported] = useState(() =>
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef       = useRef(null);

  const messages = allMessages[activeTab];

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      inputRef.current?.focus();
    }
  }, [messages, open, minimized, activeTab]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { (function clearInputOnTabChange() { setInput(""); })(); }, [activeTab]);

  // Stop speech when assistant closes
  useEffect(() => {
    if (!open && synthRef.current) synthRef.current.cancel();
  }, [open]);

  // ── Text-to-speech: Web Speech API with best available voice ──────────────
  const voicesRef = useRef([]);

  // Pre-load voices list (needed on some browsers)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synthRef.current = synth;
    const load = () => { voicesRef.current = synth.getVoices(); };
    load();
    synth.onvoiceschanged = load;
  }, []);

  const cleanText = (text) => text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^\s*[-•]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Pick the most natural-sounding voice available
  const getBestVoice = () => {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    // Priority order — most human-sounding first
    const priority = [
      v => v.name === "Google UK English Female",
      v => v.name === "Google US English",
      v => v.name === "Samantha",
      v => v.name === "Karen",
      v => v.name === "Daniel",
      v => v.name === "Moira",
      v => v.name.includes("Google") && v.lang.startsWith("en"),
      v => v.lang === "en-GB",
      v => v.lang === "en-US",
      v => v.lang.startsWith("en"),
    ];
    for (const test of priority) {
      const match = voices.find(test);
      if (match) return match;
    }
    return voices[0];
  };

  const speak = useCallback((text) => {
    if (!voiceEnabled || !synthRef.current) return;
    stopSpeaking();

    const clean = cleanText(text);
    // Split into natural sentence chunks to avoid cut-off on long text
    const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > 200) { if (current) chunks.push(current.trim()); current = s; }
      else current += s;
    }
    if (current.trim()) chunks.push(current.trim());

    let idx = 0;
    const speakChunk = () => {
      if (idx >= chunks.length) { setIsSpeaking(false); return; }
      const utt = new SpeechSynthesisUtterance(chunks[idx++]);
      const voice = getBestVoice();
      if (voice) utt.voice = voice;
      utt.rate   = 0.95;   // Slightly slower = more natural
      utt.pitch  = 1.05;   // Slight warmth
      utt.volume = 1.0;
      utt.lang   = "en-GB";
      utt.onstart = () => setIsSpeaking(true);
      utt.onend   = speakChunk;
      utt.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utt);
    };
    speakChunk();
  }, [voiceEnabled, stopSpeaking]);

  // ── Speech-to-text ──────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => { setIsListening(true); setTranscript(""); };
    rec.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(interim);
      if (e.results[e.results.length - 1].isFinal) {
        setInput(interim);
        setTranscript("");
      }
    };
    rec.onerror  = () => { setIsListening(false); setTranscript(""); };
    rec.onend    = () => { setIsListening(false); setTranscript(""); };

    recognitionRef.current = rec;
    rec.start();
  }, [voiceSupported]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading || rateInfo.limited) return;
    setInput("");
    stopSpeaking();

    const updated = [...messages, { role: "user", content: msg }];
    setAllMessages(prev => ({ ...prev, [activeTab]: updated }));
    setLoading(true);

    try {
      const res  = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, mode: activeTab }),
      });
      const data = await res.json();

      const reply = data.reply || data.error || "Sorry, something went wrong.";
      if (res.status === 429) {
        setRateInfo({ remaining: 0, limited: true });
      } else {
        if (data.remaining !== undefined) setRateInfo(prev => ({ ...prev, remaining: data.remaining }));
      }
      setAllMessages(prev => ({ ...prev, [activeTab]: [...updated, { role: "assistant", content: reply }] }));
      // Auto-speak the reply
      speak(reply);
    } catch {
      const err = "Connection error. Please try again.";
      setAllMessages(prev => ({ ...prev, [activeTab]: [...updated, { role: "assistant", content: err }] }));
    } finally {
      setLoading(false);
    }
  }

  function copyLastResponse() {
    const last = [...messages].reverse().find(m => m.role === "assistant");
    if (last) { navigator.clipboard.writeText(last.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  function clearChat() {
    stopSpeaking();
    setAllMessages(prev => ({ ...prev, [activeTab]: [{ role: "assistant", content: WELCOME[activeTab] }] }));
  }

  const tab = TABS.find(t => t.id === activeTab);

  return (
    <>
      {/* ── Floating button ── */}
      {(!open || minimized) && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); setPulse(false); }}
          className={`fixed ${dockOffset} right-6 z-50 group flex items-center gap-3 transition-all duration-300`}
          aria-label="Open AI Assistant"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl pointer-events-none">
            AI Career Assistant
          </span>
          <div className="relative">
            {pulse && <span className="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping" />}
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center hover:scale-105">
              <AIBotIcon size={26} className="text-white" />
            </div>
            {pulse && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />}
          </div>
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div className={`fixed ${dockOffset} right-6 z-50 w-[400px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden transition-all duration-300 ${winHeight}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                <AIBotIcon size={19} className="text-white" />
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">AI Career Assistant</p>
                <p className="text-blue-100/80 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-green-400"}`}></span>
                  {isSpeaking ? "Speaking..." : isListening ? "Listening..." : `${tab?.hint} · ${rateInfo.remaining} msgs left`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => { setVoiceEnabled(v => !v); stopSpeaking(); }}
                title={voiceEnabled ? "Mute voice" : "Enable voice"}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button onClick={clearChat} title="Clear chat"
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors text-xs font-medium">
                Clear
              </button>
              <button onClick={() => setMinimized(!minimized)}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <ChevronDown size={16} className={`transition-transform duration-200 ${minimized ? "rotate-180" : ""}`} />
              </button>
              <button onClick={() => { setOpen(false); stopSpeaking(); }}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Tab bar */}
              <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
                {TABS.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
                      activeTab === id
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}>
                    <Icon size={14} />
                    <span className="leading-none">{label}</span>
                  </button>
                ))}
              </div>

              {/* Voice recording bar */}
              {isListening && (
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border-b border-red-100 flex-shrink-0">
                  <SoundWave />
                  <p className="text-xs text-red-600 font-medium flex-1">
                    {transcript || "Listening… speak now"}
                  </p>
                  <button onClick={stopListening} className="text-xs text-red-500 hover:text-red-700 font-semibold">Done</button>
                </div>
              )}

              {/* Speaking indicator */}
              {isSpeaking && !isListening && (
                <div className="flex items-center justify-between gap-3 px-4 py-2 bg-green-50 border-b border-green-100 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Volume2 size={13} className="text-green-600" />
                    <p className="text-xs text-green-700 font-medium">AI is speaking…</p>
                  </div>
                  <button onClick={stopSpeaking} className="text-xs text-green-600 hover:text-green-800 font-semibold">Stop</button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/60">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "user" ? <UserAvatar /> : <BotAvatar />}
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-3 shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    }`}>
                      {msg.role === "assistant"
                        ? <MessageContent content={msg.content} />
                        : <p className="text-sm leading-relaxed">{msg.content}</p>
                      }
                      {/* Re-speak button on assistant messages */}
                      {msg.role === "assistant" && i > 0 && (
                        <button
                          onClick={() => speak(msg.content)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Volume2 size={11} /> Play
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested chips */}
              {messages.length === 1 && !loading && (
                <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex flex-wrap gap-1.5 flex-shrink-0">
                  {SUGGESTED[activeTab].map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300 px-2.5 py-1.5 rounded-full transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Rate limit warning */}
              {rateInfo.remaining <= 3 && !rateInfo.limited && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex-shrink-0">
                  <p className="text-xs text-amber-700 text-center">
                    {rateInfo.remaining === 0 ? "Last message for this window." : `${rateInfo.remaining} messages remaining.`}
                  </p>
                </div>
              )}

              {/* Copy last response */}
              {messages.length > 1 && (
                <div className="px-4 py-1.5 bg-white border-t border-gray-50 flex justify-end flex-shrink-0">
                  <button onClick={copyLastResponse}
                    className="text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                    {copied ? "✓ Copied!" : "Copy last response"}
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-1.5 bg-white flex-shrink-0">
                <div className={`flex items-end gap-2 bg-gray-50 border rounded-xl px-3 py-2 transition-all ${
                  rateInfo.limited ? "border-red-200 bg-red-50" :
                  isListening ? "border-red-400 ring-2 ring-red-100" :
                  "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50"
                }`}>
                  <textarea
                    ref={inputRef}
                    value={isListening ? transcript || input : input}
                    onChange={e => !isListening && setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={
                      isListening ? "Listening…" :
                      rateInfo.limited ? "Rate limit reached. Please wait..." :
                      tab?.placeholder
                    }
                    disabled={rateInfo.limited || isListening}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-28 py-0.5 leading-relaxed disabled:opacity-60"
                    style={{ scrollbarWidth: "none" }}
                  />

                  {/* Mic button */}
                  {voiceSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={rateInfo.limited}
                      title={isListening ? "Stop listening" : "Speak your message"}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>
                  )}

                  {/* Send button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={(!input.trim() && !transcript) || loading || rateInfo.limited}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {loading ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>

                <p className="text-center text-[11px] text-gray-400 mt-1.5 flex items-center justify-center gap-2">
                  {voiceSupported && <span className="flex items-center gap-1"><Mic size={10} /> Voice enabled</span>}
                  <span>·</span>
                  <span>Powered by Groq LLaMA 3.1</span>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
