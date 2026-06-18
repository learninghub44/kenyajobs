import { useState, useRef, useEffect } from "react";
import { X, Send, Loader, ChevronDown, FileText, MessageSquare, Mic, BookOpen } from "lucide-react";

// ── Icons ────────────────────────────────────────────────────────────────────
function SparkleIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l1.545 5.954L19.5 10l-5.955 1.545L12 17.5l-1.545-5.955L4.5 10l5.955-1.546L12 2.5z" opacity="0.95"/>
      <path d="M19.5 17l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7z" opacity="0.75"/>
      <path d="M5 3.5l.6 1.4 1.4.6-1.4.6L5 7.5l-.6-1.4L3 5.5l1.4-.6L5 3.5z" opacity="0.6"/>
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
      <SparkleIcon size={15} className="text-white" />
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

// ── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "chat",      label: "Chat",      Icon: MessageSquare, placeholder: "Ask about jobs, career advice...",   hint: "General career assistant" },
  { id: "cv",        label: "CV Writer", Icon: FileText,      placeholder: "Tell me your job title & skills...", hint: "Generate a full CV" },
  { id: "cover",     label: "Cover Letter", Icon: BookOpen,   placeholder: "Job title and company name...",      hint: "Write a cover letter" },
  { id: "interview", label: "Interview", Icon: Mic,           placeholder: "Ask any interview question...",      hint: "Interview coaching" },
];

const SUGGESTED = {
  chat:      ["How do I find remote jobs?", "What skills are most in demand?", "How to negotiate salary?", "Tips for career change"],
  cv:        ["Write a CV for a Software Engineer", "CV for an Accountant with 3 years experience", "Graduate CV with no experience", "Marketing Manager CV"],
  cover:     ["Cover letter for a Sales Manager role", "Cover letter for remote customer service", "Graduate cover letter", "Cover letter for career change"],
  interview: ["Common interview questions & answers", "Tell me about yourself — best answer", "How to answer salary questions", "Questions to ask the interviewer"],
};

const WELCOME = {
  chat:      "Hi! I'm your AI career assistant.\n\nAsk me anything about job searching, salaries, career advice, or the job market.",
  cv:        "I'll write you a professional, ATS-friendly CV.\n\nJust tell me your job title, years of experience, and key skills — or paste your existing CV and I'll improve it.",
  cover:     "I'll write a compelling cover letter that gets interviews.\n\nTell me the job title, company name (optional), and anything about your background.",
  interview: "Let's get you interview-ready!\n\nAsk me for common interview questions, how to answer specific questions, salary negotiation scripts, or mock interview practice.",
};

// ── Message renderer (handles markdown-like formatting) ──────────────────────
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

// ── Main component ───────────────────────────────────────────────────────────
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
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse]     = useState(false);
  const [rateInfo, setRateInfo] = useState({ remaining: 10, limited: false, retryAfter: 0 });
  const [copied, setCopied]   = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

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

  // Reset input when switching tabs
  useEffect(() => { setInput(""); }, [activeTab]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading || rateInfo.limited) return;
    setInput("");

    const updated = [...messages, { role: "user", content: msg }];
    setAllMessages(prev => ({ ...prev, [activeTab]: updated }));
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, mode: activeTab }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRateInfo({ remaining: 0, limited: true, retryAfter: data.retryAfter || 600 });
        setAllMessages(prev => ({ ...prev, [activeTab]: [...updated, { role: "assistant", content: data.error }] }));
      } else {
        if (data.remaining !== undefined) setRateInfo(prev => ({ ...prev, remaining: data.remaining }));
        setAllMessages(prev => ({
          ...prev,
          [activeTab]: [...updated, { role: "assistant", content: data.reply || data.error || "Sorry, something went wrong." }],
        }));
      }
    } catch {
      setAllMessages(prev => ({
        ...prev,
        [activeTab]: [...updated, { role: "assistant", content: "Connection error. Please try again." }],
      }));
    } finally {
      setLoading(false);
    }
  }

  function copyLastResponse() {
    const last = [...messages].reverse().find(m => m.role === "assistant");
    if (last) {
      navigator.clipboard.writeText(last.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function clearChat() {
    setAllMessages(prev => ({ ...prev, [activeTab]: [{ role: "assistant", content: WELCOME[activeTab] }] }));
  }

  const tab = TABS.find(t => t.id === activeTab);

  return (
    <>
      {/* ── Floating button ── */}
      {(!open || minimized) && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); setPulse(false); }}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
          aria-label="Open AI Assistant"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl pointer-events-none">
            AI Career Assistant
          </span>
          <div className="relative">
            {pulse && <span className="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping" />}
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center hover:scale-105">
              <SparkleIcon size={26} className="text-white" />
            </div>
            {pulse && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />}
          </div>
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden transition-all duration-200 ${minimized ? "h-[64px]" : "h-[600px]"}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                <SparkleIcon size={19} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">AI Career Assistant</p>
                <p className="text-blue-100/80 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  {tab?.hint} · {rateInfo.remaining} msgs left
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} title="Clear chat"
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors text-xs font-medium">
                Clear
              </button>
              <button onClick={() => setMinimized(!minimized)}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <ChevronDown size={16} className={`transition-transform duration-200 ${minimized ? "rotate-180" : ""}`} />
              </button>
              <button onClick={() => setOpen(false)}
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
                    {rateInfo.remaining === 0 ? "Last message for this window." : `${rateInfo.remaining} messages remaining this session.`}
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
                  rateInfo.limited ? "border-red-200 bg-red-50" : "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50"
                }`}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={rateInfo.limited ? "Rate limit reached. Please wait..." : tab?.placeholder}
                    disabled={rateInfo.limited}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-28 py-0.5 leading-relaxed disabled:opacity-50"
                    style={{ scrollbarWidth: "none" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading || rateInfo.limited}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {loading ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
                <p className="text-center text-[11px] text-gray-400 mt-1.5">
                  Powered by Groq LLaMA 3.1 · {TABS.find(t => t.id === activeTab)?.hint}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
