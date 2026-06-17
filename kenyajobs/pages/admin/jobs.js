import { useEffect, useState } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import JobForm from "@/components/admin/JobForm";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // job object, or {} for new, or null for hidden
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadJobs() {
    setLoading(true);
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch("/api/admin/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data) {
    setSubmitting(true);
    setError("");
    try {
      const isEdit = Boolean(editing?.id);
      const res = await fetch(isEdit ? `/api/admin/jobs/${editing.id}` : "/api/admin/jobs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save job");
      }
      setEditing(null);
      loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(job) {
    if (!confirm(`Delete "${job.title}" at ${job.company}? This can't be undone.`)) return;
    await fetch(`/api/admin/jobs/${job.id}`, { method: "DELETE" });
    loadJobs();
  }

  async function togglePublished(job) {
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...job, published: !job.published }),
    });
    loadJobs();
  }

  return (
    <AdminLayout active="jobs">
      <Head>
        <title>Manage Jobs | Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      {editing ? (
        <JobForm
          initial={editing.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={submitting}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Manually-Posted Jobs ({jobs.length})</h2>
            <button onClick={() => setEditing({})}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Plus size={15} /> Post a Job
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400 text-sm">
              No manually-posted jobs yet. Click &quot;Post a Job&quot; to add one.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {job.featured && <Star size={13} className="fill-amber-500 text-amber-500 flex-shrink-0" />}
                      <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{job.company} · {job.location}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(job.categories || []).map((c) => (
                        <span key={c} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{c}</span>
                      ))}
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${job.published ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {job.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => togglePublished(job)} title={job.published ? "Unpublish" : "Publish"}
                      className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition-all">
                      {job.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => setEditing(job)} title="Edit"
                      className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition-all">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(job)} title="Delete"
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
