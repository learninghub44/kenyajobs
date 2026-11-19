import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, UploadCloud, AlertCircle, ShieldCheck } from "lucide-react";
import { HOW_HEARD_OPTIONS } from "@/lib/jobOptions";

const MAX_BYTES = 3 * 1024 * 1024;
const COUNTRY_CODES = [["+254", "KE"], ["+255", "TZ"], ["+256", "UG"], ["+250", "RW"], ["+251", "ET"], ["+234", "NG"], ["+233", "GH"], ["+27", "ZA"], ["+44", "UK"], ["+1", "US/CA"], ["+971", "AE"]];
const EMPTY = { firstName: "", lastName: "", email: "", countryCode: "+254", phone: "", whatsappUpdates: false, address: "", linkedin: "", portfolio: "", workProfile: "", workSamples: "", howHeard: "", acceptTerms: false, website: "" };
const input = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Label({ text, required, children }) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      <span>{text}</span>{" "}
      <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${required ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>{required ? "Required" : "Optional"}</span>
      <div className="mt-1.5 font-normal">{children}</div>
    </label>
  );
}

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });
}

export default function ApplyForm({ job }) {
  const needs = job.requiredDocuments || ["resume"];
  const keyRef = useRef(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!keyRef.current) keyRef.current = (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "-").padEnd(24, "x");
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  function clear() { setForm(EMPTY); setFile(null); setError(""); if (fileRef.current) fileRef.current.value = ""; }
  function pick(e) {
    const f = e.target.files?.[0];
    setError("");
    if (!f) return setFile(null);
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) { e.target.value = ""; setFile(null); return setError("Your resume must be a PDF file."); }
    if (f.size > MAX_BYTES) { e.target.value = ""; setFile(null); return setError("Your resume must be under 3 MB."); }
    setFile(f);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!file) return setError("Upload your resume as a PDF.");
    setBusy(true);
    try {
      const national = form.phone.replace(/\D/g, "").replace(/^0+/, "");
      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id, submissionKey: keyRef.current,
          firstName: form.firstName, lastName: form.lastName, email: form.email,
          phone: form.countryCode + national, whatsappUpdates: form.whatsappUpdates, address: form.address,
          linkedin: form.linkedin, portfolio: form.portfolio, workProfile: form.workProfile, workSamples: form.workSamples,
          howHeard: form.howHeard, acceptTerms: form.acceptTerms, website: form.website,
          resume: { name: file.name, data: await readAsBase64(file) },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We could not submit your application. Please try again.");
      setDone(data);
    } catch (err) {
      setError(err.message || "We could not submit your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <article id="apply" className="job-description-panel">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
          <CheckCircle2 size={28} />
          <h2 className="mt-3 text-xl font-bold">Application received</h2>
          <p className="mt-2 text-sm">Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been sent to the hiring team. Reference: <strong>{done.reference}</strong>.</p>
          <p className="mt-2 text-sm">The employer may contact you by email or phone if you are shortlisted.</p>
        </div>
      </article>
    );
  }

  return (
    <article id="apply" className="job-description-panel">
      <div className="job-section-heading"><span /><h2>Apply for this job</h2></div>
      <div className="mb-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p><strong>Applying is always free.</strong> {job.company} and JOBS HUB KENYA will never ask you to pay to apply, be interviewed or be hired. If anyone asks you for money for this job, do not pay.</p>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <div className="flex justify-end"><button type="button" onClick={clear} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Clear form</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label text="First name" required><input className={input} required maxLength={80} autoComplete="given-name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="John" /></Label>
          <Label text="Last name" required><input className={input} required maxLength={80} autoComplete="family-name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Doe" /></Label>
        </div>
        <Label text="Email" required><input className={input} type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="johndoe@example.com" /></Label>
        <Label text="Phone" required>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select className={input + " sm:w-32 sm:shrink-0"} value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)} aria-label="Country code">{COUNTRY_CODES.map(([c, n]) => <option key={c + n} value={c}>{c} {n}</option>)}</select>
            <input className={input + " min-w-0 sm:flex-1"} type="tel" required inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0791000000" />
          </div>
        </Label>
        <p className="-mt-2 text-xs text-gray-500">The hiring team may use this number to contact you.</p>
        <label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" className="mt-1" checked={form.whatsappUpdates} onChange={(e) => set("whatsappUpdates", e.target.checked)} /><span>Send me updates about this application on WhatsApp (to the number above). You can reply STOP at any time to opt out.</span></label>
        <Label text="Address"><input className={input} maxLength={200} autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Nairobi, Kenya" /></Label>

        <Label text="Resume / CV" required>
          <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-5 text-center">
            <UploadCloud className="mx-auto text-teal-700" size={26} />
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={pick} className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
            <p className="mt-2 text-xs text-gray-500">{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : "PDF only · max 3 MB"}</p>
          </div>
        </Label>
        <Label text="LinkedIn profile" required={needs.includes("linkedin")}><input className={input} type="url" required={needs.includes("linkedin")} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/johndoe" /></Label>
        <Label text="Portfolio link" required={needs.includes("portfolio")}><input className={input} type="url" required={needs.includes("portfolio")} value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://portfolio.example.com" /></Label>
        <Label text="Work profile" required={needs.includes("work_profile")}><input className={input} type="url" required={needs.includes("work_profile")} value={form.workProfile} onChange={(e) => set("workProfile", e.target.value)} placeholder="https://workprofile.example.com" /></Label>
        <Label text="Work samples" required={needs.includes("work_samples")}><input className={input} type="url" required={needs.includes("work_samples")} value={form.workSamples} onChange={(e) => set("workSamples", e.target.value)} placeholder="https://worksamples.example.com" /></Label>
        <Label text="How did you hear about us?">
          <select className={input} value={form.howHeard} onChange={(e) => set("howHeard", e.target.value)}><option value="">Select an option</option>{HOW_HEARD_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        </Label>

        <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></label>

        <label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" required className="mt-1" checked={form.acceptTerms} onChange={(e) => set("acceptTerms", e.target.checked)} /><span>I agree to the <Link href="/terms-and-conditions" className="font-semibold text-blue-700 underline">Terms and Conditions</Link> and confirm all information provided is accurate.</span></label>
        {error && <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-xl bg-teal-500 px-5 py-3.5 text-base font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Submitting…" : "Submit Application"}</button>
      </form>
    </article>
  );
}
