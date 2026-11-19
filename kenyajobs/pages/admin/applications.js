import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import { Download, Trash2, Mail, Phone, ExternalLink } from "lucide-react";

const STATUSES = [["new", "New"], ["reviewed", "Reviewed"], ["shortlisted", "Shortlisted"], ["rejected", "Rejected"]];
const BADGE = { new: "bg-blue-50 text-blue-700", reviewed: "bg-gray-100 text-gray-700", shortlisted: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-700" };
const when = (v) => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v));

export default function AdminApplications() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const r = await fetch("/api/admin/applications?" + params);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load applications");
      setItems(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [status, q]);
  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);

  async function update(id, patch) {
    try {
      const r = await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Update failed");
      setItems((list) => list.map((a) => (a.id === id ? d : a)));
    } catch (e) { setError(e.message); }
  }
  async function remove(a) {
    if (!confirm(`Permanently delete ${a.first_name} ${a.last_name}'s application and CV? This can't be undone.`)) return;
    try {
      const r = await fetch("/api/admin/applications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id }) });
      if (!r.ok) throw new Error((await r.json()).error || "Delete failed");
      setItems((list) => list.filter((x) => x.id !== a.id));
    } catch (e) { setError(e.message); }
  }

  const link = (label, href) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">{label}<ExternalLink size={11} /></a> : null;

  return (
    <AdminLayout active="applications">
      <Head><title>Applications | Admin</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="mb-5"><h2 className="text-xl font-bold text-gray-900">Job applications</h2><p className="text-sm text-gray-500 mt-1">Candidates who applied through JOBS HUB KENYA. CVs are private and only downloadable here.</p></div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or job" className="w-full sm:w-72 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"><option value="">All statuses</option>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : items.length === 0 ? <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No applications yet.</p> : (
        <ul className="space-y-3">{items.map((a) => (
          <li key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{a.first_name} {a.last_name} <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE[a.status]}`}>{a.status}</span></p>
                <p className="text-sm text-gray-600">Applied for <strong>{a.job_title}</strong>{a.job_number ? ` (JH-${a.job_number})` : ""} at {a.company}</p>
                <p className="text-xs text-gray-400">{when(a.created_at)} · APP-{a.id}{a.how_heard ? ` · via ${a.how_heard}` : ""}</p>
              </div>
              <select value={a.status} onChange={(e) => update(a.id, { status: e.target.value })} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm" aria-label="Application status">{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 text-gray-700 hover:underline"><Mail size={14} />{a.email}</a>
              <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 text-gray-700 hover:underline"><Phone size={14} />{a.phone}{a.whatsapp_updates ? " · WhatsApp OK" : ""}</a>
              {a.address && <span className="text-gray-500">{a.address}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{[link("LinkedIn", a.linkedin_url), link("Portfolio", a.portfolio_url), link("Work profile", a.work_profile_url), link("Work samples", a.work_samples_url)]}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a href={`/api/admin/applications/${a.id}/resume`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"><Download size={14} />Download CV ({Math.max(1, Math.round(a.resume_size / 1024))} KB)</a>
              <button onClick={() => remove(a)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={14} />Delete</button>
            </div>
            <textarea defaultValue={a.admin_notes || ""} onBlur={(e) => e.target.value !== (a.admin_notes || "") && update(a.id, { adminNotes: e.target.value })} placeholder="Private notes (saved when you click away)" rows={2} className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </li>
        ))}</ul>
      )}
    </AdminLayout>
  );
}
