import { useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "remote", label: "Remote" }, { value: "entry", label: "Entry Level" },
  { value: "graduate", label: "Graduate" }, { value: "wfh", label: "Work From Home" },
  { value: "general", label: "General / Homepage only" },
];
const TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Remote"];
const EMPTY_JOB = {
  title: "", company: "", location: "Kenya", type: "Full-time", salary: "",
  description: "", requirements: "", responsibilities: "", qualifications: "",
  experience: "", education: "", benefits: "", applicationInstructions: "",
  applicationDeadline: "", url: "", companyLogo: "", companyWebsite: "",
  categories: [], featured: false, published: true,
};

export default function JobForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_JOB, ...(initial || {}) }));
  const [error, setError] = useState("");
  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  function toggleCategory(value) {
    setForm((f) => ({ ...f, categories: f.categories.includes(value) ? f.categories.filter((c) => c !== value) : [...f.categories, value] }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim() || !form.url.trim() || !form.description.trim()) {
      setError("Job title, company, description and application URL are required."); return;
    }
    setError(""); onSubmit(form);
  }
  const field = (label, key, placeholder = "", required = false) => (
    <Field label={label + (required ? " *" : "")}>
      <input value={form[key] || ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inputCls} required={required} />
    </Field>
  );
  const area = (label, key, placeholder) => (
    <Field label={label}><textarea value={form[key] || ""} onChange={(e) => set(key, e.target.value)} rows={4} placeholder={placeholder} className={inputCls + " resize-y"} /></Field>
  );
  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Job publishing</p><h2 className="text-xl font-bold text-gray-900">{initial?.id ? "Edit job listing" : "Create a complete job listing"}</h2><p className="text-sm text-gray-500 mt-1">Complete details help candidates understand the role and apply correctly.</p></div>
      <section className="space-y-4"><h3 className="font-semibold text-gray-900 border-b pb-2">Basic information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("Job title", "title", "e.g. Software Engineer", true)}
          {field("Company / employer", "company", "Company name", true)}
          {field("Location", "location", "Nairobi, Kenya / Remote")}
          <Field label="Employment type"><select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>{TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          {field("Salary / compensation", "salary", "e.g. KES 80,000–120,000 or Not disclosed")}
          {field("Application deadline", "applicationDeadline", "YYYY-MM-DD")}
          {field("Application URL", "url", "https://", true)}
          {field("Company website", "companyWebsite", "https://")}
          {field("Company logo URL", "companyLogo", "https://")}
          {field("Experience level", "experience", "e.g. 2–4 years")}
          {field("Education / qualification", "education", "e.g. Bachelor's degree or equivalent")}
        </div>
      </section>
      <section className="space-y-4"><h3 className="font-semibold text-gray-900 border-b pb-2">Role details</h3>
        {area("Job description", "description", "Explain the role, team, organisation and why the position exists.")}
        {area("Key responsibilities", "responsibilities", "List the day-to-day duties and expected outcomes.")}
        {area("Requirements", "requirements", "List required skills, experience, certifications and competencies.")}
        {area("Qualifications", "qualifications", "List minimum and preferred qualifications.")}
        {area("Benefits and what we offer", "benefits", "Salary benefits, insurance, leave, equipment, learning and other perks.")}
        {area("How to apply / application instructions", "applicationInstructions", "Explain documents to submit, application steps and contact details.")}
      </section>
      <section><h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">Publishing options</h3>
        <p className="text-sm font-medium text-gray-700 mb-2">Show on these listing pages</p>
        <div className="flex flex-wrap gap-2">{CATEGORY_OPTIONS.map((c) => <button type="button" key={c.value} onClick={() => toggleCategory(c.value)} className={`text-xs font-semibold px-3 py-2 rounded-full border transition-all ${form.categories.includes(c.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{c.label}</button>)}</div>
        <div className="flex flex-wrap gap-6 mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => set("featured", e.target.checked)} /> Featured listing</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.published !== false} onChange={(e) => set("published", e.target.checked)} /> Publish immediately</label>
        </div>
      </section>
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
      <div className="flex items-center gap-3 pt-2"><button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-60">{submitting ? "Saving…" : initial?.id ? "Save changes" : "Publish job"}</button><button type="button" onClick={onCancel} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-3 text-sm">Cancel</button></div>
    </form>
  );
}
function Field({ label, children }) { return <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>; }
const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
