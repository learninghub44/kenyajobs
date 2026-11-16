import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MessageCircle, Send } from "lucide-react";

export default function SocialChannelLinks({ variant = "banner" }) {
  const router = useRouter();
  const [links, setLinks] = useState({ whatsapp: "", telegram: "" });
  useEffect(() => {
    let active = true;
    fetch("/api/social-links").then((r) => r.ok ? r.json() : null)
      .then((data) => { if (active && data) setLinks({whatsapp:data.whatsapp||"",telegram:data.telegram||""}); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  if (router.pathname.startsWith("/admin")) return null;
  const items = [
    links.whatsapp && {href:links.whatsapp,label:"Join WhatsApp Channel",Icon:MessageCircle,tone:"whatsapp"},
    links.telegram && {href:links.telegram,label:"Join Telegram Channel",Icon:Send,tone:"telegram"},
  ].filter(Boolean);
  if (!items.length) return null;
  if (variant === "footer") return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {items.map(({href,label,Icon,tone}) => <a key={tone} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"><Icon size={14}/>{label}</a>)}
    </div>
  );
  return (
    <div className="border-b border-border bg-[#F4F7F2]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-4 py-2.5 sm:justify-between sm:px-6">
        <span className="text-xs font-semibold text-text-secondary">Get fresh job alerts and new opportunities:</span>
        <div className="flex flex-wrap items-center gap-2">
          {items.map(({href,label,Icon,tone}) => <a key={tone} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary hover:text-primary transition-colors"><Icon size={14}/>{label}</a>)}
        </div>
      </div>
    </div>
  );
}
