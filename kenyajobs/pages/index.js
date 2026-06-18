import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
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
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live jobs from 30+ sources · Updated daily
          </div>
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
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <span className="text-slate-500 text-xs uppercase tracking-wide font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-sm text-slate-300 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1 rounded-full transition-all">
                {s}
              </button>
            ))}
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

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">Trusted sources powering this site</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["BrighterMonday", "LinkedIn", "Indeed", "Remotive", "Jobicy", "ReliefWeb", "The Muse", "Arbeitnow", "Himalayas", "Corporate Staffing", "MyJobMag", "Fuzu", "UNDP", "Devex"].map(s => (
              <span key={s} className="bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
