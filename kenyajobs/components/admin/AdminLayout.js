import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { LogOut, Briefcase, Megaphone, Activity, Radio, FileText, Inbox, Link2, CalendarDays, ClipboardList, Menu, X, LayoutDashboard, Receipt } from "lucide-react";

export default function AdminLayout({ children, active }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.authenticated) router.replace("/login/admin/management");
        else setReady(true);
      })
      .catch(() => { if (!cancelled) router.replace("/login/admin/management"); });
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  }

  if (!ready) return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-gray-400">Checking session...</div>;

  const links = [
    { id: "overview", href: "/admin/overview", label: "Overview", Icon: LayoutDashboard },
    { id: "jobs", href: "/admin/jobs", label: "Jobs", Icon: Briefcase },
    { id: "blog", href: "/admin/blog", label: "Blog", Icon: FileText },
    { id: "submissions", href: "/admin/submissions", label: "Job requests", Icon: Inbox },
    { id: "event-submissions", href: "/admin/event-submissions", label: "Event requests", Icon: CalendarDays },
    { id: "listings", href: "/admin/listings", label: "Listing lifecycle", Icon: ClipboardList },
    { id: "posting-links", href: "/admin/posting-links", label: "Employer links", Icon: Link2 },
    { id: "invoices", href: "/admin/invoices", label: "Invoices", Icon: Receipt },
    { id: "ads", href: "/admin/ads", label: "Sponsored Ads", Icon: Megaphone },
    { id: "diagnostics", href: "/admin/diagnostics", label: "Source Status", Icon: Activity },
    { id: "distribution", href: "/admin/distribution", label: "Distribution", Icon: Radio },
  ];

  return (
    <>
      <Head><meta name="robots" content="noindex,nofollow" /><meta name="referrer" content="no-referrer" /></Head>
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#dce8e1] bg-white px-4 py-3 shadow-[0_8px_30px_rgba(6,63,52,0.06)] sm:mb-6">
          <Link href="/admin/overview" className="flex min-w-0 items-center gap-3">
            <img src="/zetubiz-logo.svg" alt="ZetuBiz Business Solutions" className="h-11 w-[100px] shrink-0 object-contain object-left sm:h-12 sm:w-[118px]"/>
            <span className="min-w-0 border-l border-gray-200 pl-3"><span className="block text-sm font-bold leading-tight text-gray-900 sm:text-base">JOBS HUB KENYA</span><span className="block text-[11px] text-gray-500">Administration workspace</span></span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" aria-expanded={mobileNavOpen} aria-controls="admin-mobile-navigation" onClick={() => setMobileNavOpen(v => !v)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:hidden">{mobileNavOpen ? <X size={16}/> : <Menu size={16}/>}<span>Menu</span></button>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 sm:px-3 sm:text-sm"><LogOut size={14}/><span className="hidden sm:inline">Log Out</span></button>
          </div>
        </header>
        <nav aria-label="Admin navigation" className="mb-6 hidden gap-1.5 overflow-x-auto rounded-xl border border-[#e2e9e4] bg-white p-2 shadow-[0_4px_20px_rgba(6,63,52,0.04)] md:flex">
          {links.map(({id,href,label,Icon}) => (
            <Link key={id} href={href} aria-current={active===id ? "page" : undefined} className={"inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors " + (active===id ? "bg-green-700 text-white" : "text-gray-600 hover:bg-green-50 hover:text-green-800")}>
              <Icon size={15}/>{label}
            </Link>
          ))}
        </nav>
        {mobileNavOpen && <nav id="admin-mobile-navigation" aria-label="Mobile admin navigation" className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:grid-cols-3 md:hidden">
          {links.map(({id,href,label,Icon}) => (
            <Link key={id} href={href} onClick={() => setMobileNavOpen(false)} aria-current={active===id ? "page" : undefined} className={"flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold " + (active===id ? "bg-green-700 text-white" : "bg-gray-50 text-gray-700 hover:bg-green-50")}>
              <Icon size={15} className="shrink-0"/><span>{label}</span>
            </Link>
          ))}
        </nav>}
        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}
