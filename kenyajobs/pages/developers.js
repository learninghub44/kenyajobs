import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Code2, Copy, Check, Terminal, Zap, Globe, ShieldCheck, Mail,
  Play, ChevronRight, Hash, BookOpen, AlertTriangle,
} from "lucide-react";

const ENDPOINTS = [
  {
    id: "africa-jobs",
    method: "GET",
    path: "/api/africa-jobs",
    desc: "Jobs aggregated from Kenyan, East African, and pan-African sources — BrighterMonday, MyJobMag, ReliefWeb, and more.",
    params: [],
  },
  {
    id: "remote-jobs",
    method: "GET",
    path: "/api/remote-jobs",
    desc: "Remote jobs from Remotive, Jobicy, and Arbeitnow.",
    params: [{ name: "category", required: false, desc: "Filter by Remotive category slug, e.g. software-dev" }],
  },
  {
    id: "entry-level-jobs",
    method: "GET",
    path: "/api/entry-level-jobs",
    desc: "Entry-level roles sourced from The Muse and Remotive.",
    params: [{ name: "page", required: false, desc: "Page number, defaults to 1" }],
  },
  {
    id: "graduate-jobs",
    method: "GET",
    path: "/api/graduate-jobs",
    desc: "Graduate-programme and junior listings aggregated across multiple boards.",
    params: [],
  },
  {
    id: "internship-jobs",
    method: "GET",
    path: "/api/internship-jobs",
    desc: "Internship listings aggregated across multiple boards.",
    params: [],
  },
  {
    id: "wfh-jobs",
    method: "GET",
    path: "/api/wfh-jobs",
    desc: "Work-from-home listings aggregated across multiple boards.",
    params: [],
  },
  {
    id: "search-jobs",
    method: "GET",
    path: "/api/search-jobs",
    desc: "Free-text search across The Muse, Remotive, and Jobicy.",
    params: [{ name: "query", required: true, desc: "Search term — job title, company, or keyword" }],
  },
];

const SAMPLE_JOB = `[
  {
    "id": "remotive-123456",
    "title": "Senior Backend Engineer",
    "company": "Acme Inc.",
    "location": "Remote — Worldwide",
    "type": "Full-time",
    "date": "2026-06-18T09:00:00.000Z",
    "url": "https://remotive.com/remote-jobs/...",
    "description": "We're looking for a backend engineer to join our small, distributed team...",
    "source": "Remotive"
  }
]`;

const FIELDS = [
  ["id", "string", "Stable unique identifier, namespaced by source."],
  ["title", "string", "Job title as posted."],
  ["company", "string", "Hiring company or organisation name."],
  ["location", "string", "Free-text location, e.g. \"Nairobi, Kenya\" or \"Remote\"."],
  ["type", "string", "Employment type, e.g. \"Full-time\", \"Remote\", \"Internship\"."],
  ["date", "string", "ISO 8601 publish date."],
  ["url", "string", "Direct link to the original listing — always send applicants here."],
  ["description", "string", "Plain-text job description, HTML stripped."],
  ["source", "string", "Originating board, e.g. \"Remotive\", \"BrighterMonday\"."],
];

