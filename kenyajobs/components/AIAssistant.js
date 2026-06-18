import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, Loader, ChevronDown } from "lucide-react";

const SUGGESTED = [
  "How do I write a strong CV?",
  "Tips for remote job interviews",
  "How to negotiate salary?",
  "What skills are most in demand?",
];

// Sparkle AI icon — looks like a proper AI assistant button
function AIIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="currentColor" opacity="0.9" />
      <path d="M19 16L19.8 18.2L22 19L19.8 19.8L19 22L18.2 19.8L16 19L18.2 18.2L19 16Z"
        fill="currentColor" opacity="0.7" />
      <path d="M5 3L5.6 4.4L7 5L5.6 5.6L5 7L4.4 5.6L3 5L4.4 4.4L5 3Z"
        fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
      <AIIcon size={14} className="text-white" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
  );
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI career assistant.\n\nI can help with CV writing, interview prep, salary advice, and finding the right jobs. What would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  // Pulse after 4s to grab attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 4000);
    return () => clearTimeout(t);
  }, []);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || data.error || "Sorry, something went wrong.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {(!open || minimized) && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); setPulse(false); }}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
          aria-label="Open AI Assistant"
        >
          {/* Label pill — visible on hover */}
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap shadow-lg pointer-events-none">
            AI Career Assistant
          </span>

          {/* Button */}
          <div className="relative">
            {/* Pulse rings */}
            {pulse && (
              <>
                <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" style={{ animationDelay: "0.3s" }} />
              </>
            )}
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
              <AIIcon size={26} className="text-white" />
            </div>
            {/* Unread dot */}
            {pulse && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-200 ${minimized ? "h-[60px]" : "h-[540px]"}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <AIIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">AI Career Assistant</p>
                <p className="text-blue-200 text-xs flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  Online · Fast AI responses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <ChevronDown size={16} className={`transition-transform ${minimized ? "rotate-180" : ""}`} />
              </button>
              <button onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/15 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "user" ? <UserAvatar /> : <BotAvatar />}
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <BotAvatar />
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length === 1 && !loading && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                  {SUGGESTED.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Ask about jobs, CVs, interviews..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24 py-0.5 leading-relaxed"
                    style={{ scrollbarWidth: "none" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                  >
                    {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">Powered by Groq LLaMA · Free to use</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
