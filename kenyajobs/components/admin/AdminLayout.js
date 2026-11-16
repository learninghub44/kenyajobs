import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LogOut, Briefcase, Megaphone, Activity, Radio, FileText, Inbox, Link2 } from "lucide-react";

export default function AdminLayout({ children, active }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.authenticated) router.replace("/admin");
        else setReady(true);
      })
      .catch(() => { if (!cancelled) router.replace("/admin"); });
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  }

  if (!ready) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">Checking session...</div>;

  const links = [
    { id: "jobs", href: "/admin/jobs", label: "Jobs", Icon: Briefcase },
    { id: "blog", href: "/admin/blog", label: "Blog", Icon: FileText },
    { id: "submissions", href: "/admin/submissions", label: "Job submissions", Icon: Inbox },\n    { id: "posting-links", href: "/admin/posting-links", label: "Employer links", Icon: Link2 },
    { id: "ads", href: "/admin/ads", label: "Sponsored Ads", Icon: Megaphone },
    { id: "diagnostics", href: "/admin/diagnostics", label: "Source Status", Icon: Activity },
    { id: "distribution", href: "/admin/distribution", label: "Distribution", Icon: Radio },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin</h1>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
          <LogOut size={14} /> Log Out
        </button>
      </div>
      <nav aria-label="Admin navigation" className="mb-8 flex flex-wrap gap-2">
        {links.map(({ id, href, label, Icon }) => (
          <Link key={id} href={href} aria-current={active === id ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              active === id ? "bg-green-700 text-white" : "border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700"
            }`}>
            <Icon size={14} /> {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