function codeSamples(path) {
  const full = `https://jobsworldwide.online${path}`;
  return {
    curl: `curl "${full}"`,
    javascript: `const res = await fetch("${full}");
const jobs = await res.json();

jobs.forEach(job => {
  console.log(\`\${job.title} at \${job.company}\`);
});`,
    python: `import requests

res = requests.get("${full}")
jobs = res.json()

for job in jobs:
    print(f"{job['title']} at {job['company']}")`,
  };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, lang = "bash" }) {
  return (
    <div className="relative bg-[#0b1320] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs text-slate-500 font-mono">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-[13px] text-slate-200 font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function LangTabs({ path }) {
  const samples = codeSamples(path);
  const langs = [
    ["curl", "cURL"],
    ["javascript", "JavaScript"],
    ["python", "Python"],
  ];
  const [active, setActive] = useState("curl");
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {langs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              active === key
                ? "bg-[#0b2233] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <CodeBlock code={samples[active]} lang={active === "curl" ? "bash" : active} />
    </div>
  );
}

function TryIt({ endpoint }) {
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    setStatus(null);
    const qs = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `${endpoint.path}${qs ? `?${qs}` : ""}`;
    try {
      const res = await fetchWithTimeout(url);
      setStatus(res.status);
      const data = await res.json();
      setResult(JSON.stringify(Array.isArray(data) ? data.slice(0, 3) : data, null, 2));
    } catch (e) {
      setStatus("error");
      setResult(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // simple fetch helper (no external import needed client-side)
  function fetchWithTimeout(url, ms = 12000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(t));
  }

  const requiredMissing = endpoint.params.some((p) => p.required && !params[p.name]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Play size={14} className="text-emerald-600" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Try it live</span>
      </div>

      <div className="p-4 space-y-3">
        {endpoint.params.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {endpoint.params.map((p) => (
              <div key={p.name}>
                <label className="block text-xs font-mono text-gray-500 mb-1">
                  {p.name}
                  {p.required && <span className="text-rose-500"> *</span>}
                </label>
                <input
                  type="text"
                  placeholder={p.desc}
                  value={params[p.name] || ""}
                  onChange={(e) => setParams((s) => ({ ...s, [p.name]: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={run}
          disabled={loading || requiredMissing}
          className="inline-flex items-center gap-2 bg-[#0b2233] hover:bg-[#15324a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Play size={14} />
          {loading ? "Running…" : "Send request"}
        </button>

        {status !== null && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  status === 200
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}
              >
                {status === "error" ? "ERR" : status}
              </span>
              <span className="text-xs text-gray-400">first 3 results shown</span>
            </div>
            <pre className="bg-[#0b1320] text-slate-200 text-[12px] font-mono rounded-lg p-3 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Developers() {
  const [activeSection, setActiveSection] = useState(ENDPOINTS[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

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
        <div className="max-w-6xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs font-mono font-medium tracking-wide text-slate-300 mb-4">
            <Code2 size={13} />
            DEVELOPER API
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight">
            Build with our job data
          </h1>
          <p className="text-base text-slate-400 max-w-xl leading-relaxed">
            JobsWorldwide exposes the same JSON endpoints our own frontend uses.
            Pull live listings into your own app, bot, or dashboard — free, no
            API key required.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#quickstart"
              className="inline-flex items-center gap-2 bg-white text-[#0b2233] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-colors"
            >
              <Terminal size={15} />
              Quickstart
            </a>
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/15 transition-colors"
            >
              <Hash size={15} />
              Browse endpoints
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">

        {/* Sticky sidebar nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">On this page</p>
              <nav className="space-y-1 text-sm">
                <a href="#quickstart" className="block text-gray-500 hover:text-gray-900 py-1">Quickstart</a>
                <a href="#response-shape" className="block text-gray-500 hover:text-gray-900 py-1">Response shape</a>
                <a href="#endpoints" className="block text-gray-500 hover:text-gray-900 py-1 font-semibold text-gray-900">Endpoints</a>
                <div className="pl-3 border-l border-gray-200 space-y-1 mt-1">
                  {ENDPOINTS.map((e) => (
                    <a
                      key={e.id}
                      href={`#${e.id}`}
                      className={`flex items-center gap-1.5 py-0.5 text-xs font-mono transition-colors ${
                        activeSection === e.id ? "text-blue-600 font-semibold" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <ChevronRight size={11} />
                      {e.path.replace("/api/", "")}
                    </a>
                  ))}
                </div>
                <a href="#fair-use" className="block text-gray-500 hover:text-gray-900 py-1 mt-1">Fair use</a>
              </nav>
            </div>
          </div>
        </aside>

        <div className="space-y-14 min-w-0">

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
              <p className="text-xs text-gray-500">Responses are cached server-side — keep polling reasonable.</p>
            </div>
          </div>

          {/* Quickstart */}
          <section id="quickstart" ref={(el) => (sectionRefs.current["quickstart"] = el)}>
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={16} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Quickstart</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Every endpoint returns a JSON array of job objects. No headers or auth required —
              just make a GET request to any URL below.
            </p>
            <CodeBlock code={`curl https://jobsworldwide.online/api/remote-jobs`} />
          </section>

          {/* Response shape */}
          <section id="response-shape" ref={(el) => (sectionRefs.current["response-shape"] = el)}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Response shape</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Every job object follows the same shape regardless of endpoint or source:
            </p>
            <CodeBlock code={SAMPLE_JOB} lang="json" />

            <div className="border border-gray-200 rounded-2xl overflow-hidden mt-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-gray-500">Field</th>
                    <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-gray-500">Type</th>
                    <th className="text-left px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-gray-500">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map(([field, type, desc], i) => (
                    <tr key={field} className={i !== FIELDS.length - 1 ? "border-b border-gray-100" : ""}>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{field}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{type}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Endpoints */}
          <section id="endpoints" ref={(el) => (sectionRefs.current["endpoints"] = el)}>
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={16} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Endpoints</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Each endpoint below includes sample code in three languages, plus a live
              tester you can run right from this page.
            </p>

            <div className="space-y-10">
              {ENDPOINTS.map((e) => (
                <div
                  key={e.id}
                  id={e.id}
                  ref={(el) => (sectionRefs.current[e.id] = el)}
                  className="scroll-mt-6"
                >
                  <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 font-mono">
                        {e.method}
                      </span>
                      <code className="text-sm font-mono text-gray-900 font-semibold">{e.path}</code>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{e.desc}</p>

                    {e.params.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {e.params.map((p) => (
                          <span
                            key={p.name}
                            className="text-xs font-mono bg-gray-50 border border-gray-200 text-gray-600 rounded-full px-2.5 py-1"
                          >
                            ?{p.name}
                            {p.required && <span className="text-rose-500">*</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    <LangTabs path={e.params.find((p) => p.required) ? `${e.path}?${e.params.find((p) => p.required).name}=developer` : e.path} />

                    <TryIt endpoint={e} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fair use */}
          <section id="fair-use" ref={(el) => (sectionRefs.current["fair-use"] = el)} className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h2 className="text-base font-bold text-gray-900">Fair use</h2>
            </div>
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
      </div>
    </>
  );
}
