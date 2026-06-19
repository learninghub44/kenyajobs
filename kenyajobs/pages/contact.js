import Head from "next/head";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

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

        {/* Contact info */}
        <div className="space-y-6">
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

          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">Follow us</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p><a href="https://instagram.com/jobsworldwideke" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Instagram — @jobsworldwideke</a></p>
              <p><a href="https://facebook.com/jobsworldwideke" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Facebook — @jobsworldwideke</a></p>
              <p><a href="https://twitter.com/jobsworldwideke" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Twitter / X — @jobsworldwideke</a></p>
              <p><a href="https://tiktok.com/@jobsworldwideke" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">TikTok — @jobsworldwideke</a></p>
            </div>
          </div>

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
                <button onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-sm text-blue-600 hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input
                      type="text" required
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputClass} placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email Address *</label>
                    <input
                      type="email" required
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputClass} placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Subject</label>
                  <select
                    value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
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
                  <textarea
                    required rows={5}
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={inputClass + " resize-none"}
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
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
