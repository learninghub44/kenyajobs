import { useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import AdForm from "@/components/admin/AdForm";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadAds() {
    setLoading(true);
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((d) => setAds(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load ads."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((d) => setAds(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load ads."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data) {
    setSubmitting(true);
    setError("");
    try {
      const isEdit = Boolean(editing?.id);
      const res = await fetch(isEdit ? `/api/admin/ads/${editing.id}` : "/api/admin/ads", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save ad");
      }
      setEditing(null);
      loadAds();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ad) {
    if (!confirm(`Delete "${ad.title}"? This can't be undone.`)) return;
    await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
    loadAds();
  }

  async function toggleActive(ad) {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ad, active: !ad.active }),
    });
    loadAds();
  }

  return (
    <AdminLayout active="ads">
      <Head>
        <title>Manage Sponsored Ads | Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      {editing ? (
        <AdForm
          initial={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={submitting}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Sponsored Ads ({ads.length})</h2>
            <button onClick={() => setEditing({})}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Plus size={15} /> New Ad
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : ads.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400 text-sm">
              No sponsored ads yet. Click &quot;New Ad&quot; to add one. Until then, ad slots fall back to Google AdSense (if configured) or a blank placeholder.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {ads.map((ad) => (
                <div key={ad.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ad.title}</p>
                    <p className="text-sm text-gray-500 truncate">{ad.company}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{ad.placement}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">priority {ad.priority}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${ad.active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {ad.active ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleActive(ad)} title={ad.active ? "Pause" : "Activate"}
                      className="p-2 rounded-lg border border-gray-200 hover:border-amber-300 text-gray-500 hover:text-amber-600 transition-all">
                      {ad.active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => setEditing(ad)} title="Edit"
                      className="p-2 rounded-lg border border-gray-200 hover:border-amber-300 text-gray-500 hover:text-amber-600 transition-all">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(ad)} title="Delete"
                      className="p-2 rounded-lg border border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-600 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
