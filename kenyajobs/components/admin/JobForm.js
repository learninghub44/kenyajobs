import { useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "entry", label: "Entry Level" },
  { value: "graduate", label: "Graduate" },
  { value: "wfh", label: "Work From Home" },
  { value: "general", label: "General / Homepage only" },
];

const TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

const EMPTY_JOB = {
  title: "",
  company: "",
  location: "Worldwide",
  type: "Full-time",
  salary: "",
  description: "",
  url: "",
  companyLogo: "",
  companyWebsite: "",
  categories: [],
  featured: false,
  published: true,
};

export default function JobForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_JOB, ...(initial || {}) }));
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCategory(value) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(value)
        ? f.categories.filter((c) => c !== value)
        : [...f.categories, value],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim() || !form.url.trim()) {
      setError("Title, company and application URL are required.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      <h2 className="font-bold text-gray-900">{initial?.id ? "Edit Job" : "Post a New Job"}</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Job Title *">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Company *">
          <input value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Location">
          <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Job Type">
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Salary (optional)">
          <input value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="e.g. KES 80,000 – 120,000" className={inputCls} />
        </Field>
        <Field label="Application / Apply URL *">
          <input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
        <Field label="Company Logo URL (optional)">
          <input value={form.companyLogo} onChange={(e) => set("companyLogo", e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
        <Field label="Company Website (optional)">
          <input value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
      </div>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5}
          placeholder="Plain text or simple HTML (p, ul, li, strong, em, a tags are supported)"
          className={inputCls} />
      </Field>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Show on these listing pages</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <button type="button" key={c.value} onClick={() => toggleCategory(c.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                form.categories.includes(c.value)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Always appears on the homepage regardless of selection.</p>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="rounded border-gray-300" />
          Featured (pinned to top)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded border-gray-300" />
          Published (visible on site)
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
          {submitting ? "Saving..." : initial?.id ? "Save Changes" : "Post Job"}
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

const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
