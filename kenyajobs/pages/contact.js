import Head from "next/head";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

const SOCIALS = [
  {
    name: "Instagram",
    handle: "Follow us",
    href: "https://instagram.com/jobsworldwideke",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Follow us",
    href: "https://facebook.com/jobsworldwideke",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    handle: "Follow us",
    href: "https://twitter.com/jobsworldwideke",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "Follow us",
    href: "https://tiktok.com/@jobsworldwideke",
    color: "#010101",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.75a4.85 4.85 0 01-1.03-.06z"/>
      </svg>
    ),
  },
  {
    name: "Telegram",
    handle: "Join our channel",
    href: "https://t.me/+JN0rNZmNbGlkN2I0",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M21.94 4.36a1.5 1.5 0 00-1.55-.27L2.7 11.27a1.45 1.45 0 00.07 2.71l4.62 1.5 1.76 5.6a1.4 1.4 0 002.31.55l2.5-2.3 4.49 3.31a1.5 1.5 0 002.36-.9l3.18-15.05a1.5 1.5 0 00-.05-1.33zM9.05 14.36l-.46 4.3-1.4-4.45 10.6-7.6-8.74 7.75z"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    handle: "Chat with us",
    href: "https://wa.me/254701059192",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.014 21.785h-.005a9.825 9.825 0 01-5.011-1.371l-.36-.214-3.728.978.995-3.633-.235-.373a9.799 9.799 0 01-1.504-5.227c.002-5.42 4.418-9.832 9.85-9.832 2.633 0 5.107 1.026 6.966 2.888a9.776 9.776 0 012.882 6.961c-.002 5.42-4.418 9.823-9.85 9.823zm8.392-18.214A11.815 11.815 0 0012.013 0C5.439 0 .088 5.348.085 11.92a11.88 11.88 0 001.59 5.96L0 24l6.255-1.638a11.91 11.91 0 005.752 1.466h.005c6.573 0 11.924-5.349 11.927-11.921a11.852 11.852 0 00-3.533-8.336z"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1200));
    setStatus("success");
  }

  return (
    <>
      <Head>
        <title>Contact Us | JobsWorldwide</title>
        <meta name="description" content="Get in touch with the JobsWorldwide team." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-sm uppercase tracking-widest text-gray-400 mb-3">Get in touch</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Have a question, spotted a broken listing, or want to post a job? Fill in the form and we&apos;ll get back to you within 2–3 business days.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Left column */}
        <div className="space-y-6">

          {/* Email */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Info</h2>
            <a href="mailto:hello@jobsworldwide.online"
              className="flex items-center gap-3 text-base text-gray-600 hover:text-blue-600 transition-colors">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-blue-600" />
              </div>
              hello@jobsworldwide.online
            </a>
          </div>

          {/* Social media — clean list, no cards */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Follow Us</h2>
            <div className="space-y-3">
              {SOCIALS.map(({ name, handle, href, color, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity group-hover:opacity-80"
                    style={{ backgroundColor: color + "18", color }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">{name}</p>
                    <p className="text-xs text-gray-400">{handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Post a job CTA */}
          <div className="bg-blue-50 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Want to post a job?</h3>
            <p className="text-sm text-gray-500 mb-3">Reach thousands of active job seekers across Africa and globally.</p>
            <a href="mailto:hello@jobsworldwide.online?subject=Post a Job"
              className="text-sm font-semibold text-blue-600 hover:underline">
              Email us to get started →
            </a>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

            {status === "success" ? (
              <div className="text-center py-10">
                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Message sent!</h2>
                <p className="text-gray-500 text-base">Thanks for reaching out. We&apos;ll get back to you within 2–3 business days.</p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm text-blue-600 hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputClass} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email Address *</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputClass} placeholder="jane@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Subject</label>
                  <select value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className={inputClass}>
                    <option value="">Select a topic...</option>
                    <option>General enquiry</option>
                    <option>Report a suspicious listing</option>
                    <option>Post a job / sponsorship</option>
                    <option>Technical issue</option>
                    <option>Partnership opportunity</option>
                    <option>Media enquiry</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Message *</label>
                  <textarea required rows={5} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={inputClass + " resize-none"}
                    placeholder="Tell us how we can help..." />
                </div>

                <button type="submit" disabled={status === "sending"}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-base transition-colors">
                  <Send size={16} />
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
