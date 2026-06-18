import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LogOut, Briefcase, Megaphone, Activity } from "lucide-react";

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

  if (!ready) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">Checking session...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin</h1>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
          <LogOut size={14} /> Log Out
        </button>
      </div>
      <div className="flex gap-2 mb-8">
        <Link href="/admin/jobs"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            active === "jobs" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}>
          <Briefcase size={14} /> Jobs
        </Link>
        <Link href="/admin/ads"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            active === "ads" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}>
          <Megaphone size={14} /> Sponsored Ads
        </Link>
        <Link href="/admin/diagnostics"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            active === "diagnostics" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}>
          <Activity size={14} /> Source Status
        </Link>
      </div>
      {children}
    </div>
  );
}
