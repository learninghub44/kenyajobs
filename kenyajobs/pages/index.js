import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
import SourcesMarquee from "@/components/SourcesMarquee";
import { Search, Briefcase, Globe, ChevronRight, Wifi, GraduationCap, Home as HomeIcon, Rocket, RefreshCw, CheckCircle2, Building2 } from "lucide-react";

const CATEGORIES = [
  { label: "All Jobs", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Entry Level", value: "entry" },
  { label: "Graduate", value: "graduate" },
  { label: "Work From Home", value: "wfh" },
];

const STATS = [
  { value: "1,200+", label: "Active listings",           sub: "Refreshed every few hours",         icon: Briefcase },
  { value: "30+",    label: "Job board sources",         sub: "BrighterMonday, LinkedIn & more",   icon: Building2 },
  { value: "30+",    label: "Countries covered",         sub: "Africa, Europe, Americas & beyond", icon: Globe },
  { value: "Free",   label: "Always free to job-seekers",sub: "No account required to browse",     icon: CheckCircle2 },
];

const POPULAR_SEARCHES = ["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales", "Driver", "Customer Service", "Marketing"];

const HERO_SOURCES = [
  { name: "LinkedIn",          abbr: "in",   color: "#0A66C2" },
  { name: "Indeed",            abbr: "IN",   color: "#003A9B" },
  { name: "BrighterMonday",    abbr: "BM",   color: "#E8A000" },
  { name: "Remotive",          abbr: "RM",   color: "#6C3FC5" },
  { name: "Jobicy",            abbr: "JB",   color: "#FF5733" },
  { name: "ReliefWeb",         abbr: "RW",   color: "#0072BC" },
  { name: "The Muse",          abbr: "TM",   color: "#00B186" },
  { name: "Arbeitnow",         abbr: "AN",   color: "#4F46E5" },
  { name: "Himalayas",         abbr: "HM",   color: "#3B5BDB" },
  { name: "MyJobMag",          abbr: "MJ",   color: "#C0392B" },
  { name: "Fuzu",              abbr: "FZ",   color: "#F97316" },
  { name: "UNDP",              abbr: "UN",   color: "#009EDB" },
  { name: "Devex",             abbr: "DX",   color: "#2E86AB" },
  { name: "Corporate Staffing",abbr: "CS",   color: "#1B4332" },
  { name: "NGO Jobs",          abbr: "NG",   color: "#7B2FBE" },
  { name: "Ajira (Govt KE)",   abbr: "AJ",   color: "#006600" },
];


// Category cards with Unsplash photo URLs (fetched by the browser, no server needed)
const CAT_CARDS = [
  {
    title: "Remote Jobs",
    desc: "Work from anywhere — Kenya, home, or abroad. Curated remote-first roles from top global companies.",
    href: "/remote-jobs",
    icon: Wifi,
    accent: "#3b82f6",
    accentBg: "#eff6ff",
    photo: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80&auto=format&fit=crop",
    alt: "Person working on laptop remotely",
  },
  {
    title: "Entry Level",
    desc: "0–2 years experience welcome. Roles designed for people starting out and building their career.",
    href: "/entry-level",
    icon: Rocket,
    accent: "#10b981",
    accentBg: "#f0fdf4",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop",
    alt: "Young professional at work",
  },
  {
    title: "Graduate Jobs",
    desc: "Just finished university? These listings are built for fresh graduates entering the workforce.",
    href: "/graduate-jobs",
    icon: GraduationCap,
    accent: "#8b5cf6",
    accentBg: "#f5f3ff",
    photo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80&auto=format&fit=crop",
    alt: "University graduation",
  },
  {
    title: "Work From Home",
    desc: "Full-time WFH roles — skip the commute and work from the comfort of your own space.",
    href: "/work-from-home",
    icon: HomeIcon,
    accent: "#f59e0b",
    accentBg: "#fffbeb",
    photo: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80&auto=format&fit=crop",
    alt: "Home office setup",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "We scan 30+ job boards",
    desc: "Every few hours we pull fresh listings from BrighterMonday, LinkedIn, Indeed, Remotive, Jobicy and dozens more — all in one place.",
    photo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop",
    alt: "Data dashboard on screen",
  },
  {
    step: "02",
    title: "You search. We match.",
    desc: "Type any keyword — job title, company, or skill. Our live search scans all sources instantly and shows you the best matches.",
    photo: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80&auto=format&fit=crop",
    alt: "Person searching on laptop",
  },
  {
    step: "03",
    title: "Apply directly",
    desc: "Every listing links straight to the employer or original job board. No middleman. No account needed. Just click and apply.",
    photo: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80&auto=format&fit=crop",
    alt: "Person submitting application",
  },
];

function prioritizeLocal(items, sliceCount, keyword = "kenya") {
  const isLocal = (j) =>
    String(j.location || "").toLowerCase().includes(keyword) ||
    String(j.source || "").toLowerCase().includes(keyword);
  const local = items.filter(isLocal);
  const other = items.filter((j) => !isLocal(j));
  const localQuota = Math.min(local.length, Math.ceil(sliceCount / 2));
  return [...local.slice(0, localQuota), ...other.slice(0, sliceCount - localQuota)];
}

export default function Home() {
  const [baseJobs, setBaseJobs]       = useState([]);
  const [searchJobs, setSearchJobs]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searching, setSearching]     = useState(false);
  const [search, setSearch]           = useState("");
  const [activeTab, setActiveTab]     = useState("");
  const [sources, setSources]         = useState({ loaded: 0, total: 6 });
  const debounceRef                   = useRef(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mergeJobs = (prev, incoming, prioritize = false) => {
    const ids = new Set(prev.map(j => j.id));
    const fresh = incoming.filter(j => !ids.has(j.id));
    return (prioritize ? [...fresh, ...prev] : [...prev, ...fresh]).slice(0, 60);
  };

  const refreshJobs = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setBaseJobs([]);
    setSources({ loaded: 0, total: 6 });
    const fetchSource = async (url, sliceCount, label) => {
      try {
        const res = await fetch(url + "?bust=" + Date.now());
        if (!res.ok) return;
        const data = await res.json();
        const raw = Array.isArray(data) ? data : [];
        const items = label === "Africa" ? prioritizeLocal(raw, sliceCount) : raw.slice(0, sliceCount);
        if (items.length > 0) setBaseJobs(prev => mergeJobs(prev, items, label === "Africa"));
      } catch {}
      finally { setSources(prev => ({ ...prev, loaded: prev.loaded + 1 })); }
    };
    await Promise.allSettled([
      fetchSource("/api/africa-jobs", 20, "Africa"),
      fetchSource("/api/remote-jobs", 15),
      fetchSource("/api/entry-level-jobs", 8),
      fetchSource("/api/graduate-jobs", 8),
      fetchSource("/api/wfh-jobs", 8),
      fetchSource("/api/manual-jobs", 20),
    ]);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchSource = async (url, sliceCount, label) => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : [];
        const items = label === "Africa" ? prioritizeLocal(raw, sliceCount) : raw.slice(0, sliceCount);
        if (items.length > 0) {
          setBaseJobs(prev => mergeJobs(prev, items, label === "Africa"));
          setLoading(false);
        }
      } catch (e) {
        if (e.name !== "AbortError") console.warn(e.message);
      } finally {
        setSources(prev => ({ ...prev, loaded: prev.loaded + 1 }));
      }
    };
    fetchSource("/api/africa-jobs", 20, "Africa");
    fetchSource("/api/remote-jobs", 15, "Remote");
    fetchSource("/api/entry-level-jobs", 8, "Entry Level");
    fetchSource("/api/graduate-jobs", 8, "Graduate");
    fetchSource("/api/wfh-jobs", 8, "WFH");
    fetchSource("/api/manual-jobs", 20, "Manual");
    const t = setTimeout(() => setLoading(false), 7000);
    return () => { clearTimeout(t); controller.abort(); };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) { setSearchJobs([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-jobs?query=${encodeURIComponent(search.trim())}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchJobs(Array.isArray(data) ? data : []);
      } catch { setSearchJobs([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const jobPool = search.trim() ? searchJobs : baseJobs;
  const filtered = jobPool.filter(j => {
    const l   = String(j.location || "").toLowerCase();
    const tp  = String(j.type || "").toLowerCase();
    const src = String(j.source || "").toLowerCase();
    return !activeTab ||
      (activeTab === "remote" && (l.includes("remote") || tp.includes("remote"))) ||
      (activeTab === "entry"  && src.includes("entry")) ||
      (activeTab === "graduate" && src.includes("graduate")) ||
      (activeTab === "wfh" && (l.includes("home") || tp.includes("home")));
  });

  return (
    <>
      <Head>
        <title>JobsWorldwide — Find Jobs in Africa, Remote & Worldwide</title>
        <meta name="description" content="Find your dream job worldwide. Thousands of opportunities across Africa, Europe, Asia and beyond — remote, entry level, graduate and work from home." />
      </Head>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0b2233] min-h-[520px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80&auto=format&fit=crop"
            alt="African professionals in a modern office"
            fill priority
            className="object-cover opacity-25"
            style={{ objectPosition: "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b2233]/60 via-[#0b2233]/80 to-[#0b2233]" />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"40px 40px"}} />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-5">
            Real Jobs.<br />
            <span className="text-amber-400">No Sign-Up.</span> Updated Daily.
          </h1>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            We pull thousands of openings from BrighterMonday, LinkedIn, Indeed, Remotive and 26 more — so you spend less time searching and more time applying.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/15">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-7 py-3 rounded-xl transition-colors text-base whitespace-nowrap shadow-md">
              Find Jobs
            </button>
          </div>
          {/* Trending searches */}
          <div className="flex flex-wrap justify-center gap-2 items-center mb-10">
            <span className="text-slate-500 text-xs uppercase tracking-wide font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-sm text-slate-300 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>

          {/* Source logos marquee inside hero */}
          <div className="w-full overflow-hidden border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Pulling live jobs from</p>
            <div className="overflow-hidden w-full">
              <div className="marquee flex gap-3 w-max" style={{ animationDuration: "22s" }}>
                {[...HERO_SOURCES, ...HERO_SOURCES, ...HERO_SOURCES].map((src, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: src.color + "22", border: "1px solid " + src.color + "44" }}>
                    <span className="text-xs font-bold" style={{ color: src.color }}>{src.abbr}</span>
                    <span className="text-xs text-white/60 font-medium">{src.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, sub, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-0.5">{value}</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
              <div className="text-xs text-gray-400 leading-snug max-w-[140px]">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2 text-center">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Your shortcut to the right job</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, photo, alt }) => (
              <div key={step} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44 w-full">
                  <Image src={photo} alt={alt} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-4xl font-black text-white/30 leading-none">{step}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIRING BANNER ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm min-h-[160px] flex items-center">
          <Image
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80&auto=format&fit=crop"
            alt="Team collaboration"
            fill className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2233]/90 via-[#0b2233]/75 to-transparent" />
          <div className="relative px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full">
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">Hiring?</p>
              <h2 className="text-xl font-bold text-white mb-1">Post a job — reach thousands of active candidates</h2>
              <p className="text-slate-300 text-sm max-w-md">Africa, East Africa, and global remote audiences — direct placements, no recruiter fees.</p>
            </div>
            <a href="mailto:hello@jobsworldwide.online"
              className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-md">
              Get in touch →
            </a>
          </div>
        </div>
      </section>

      {/* ── JOBS SECTION ──────────────────────────────────────────────────── */}
      <section id="jobs-section" className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {search.trim() ? `Results for "${search}"` : "Latest Listings"}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
              {searching ? (
                <><span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" /> Searching live...</>
              ) : search.trim() ? (
                <>{filtered.length} results · <button onClick={() => setSearch("")} className="text-blue-600 hover:underline">Clear</button></>
              ) : baseJobs.length > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {filtered.length} live opportunities
                  </span>
                  {sources.loaded > 0 && <span className="text-gray-400">· from {sources.loaded} source{sources.loaded !== 1 ? "s" : ""}</span>}
                </>
              ) : "Loading opportunities..."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setActiveTab(cat.value)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    activeTab === cat.value ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <button onClick={refreshJobs} disabled={refreshing}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                refreshing ? "bg-blue-50 border-blue-200 text-blue-500 cursor-wait" : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}>
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Scanning..." : "Refresh"}
            </button>
          </div>
        </div>

        {lastUpdated && !refreshing && (
          <p className="text-xs text-gray-400 -mt-3 mb-4 flex items-center gap-1">
            <RefreshCw size={10} /> Last scanned: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {loading && baseJobs.length === 0 && !search.trim() && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        )}
        {searching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        )}
        {!searching && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((job, index) => (
              <div key={job.id || index}>
                <JobCard job={job} />
                {(index + 1) % 9 === 0 && (
                  <div className="col-span-full mt-5">
                    <AdSlot placement="homepage-grid" adSlot="0000000000" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!searching && !loading && filtered.length === 0 && search.trim() && (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 font-semibold text-lg">No results for &ldquo;{search}&rdquo;</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Try a different keyword or browse categories below</p>
            <button onClick={() => setSearch("")} className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">Browse all jobs</button>
          </div>
        )}
        {!searching && !loading && baseJobs.length === 0 && !search.trim() && (
          <div className="text-center py-20 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No jobs right now</p>
            <p className="text-sm mt-1">Sources update every 30 minutes — check back shortly.</p>
          </div>
        )}
      </section>

      {/* ── CATEGORY CARDS WITH PHOTOS ────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Browse by type</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Find the right fit for where you are</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAT_CARDS.map(({ title, desc, href, icon: Icon, accent, accentBg, photo, alt }) => (
              <Link key={href} href={href}
                className="group bg-white border border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
                {/* Photo */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={photo} alt={alt} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentBg }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                </div>
                {/* Text */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{desc}</p>
                  <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Browse listings <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ──────────────────────────────────────────────────── */}
      <section className="bg-[#0b2233] py-16 px-4 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left — copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Available on all devices
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Job hunt on the go.<br />
                <span className="text-amber-400">Add to your home screen.</span>
              </h2>
              <p className="text-slate-400 text-base mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                JobsWorldwide works as a full app on your phone — no download required.
                Browse thousands of live jobs, get instant search, and apply in seconds.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                {["No sign-up needed", "Works offline", "Instant search", "Free forever"].map(f => (
                  <span key={f} className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/8 border border-white/10 px-3 py-1.5 rounded-full">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" stroke="#34d399" />
                      <path d="M3.5 6l1.5 1.5 3-3" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </span>
                ))}
              </div>

              {/* Install buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {/* iOS — Add to Home Screen */}
                <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 rounded-xl px-5 py-3.5 transition-all cursor-pointer group"
                  onClick={() => alert("On iPhone: tap the Share button (□↑) in Safari, then tap \"Add to Home Screen\"")}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-white/60 text-[10px] leading-none mb-0.5">Download on</p>
                    <p className="text-white font-bold text-sm">iPhone / iPad</p>
                  </div>
                </div>

                {/* Android — Add to Home Screen */}
                <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 rounded-xl px-5 py-3.5 transition-all cursor-pointer group"
                  onClick={() => alert("On Android: tap the 3-dot menu in Chrome, then tap \"Add to Home screen\"")}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M17.523 0H6.477L2 4.477v15.046L6.477 24h11.046L22 19.523V4.477L17.523 0z" fill="#fff" fillOpacity=".1"/>
                    <path d="M7 8.5a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" fill="#34d399"/>
                    <path d="M5 9.5h14a7 7 0 01-14 0z" fill="#fff" fillOpacity=".2"/>
                    <path d="M3 8.5l-2 3m20-3l2 3M8 16.5l-1 3m10-3l1 3" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round"/>
                    <ellipse cx="12" cy="9.5" rx="7" ry="5" stroke="#4ade80" strokeWidth="1.2"/>
                    <path d="M8 4L12 1l4 3" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-white/60 text-[10px] leading-none mb-0.5">Get it on</p>
                    <p className="text-white font-bold text-sm">Android</p>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-xs mt-4">
                No app store needed · Works in your browser · Installable as a PWA
              </p>
            </div>

            {/* Right — phone mockup */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-56 h-auto mx-auto">
                {/* Phone frame */}
                <div className="bg-gray-900 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl shadow-blue-900/40 p-3 relative">
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
                  {/* Screen */}
                  <div className="bg-white rounded-[1.75rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-[#0b2233] px-4 pt-6 pb-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3.5" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/>
                          </svg>
                        </div>
                        <span className="text-white text-[8px] font-bold">JobsWorldwide</span>
                      </div>
                      <div className="bg-white/15 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <span className="text-white/60 text-[7px]">Search jobs...</span>
                      </div>
                    </div>
                    {/* Job cards */}
                    <div className="bg-gray-50 p-2 space-y-2">
                      {[
                        { title: "Product Designer", co: "Safaricom", loc: "Remote", color: "bg-purple-100 text-purple-700" },
                        { title: "Software Engineer", co: "Google", loc: "Nairobi", color: "bg-blue-100 text-blue-700" },
                        { title: "Marketing Manager", co: "Equity Bank", loc: "Hybrid", color: "bg-orange-100 text-orange-700" },
                      ].map((j, i) => (
                        <div key={i} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                              {j.co[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-semibold text-[8px] leading-tight truncate">{j.title}</p>
                              <p className="text-gray-400 text-[7px]">{j.co}</p>
                              <span className={`text-[6px] font-semibold px-1.5 py-0.5 rounded-full ${j.color} mt-0.5 inline-block`}>{j.loc}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-1">
                        <span className="text-blue-600 text-[7px] font-semibold">View 200+ more →</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-8 top-8 bg-white rounded-xl shadow-xl border border-gray-100 px-3 py-2 text-center">
                  <p className="text-green-500 font-extrabold text-sm">✓ Free</p>
                  <p className="text-gray-400 text-[9px]">No sign-up</p>
                </div>
                <div className="absolute -left-8 bottom-12 bg-amber-400 rounded-xl shadow-xl px-3 py-2 text-center">
                  <p className="text-gray-900 font-extrabold text-sm">New</p>
                  <p className="text-gray-800 text-[9px]">Jobs daily</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <SourcesMarquee />
    </>
  );
}
