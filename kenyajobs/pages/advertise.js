import Head from "next/head";
import { useState } from "react";
import { CheckCircle2, Mail, Users, Globe, Zap, Send } from "lucide-react";

const PACKAGES = [
  {
    name: "Standard",
    price: "KES 1,500",
    period: "per listing / 30 days",
    color: "border-gray-200",
    features: [
      "1 job listing live for 30 days",
      "Appears in main job feed",
      "Direct apply link to your site",
      "Listed under your company name",
    ],
    cta: "Get Started",
  },
  {
    name: "Featured",
    price: "KES 3,000",
    period: "per listing / 30 days",
    color: "border-blue-500",
    features: [
      "Everything in Standard",
      "Pinned to top of feed for 7 days",
      "Bold featured badge",
      "Priority in search results",
      "Included in weekly email digest",
    ],
    cta: "Get Featured",
  },
  {
    name: "Bundle",
    price: "KES 8,000",
    period: "5 listings / 60 days",
    color: "border-gray-200",
    features: [
      "5 job listings, 60 days each",
      "1 featured slot included",
      "Company profile page",
      "Dedicated account support",
      "Performance report",
    ],
    cta: "Talk to Us",
  },
];

const WHY_US = [
  { icon: Users, title: "Active Kenyan job seekers", body: "Our audience is actively applying — not passively browsing. Most visitors arrive from search engines looking for specific roles.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Globe, title: "Kenya + Africa focus", body: "Unlike global boards where local listings get buried, our feed prioritises Kenyan and East African opportunities.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Zap, title: "Live within hours", body: "Manual postings go live within 24 hours of approval. No lengthy review queues or account setup delays.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: CheckCircle2, title: "No middlemen", body: "Applications go directly from candidate to you. We never intercept, filter, or charge candidates anything.", color: "text-violet-600", bg: "bg-violet-50" },
];

export default function Advertise() {
  const [form, setForm] = useState({ company: "", contact: "", email: "", package: "Standard", roles: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1200));
    setStatus("success");
  }

  return (
    <>
      <Head>
        <title>Advertise & Post a Job | JobsWorldwide Kenya</title>
        <meta name="description" content="Post a job on JobsWorldwide and reach thousands of active Kenyan and African job seekers. Affordable packages for employers of all sizes." />
      </Head>

      {/* Header */}
      <div className="bg-[#0b2233] text-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">For Employers</p>
          <h1 className="text-4xl font-bold mb-3">Post a Job. Hire Faster.</h1>
          <p className="text-slate-300 text-base max-w-lg leading-relaxed">
            Reach thousands of active job seekers across Kenya, East Africa, and globally — with your listing placed directly in our live feed, no algorithm hiding it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">

        {/* Why us */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Why JobsWorldwide</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why employers choose us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_US.map(({ icon: Icon, title, body, color, bg }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Pricing</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Simple, transparent pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className={`bg-white border-2 ${pkg.color} rounded-2xl p-6 flex flex-col`}>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{pkg.name}</h3>
                <div className="mb-1">
                  <span className="text-2xl font-black text-gray-900">{pkg.price}</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">{pkg.period}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:hello@jobsworldwide.online?subject=${encodeURIComponent(`Advertise - ${pkg.name} Package`)}`}
                  className="text-center font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {pkg.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Prices in KES. NGOs and government institutions may qualify for discounted rates — email us to enquire.</p>
        </section>

        {/* Enquiry form */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Get in Touch</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a job posting enquiry</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl">
            {status === "success" ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Enquiry received!</h3>
                <p className="text-gray-500 text-sm">We'll get back to you within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Company Name *</label>
                    <input required type="text" value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Ltd" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Contact Name *</label>
                    <input required type="text" value={form.contact}
                      onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jane Kamau" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Work Email *</label>
                  <input required type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="jane@acme.co.ke" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Package Interest</label>
                  <select value={form.package}
                    onChange={e => setForm(f => ({ ...f, package: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option>Standard</option>
                    <option>Featured</option>
                    <option>Bundle</option>
                    <option>Not sure yet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Roles you want to post</label>
                  <input type="text" value={form.roles}
                    onChange={e => setForm(f => ({ ...f, roles: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Software Engineer, Sales Manager" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Anything else?</label>
                  <textarea rows={3} value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Any specific requirements or questions..." />
                </div>
                <button type="submit" disabled={status === "sending"}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                  <Send size={14} />
                  {status === "sending" ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Direct email fallback */}
        <section className="border-t border-gray-100 pt-8 flex items-center gap-3">
          <Mail size={16} className="text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-500">
            Prefer email? Reach us directly at{" "}
            <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">
              hello@jobsworldwide.online
            </a>{" "}
            and we'll respond within 1 business day.
          </p>
        </section>
      </div>
    </>
  );
}
