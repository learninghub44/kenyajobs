// components/AIAssistant.js
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Bot, User, Loader } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "How do I write a good CV?",
  "Tips for remote job interviews",
  "How to negotiate salary?",
  "What skills are in demand?",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your JobsWorldwide AI assistant 👋\n\nI can help you with CV writing, interview prep, career advice, and finding the right jobs. What would you like help with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [messages, open, minimized]);

  // Show unread indicator after 5s if not opened
  useEffect(() => {
    const t = setTimeout(() => {
      if (!open) setHasUnread(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || data.error || "Sorry, something went wrong.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); setMinimized(false); setHasUnread(false); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${open && !minimized ? "hidden" : "flex"}`}
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
        {/* Tooltip */}
        <span className="absolute right-16 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          AI Job Assistant
        </span>
      </button>

      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 ${minimized ? "h-14" : "h-[520px]"}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Job Assistant</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  Online · Powered by Groq
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Minimize2 size={15} />
              </button>
              <button onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-100" : "bg-blue-600"}`}>
                      {msg.role === "user"
                        ? <User size={13} className="text-blue-600" />
                        : <Bot size={13} className="text-white" />
                      }
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions — only show at start */}
              {messages.length === 1 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full transition-colors text-left">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 flex-shrink-0">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:bg-white transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about jobs, CVs, interviews..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24 py-0.5"
                    style={{ scrollbarWidth: "none" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-1.5">Powered by Groq · Fast AI responses</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
