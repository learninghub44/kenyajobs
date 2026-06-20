import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Code2, Copy, Check, Terminal, Zap, Globe, ShieldCheck, Mail } from "lucide-react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/africa-jobs",
    desc: "Jobs aggregated from Kenyan, East African, and pan-African sources (BrighterMonday, MyJobMag, ReliefWeb, and more).",
  },
  {
    method: "GET",
    path: "/api/remote-jobs",
    desc: "Remote jobs from Remotive, Jobicy, and Arbeitnow. Accepts an optional ?category= param.",
  },
  {
    method: "GET",
    path: "/api/entry-level-jobs",
    desc: "Entry-level roles sourced from The Muse and Remotive. Accepts an optional ?page= param.",
  },
  {
    method: "GET",
    path: "/api/graduate-jobs",
    desc: "Graduate-programme and junior listings aggregated across multiple boards.",
  },
  {
    method: "GET",
    path: "/api/internship-jobs",
    desc: "Internship listings aggregated across multiple boards.",
  },
  {
    method: "GET",
    path: "/api/wfh-jobs",
    desc: "Work-from-home listings aggregated across multiple boards.",
  },
  {
    method: "GET",
    path: "/api/search-jobs?query=",
    desc: "Free-text search across The Muse, Remotive, and Jobicy. Requires a non-empty ?query= param.",
  },
];

const SAMPLE_JOB = `{
  "id": "remotive-123456",
  "title": "Senior Backend Engineer",
  "company": "Acme Inc.",
  "location": "Remote — Worldwide",
  "type": "Full-time",
  "date": "2026-06-18T09:00:00.000Z",
  "url": "https://remotive.com/remote-jobs/...",
  "description": "We're looking for a backend engineer to join our small, distributed team...",
  "source": "Remotive"
}`;

function CodeBlock({ children, lang = "bash" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative bg-[#0b1320] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs text-slate-500 font-mono">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-sm text-slate-200 font-mono leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export default function Developers() {
  return (
    <>
      <Head>
        <title>Developer API | JobsWorldwide</title>
        <meta
          name="description"
          content="Free public JSON API for pulling live job listings from JobsWorldwide — remote, Africa, entry-level, graduate, internship, and search endpoints."
        />
      </Head>

      {/* Header */}
      <div className="bg-[#0b2233] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-slate-300 mb-4">
            <Code2 size={13} />
            Developer API
          </div>
          <h1 className="text-4xl font-bold mb-3">Build with our job data</h1>
          <p className="text-base text-slate-400 max-w-xl">
            JobsWorldwide exposes the same JSON endpoints our own frontend uses.
            Pull live listings into your own app, bot, or dashboard — free, no
            API key required.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Quick facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-2xl p-5">
            <Zap size={18} className="text-blue-500 mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">No auth needed</h3>
            <p className="text-xs text-gray-500">Public GET endpoints, no API key or signup.</p>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <Globe size={18} className="text-blue-500 mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">JSON responses</h3>
            <p className="text-xs text-gray-500">Plain array of job objects, ready to map over.</p>
          </div>
          <div className="border border-gray-200 rounded-2xl p-5">
            <ShieldCheck size={18} className="text-blue-500 mb-2" />
            <h3 className="font-bold text-gray-900 text-sm mb-1">Cached & rate-friendly</h3>
            <p className="text-xs text-gray-500">Responses are cached server-side, so be reasonable with polling frequency.</p>
          </div>
        </div>

        {/* Quickstart */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Terminal size={16} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Quickstart</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Every endpoint returns a JSON array of job objects. No headers or auth required —
            just make a GET request.
          </p>
          <CodeBlock>{`curl https://jobsworldwide.online/api/remote-jobs`}</CodeBlock>
        </section>

        {/* Endpoints */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Endpoints</h2>
          </div>
          <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    {e.method}
                  </span>
                  <code className="text-sm font-mono text-gray-900">{e.path}</code>
                </div>
                <p className="text-sm text-gray-500 sm:ml-auto sm:max-w-md sm:text-right">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Response shape */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Response shape</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Every job object follows the same shape regardless of endpoint or source:
          </p>
          <CodeBlock lang="json">{SAMPLE_JOB}</CodeBlock>
        </section>

        {/* Example usage */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Example — JavaScript</h2>
          </div>
          <CodeBlock lang="javascript">{`const res = await fetch("https://jobsworldwide.online/api/search-jobs?query=developer");
const jobs = await res.json();

jobs.forEach(job => {
  console.log(\`\${job.title} at \${job.company} — \${job.location}\`);
});`}</CodeBlock>
        </section>

        {/* Rate limits / fair use */}
        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Fair use</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            These endpoints power our own production site, so please cache results on
            your end and avoid polling more than once every few minutes. We reserve the
            right to rate-limit or block abusive traffic. For high-volume or commercial
            use, reach out — we're happy to talk.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <Mail size={28} className="mx-auto text-blue-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Questions or feedback?</h2>
          <p className="text-gray-500 text-sm mb-5">
            Building something interesting with the API? We'd love to hear about it.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Contact Us
          </Link>
        </section>

      </div>
    </>
  );
}
