import { useState } from "react";

const PLACEMENT_OPTIONS = [
  { value: "all", label: "All pages" },
  { value: "homepage-grid", label: "Homepage grid" },
  { value: "listing-grid", label: "Category listing pages" },
  { value: "sidebar", label: "Job detail sidebar" },
];

const EMPTY_AD = {
  title: "",
  company: "",
  description: "",
  url: "",
  imageUrl: "",
  placement: "all",
  active: true,
  priority: 0,
};

export default function AdForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_AD, ...(initial || {}) }));
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      setError("Title and destination URL are required.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      <h2 className="font-bold text-gray-900">{initial?.id ? "Edit Sponsored Ad" : "New Sponsored Ad"}</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Title *">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Company / Advertiser">
          <input value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Destination URL *">
          <input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
        <Field label="Image / Logo URL (optional)">
          <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
        <Field label="Placement">
          <select value={form.placement} onChange={(e) => set("placement", e.target.value)} className={inputCls}>
            {PLACEMENT_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Priority (higher shows first)">
          <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Field label="Description (optional)">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls} />
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded border-gray-300" />
        Active (visible on site)
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
          {submitting ? "Saving..." : initial?.id ? "Save Changes" : "Create Ad"}
        </button>
        <button type="button" onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
