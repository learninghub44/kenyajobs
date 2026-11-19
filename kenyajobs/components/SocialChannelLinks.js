import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MessageCircle, Send, ArrowUpRight, BellRing } from "lucide-react";

export default function SocialChannelLinks({ variant = "banner" }) {
  const router = useRouter();
  const [links, setLinks] = useState({ whatsapp: "", telegram: "" });
  useEffect(() => {
    let active = true;
    fetch("/api/social-links").then((r) => r.ok ? r.json() : null)
      .then((data) => { if (active && data) setLinks({ whatsapp: data.whatsapp || "", telegram: data.telegram || "" }); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  if (router.pathname.startsWith("/admin")) return null;
  const items = [
    links.whatsapp && { href: links.whatsapp, label: "Join WhatsApp Channel", short: "WhatsApp", Icon: MessageCircle, tone: "whatsapp" },
    links.telegram && { href: links.telegram, label: "Join Telegram Channel", short: "Telegram", Icon: Send, tone: "telegram" },
  ].filter(Boolean);
  if (!items.length) return null;

  if (variant === "floating") return (
    <div className={`fixed bottom-36 right-4 z-[60] ${router.pathname === "/job/[id]" ? "hidden sm:flex" : "flex"} flex-col items-end gap-3 sm:bottom-7 sm:right-6`} aria-label="Join our job alert channels">
      {items.map(({ href, label, short, Icon, tone }) => (
        <a key={tone} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          className={`group inline-flex min-h-12 items-center gap-2.5 rounded-full border px-4 py-3 text-sm font-extrabold shadow-[0_10px_30px_rgba(10,25,60,.22)] transition duration-200 animate-pulse hover:animate-none hover:-translate-y-1 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-blue-300 ${tone === "whatsapp" ? "border-[#18B968] bg-[#20C875] text-[#082B1B] hover:bg-[#35E18B]" : "border-white bg-[#142771] text-white hover:bg-[#2144A7]"}`}
        >
          <Icon size={18} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );

  if (variant === "footer") return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {items.map(({ href, label, Icon, tone }) => (
        <a key={tone} href={href} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors">
          <Icon size={14} aria-hidden="true" />{label}<ArrowUpRight size={12} />
        </a>
      ))}
    </div>
  );

  return (
    <section className="social-channel-banner relative overflow-hidden border-b border-[#183A9B] bg-[#142771] text-white" aria-label="Join our job alert channels">
      <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full border border-white/10 shadow-[0_0_0_28px_rgba(255,255,255,.035),0_0_0_58px_rgba(255,255,255,.025)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3.5 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-[#BFD0FF]">
            <BellRing size={19} />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight text-white">Don't miss your next opportunity</span>
            <span className="block text-xs font-medium text-[#D5DFFF]">Get fresh job alerts and new opportunities straight to your phone.</span>
          </span>
        </div>
        <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto">
          {items.map(({ href, label, short, Icon, tone }) => (
            <a key={tone} href={href} target="_blank" rel="noopener noreferrer"
              className={`channel-cta inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:flex-none ${tone === "whatsapp" ? "border-[#20C875] bg-[#20C875] text-[#082B1B] hover:bg-[#35E18B]" : "border-white bg-white text-[#142771] hover:bg-[#EAF0FF]"}`}
              aria-label={label}>
              <Icon size={16} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
