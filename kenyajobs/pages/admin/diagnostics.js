import { useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const ROUTE_LABELS = {
  "/api/africa-jobs": "Homepage feed (Africa + global)",
  "/api/remote-jobs": "Remote Jobs page",
  "/api/entry-level-jobs": "Entry Level page",
  "/api/graduate-jobs": "Graduate Jobs page",
  "/api/wfh-jobs": "Work From Home page",
  "/api/manual-jobs": "Manually-posted jobs",
};

export default function Diagnostics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function runCheck() {
    setLoading(true);
    setError("");
    fetch("/api/admin/diagnostics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to run diagnostics."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/admin/diagnostics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to run diagnostics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout active="diagnostics">
      <Head>
        <title>Source Status | Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Job Source Status</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `Last checked ${new Date(data.checkedAt).toLocaleTimeString()}` : "Checks every route the live site actually calls"}
          </p>
        </div>
        <button onClick={runCheck} disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Checking..." : "Re-check now"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {data && (
        <>
          {/* Env / config summary */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Configuration</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Database", ok: data.env.database },
                { label: "Admin password", ok: data.env.adminPassword },
                { label: "JSearch (RAPIDAPI_KEY)", ok: data.env.rapidApiKey, optional: true },
                { label: "Adzuna", ok: data.env.adzuna, optional: true },
                { label: "AdSense", ok: data.env.adsense, optional: true },
              ].map(({ label, ok, optional }) => (
                <span key={label} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  ok ? "bg-green-50 text-green-700 border-green-200" : optional ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-red-50 text-red-700 border-red-200"
                }`}>
                  {ok ? <CheckCircle2 size={12} /> : optional ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                  {label}{!ok && optional ? " (not set)" : ""}
                </span>
              ))}
            </div>
          </div>

          {/* Per-route results */}
          <div className="space-y-4">
            {data.results.map((r) => (
              <div key={r.route} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {r.ok && r.total > 0 ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                      <p className="font-semibold text-gray-900">{ROUTE_LABELS[r.route] || r.route}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{r.route} · {r.ms}ms</p>
                  </div>
                  <span className={`text-sm font-bold ${r.total > 0 ? "text-gray-900" : "text-red-600"}`}>
                    {r.total} job{r.total === 1 ? "" : "s"}
                  </span>
                </div>

                {r.error && <p className="text-sm text-red-600 mb-3">Error: {r.error}</p>}

                {r.ok && Object.keys(r.bySource).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {Object.entries(r.bySource).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                      <span key={src} className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {src}: {count}
                      </span>
                    ))}
                  </div>
                )}

                {r.ok && r.missing && r.missing.length > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2">
                    Not returning right now: {r.missing.join(", ")} — could be temporarily down, rate-limited, or just have nothing new this cycle. Worth checking Vercel function logs if this persists.
                  </p>
                )}

                {r.gated && r.gated.map((g) => !g.configured && (
                  <p key={g.name} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 mt-2">
                    {g.name} is skipped because <code>{g.envVar}</code> isn&apos;t set — not an error, just not configured.
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
