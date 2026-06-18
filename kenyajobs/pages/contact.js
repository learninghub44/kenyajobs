import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader } from "lucide-react";

const SUBJECTS = [
  "General enquiry",
  "Report a suspicious listing",
  "Post a job / sponsorship",
  "Technical issue",
  "Partnership opportunity",
  "Media enquiry",
  "Other",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  const inputClass =
    "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <>
      <Head>
        <title>Contact Us | JobsWorldwide</title>
        <meta name="description" content="Get in touch with JobsWorldwide — report listings, post a job, or ask any question." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p style={{ fontFamily: "var(--font-mono)" }}
            className="text-sm uppercase tracking-widest text-gray-400 mb-3">
            Get in touch
          </p>
          <h1 style={{ fontFamily: "DM Sans, sans-serif" }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-tight mb-2">
            Contact Us
          </h1>
          <p className="text-base text-gray-500 max-w-xl">
            Have a question, spotted a broken listing, or want to advertise a role?
            Fill in the form and we&apos;ll get back to you within 2–3 business days.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left — info cards */}
          <aside className="space-y-6">
            {[
              {
                icon: Mail,
                label: "Email us directly",
                value: "hello@jobsworldwide.online",
                href: "mailto:hello@jobsworldwide.online",
                note: "We respond within 2–3 business days",
              },
              {
                icon: MapPin,
                label: "Based in",
                value: "Nairobi, Kenya",
                note: "Serving job seekers worldwide",
              },
            ].map(({ icon: Icon, label, value, href, note }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-0.5">{label}</p>
                    {href ? (
                      <a href={href}
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="text-sm text-blue-600 hover:underline break-all">
                        {value}
                      </a>
                    ) : (
                      <p className="text-base font-medium text-gray-900">{value}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">{note}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Common reasons */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p style={{ fontFamily: "DM Sans, sans-serif" }}
                className="text-sm font-semibold text-gray-900 mb-3">
                Common reasons to contact us
              </p>
              <ul className="space-y-2">
                {[
                  "Report a suspicious or fraudulent listing",
                  "Post or sponsor a job listing",
                  "Suggest a new job board source",
                  "Report a technical issue",
                  "Partnership or media enquiry",
                ].map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-gray-500">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right — form */}
          <div className="lg:col-span-2">

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-gray-200 rounded-xl px-8">
                <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                <h2 style={{ fontFamily: "DM Sans, sans-serif" }}
                  className="text-2xl font-semibold text-gray-900 mb-2">
                  Message sent!
                </h2>
                <p className="text-base text-gray-500 max-w-sm mb-6">
                  Thanks for reaching out. We&apos;ll get back to you at your email address within 2–3 business days.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-base text-blue-600 hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-5">

                {/* Error banner */}
                {status === "error" && (
                  <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-base text-red-700">{errorMsg}</p>
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Mwangi"
                      value={form.name}
                      onChange={set("name")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Email address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={set("email")}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Phone number <span className="text-gray-300 font-normal">(optional)</span></label>
                    <input
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={form.phone}
                      onChange={set("phone")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Subject</label>
                    <select
                      value={form.subject}
                      onChange={set("subject")}
                      className={inputClass + " cursor-pointer"}>
                      <option value="">Select a subject…</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={labelClass}>
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={set("message")}
                    className={inputClass + " resize-none"}
                  />
                  <p className="text-sm text-gray-400 mt-1.5">Minimum 10 characters</p>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm text-gray-400">
                    We&apos;ll reply to the email address you provide above.
                  </p>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-base font-semibold px-6 py-3 rounded-lg transition-colors">
                    {status === "sending" ? (
                      <><Loader size={15} className="animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom legal strip */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-700 transition-colors">← Back to Jobs</Link>
          <Link href="/about" className="hover:text-gray-700 transition-colors">About Us</Link>
          <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-gray-700 transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </>
  );
}
