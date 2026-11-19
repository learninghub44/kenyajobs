import { useState } from "react";
import { WORK_MODES, EXPERIENCE_LEVELS, SALARY_PERIODS, DOCUMENT_TYPES } from "@/lib/jobOptions";

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
  applicationMethod: "", workMode: "", industry: "", experienceLevel: "",
  salaryMin: "", salaryMax: "", salaryCurrency: "KES", salaryPeriod: "month", requiredDocuments: ["resume"],
};

export default function JobForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_JOB, ...(initial || {}) }));
  const [error, setError] = useState("");
  const [skillsText, setSkillsText] = useState(() => (Array.isArray(initial?.skills) ? initial.skills.join(", ") : ""));
  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  function toggleCategory(value) {
    setForm((f) => ({ ...f, categories: f.categories.includes(value) ? f.categories.filter((c) => c !== value) : [...f.categories, value] }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const onPlatform = form.applicationMethod === "platform";
    if (!form.title.trim() || !form.company.trim() || (!onPlatform && !form.url.trim()) || !form.description.trim()) {
      setError(onPlatform ? "Job title, company and description are required." : "Job title, company, description and application URL are required."); return;
    }
    if (form.salaryMin !== "" && form.salaryMax !== "" && Number(form.salaryMax) < Number(form.salaryMin)) { setError("Maximum salary cannot be lower than minimum salary."); return; }
    setError(""); onSubmit({ ...form, skills: skillsText });
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
          <Field label="How do candidates apply?"><select value={form.applicationMethod === "platform" ? "platform" : form.applicationMethod ? "external" : ""} onChange={(e) => set("applicationMethod", e.target.value === "platform" ? "platform" : "")} className={inputCls}>
            <option value="">Company link, Google Form or email (detected from the link)</option>
            <option value="platform">On this platform (candidates apply here with their CV)</option>
          </select></Field>
          {form.applicationMethod === "platform"
            ? <p className="text-xs text-teal-700 sm:col-span-2 self-center">Candidates will complete the application form on the job page. Applications appear under Applications in this dashboard. No external link is needed.</p>
            : <>
              {field("Application URL or email", "url", "https://forms.gle/... or mailto:careers@company.com", true)}
              <p className="text-xs text-gray-500 sm:col-span-2">Accepts direct website links, Google Forms responder links, or mailto:email@company.com. The company website field remains optional.</p>
            </>}
          {field("Company website", "companyWebsite", "https://")}
          {field("Company logo URL", "companyLogo", "https://")}
          {field("Experience level", "experience", "e.g. 2–4 years")}
          {field("Education / qualification", "education", "e.g. Bachelor's degree or equivalent")}
        </div>
        <h4 className="text-sm font-semibold text-gray-800 pt-2">Job facts shown on the listing</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Work mode"><select value={form.workMode || ""} onChange={(e) => set("workMode", e.target.value)} className={inputCls}><option value="">Not specified</option>{WORK_MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Seniority level"><select value={form.experienceLevel || ""} onChange={(e) => set("experienceLevel", e.target.value)} className={inputCls}><option value="">Not specified</option>{EXPERIENCE_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          {field("Industry", "industry", "e.g. Energy, Banking, Health")}
          <Field label="Skills (comma separated)"><input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="e.g. Paid adverts, Video editing, SEO" className={inputCls} /></Field>
          <Field label="Salary from"><input type="number" min="0" value={form.salaryMin ?? ""} onChange={(e) => set("salaryMin", e.target.value)} placeholder="40000" className={inputCls} /></Field>
          <Field label="Salary up to"><input type="number" min="0" value={form.salaryMax ?? ""} onChange={(e) => set("salaryMax", e.target.value)} placeholder="50000" className={inputCls} /></Field>
          <Field label="Currency"><input value={form.salaryCurrency || "KES"} maxLength={3} onChange={(e) => set("salaryCurrency", e.target.value.toUpperCase())} className={inputCls} /></Field>
          <Field label="Paid per"><select value={form.salaryPeriod || "month"} onChange={(e) => set("salaryPeriod", e.target.value)} className={inputCls}>{SALARY_PERIODS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <p className="text-xs text-gray-500 sm:col-span-2">If you fill in a salary range it is shown as &quot;KES 40,000 - 50,000 / month&quot;. The free-text salary field above is used instead when it is filled in.</p>
        </div>
        {form.applicationMethod === "platform" && (
          <div><p className="text-sm font-medium text-gray-700 mb-2">Documents candidates must provide (a CV is always required)</p>
            <div className="flex flex-wrap gap-3">{DOCUMENT_TYPES.filter((d) => d.value !== "resume").map((d) => (
              <label key={d.value} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={(form.requiredDocuments || []).includes(d.value)} onChange={(e) => set("requiredDocuments", e.target.checked ? [...new Set([...(form.requiredDocuments || ["resume"]), d.value])] : (form.requiredDocuments || []).filter((x) => x !== d.value))} /> {d.label}</label>
            ))}</div></div>
        )}
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
