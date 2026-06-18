import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
import { Search, MapPin, TrendingUp, Users, Briefcase, Globe, ChevronRight, Star, Wifi, GraduationCap, Home as HomeIcon, Rocket, RefreshCw, CheckCircle2, ArrowUpRight, Building2 } from "lucide-react";

const CATEGORIES = [
  { label: "All Jobs", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Entry Level", value: "entry" },
  { label: "Graduate", value: "graduate" },
  { label: "Work From Home", value: "wfh" },
];

const STATS = [
  { value: "1,200+", label: "Active listings", sub: "Refreshed every few hours", icon: Briefcase },
  { value: "15+", label: "Job board sources", sub: "Remotive, Jobicy, Adzuna & more", icon: Building2 },
  { value: "30+", label: "Countries covered", sub: "Africa, Europe, Americas & beyond", icon: Globe },
  { value: "Free", label: "Always free to job-seekers", sub: "No account required to browse", icon: CheckCircle2 },
];

const POPULAR_SEARCHES = ["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales", "Driver", "Customer Service", "Marketing"];

// /api/africa-jobs mixes ~30 global remote-job sources (which post very frequently) with
// Kenya-specific RSS feeds (which post much less often). Sorting everything by date and
// taking the top N — as the API itself does — means the high-volume global sources can
// flood out every Kenya listing before it ever reaches the homepage. Reserve half the
// slice for Kenya/local jobs specifically so they're never crowded out by source volume.
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
  const [baseJobs, setBaseJobs]       = useState([]);   // jobs loaded on mount
  const [searchJobs, setSearchJobs]   = useState([]);   // live search results
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
    // Africa/Kenya results are appended after every other source's fetch finishes (it
    // aggregates 13 sub-sources internally, so it's typically the slowest of the six
    // parallel calls). Appending as usual risks the 60-item cap already being full by
    // then. Prepending guarantees they survive the slice regardless of arrival order.
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

  // ── Load base jobs on mount ──────────────────────────────────────────────
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

  // ── Live search: debounced, calls /api/search-jobs ──────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      (function clearSearch() { setSearchJobs([]); setSearching(false); })();
      return;
    }

    (function startSearching() { setSearching(true); })();
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-jobs?query=${encodeURIComponent(search.trim())}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchJobs(Array.isArray(data) ? data : []);
      } catch {
        setSearchJobs([]);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce — fast but not hammering

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Use search results when query active, base jobs otherwise ────────────
  const jobPool = search.trim() ? searchJobs : baseJobs;

  const filtered = jobPool.filter(j => {
    const l   = String(j.location || "").toLowerCase();
    const tp  = String(j.type || "").toLowerCase();
    const src = String(j.source || "").toLowerCase();
    const matchTab = !activeTab ||
      (Array.isArray(j.categories) && j.categories.includes(activeTab)) ||
      (activeTab === "remote" && (l.includes("remote") || tp.includes("remote"))) ||
      (activeTab === "entry" && src.includes("entry")) ||
      (activeTab === "graduate" && src.includes("graduate")) ||
      (activeTab === "wfh" && (l.includes("home") || tp.includes("home")));
    return matchTab;
  });

  return (
    <>
      <Head>
        <title>JobsWorldwide — Find Dream Jobs in Europe, Asia, Americas, Oceania & More | Remote · Entry Level · Graduate</title>
        <meta name="description" content="Find your dream job worldwide. Thousands of opportunities across Europe, Asia, the Americas, Oceania, and beyond — remote, entry level, graduate and work from home." />
      </Head>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0b2233]">
        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src="/dream-job-signpost.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-20"
            style={{ objectPosition: "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b2233]/70 via-[#0b2233]/80 to-[#0b2233]" />
        </div>

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px"}} />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-18 text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Pulling live listings from 15+ job boards right now
          </div>

          {/* Heading — editorial, direct, specific to Kenya/Africa context */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-5">
            Real Jobs.<br />
            <span className="text-amber-400">No Sign-Up.</span> Updated Daily.
          </h1>

          <p className="text-slate-300 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            We aggregate thousands of openings from Remotive, BrighterMonday, Adzuna and a dozen more — so you get a real shortlist, not recycled listings.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/15">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-7 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-md">
              Find Jobs
            </button>
          </div>

          {/* Trending */}
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <span className="text-slate-500 text-xs uppercase tracking-wide font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-xs text-slate-300 hover:text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/20 px-3 py-1 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-gray-100">
          {STATS.map(({ value, label, sub, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Icon size={17} className="text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900 tabular mb-0.5">{value}</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
              <div className="text-[11px] text-gray-400 leading-snug max-w-[140px]">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-2xl overflow-hidden relative bg-[#0b2233] text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize:"28px 28px"}} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
                <Star size={10} className="fill-amber-400 text-amber-400" /> For Employers
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Reach qualified candidates across Africa & beyond</h2>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Post your role once and get it in front of thousands of active job seekers across Kenya, East Africa, and our global remote audience. Fast, direct, no middlemen.
            </p>
          </div>
          <a href="mailto:hello@jobsworldwide.online"
            className="relative flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-md">
            Post a Job →
          </a>
        </div>
      </section>

      {/* ─── JOBS SECTION ─── */}
      <section id="jobs-section" className="max-w-7xl mx-auto px-4 py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {search.trim() ? `Results for "${search}"` : "Latest Listings"}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
              {searching ? (
                <><span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" /> Searching live...</>
              ) : search.trim() ? (
                <>{filtered.length} results found · <button onClick={() => setSearch("")} className="text-blue-600 hover:underline">Clear</button></>
              ) : baseJobs.length > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {filtered.length} live opportunities
                  </span>
                  {sources.loaded > 0 && (
                    <span className="text-gray-400">· from {sources.loaded} source{sources.loaded !== 1 ? "s" : ""}</span>
                  )}
                </>
              ) : (
                "Loading opportunities..."
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.value}
                  onClick={() => setActiveTab(cat.value)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    activeTab === cat.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={refreshJobs}
              disabled={refreshing}
              title="Scan for new jobs"
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                refreshing
                  ? "bg-blue-50 border-blue-200 text-blue-500 cursor-wait"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Scanning..." : "Refresh Jobs"}
            </button>
          </div>
        </div>

        {/* Last updated */}
        {lastUpdated && !refreshing && (
          <p className="text-xs text-gray-400 -mt-3 mb-4 flex items-center gap-1">
            <RefreshCw size={10} /> Last scanned: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Job grid */}
        {(loading && baseJobs.length === 0 && !search.trim()) && (
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

      {/* ─── CATEGORY CARDS ─── */}
      <section className="bg-gray-50 border-t border-gray-100 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1.5">Browse by type</p>
              <h2 className="text-2xl font-bold text-gray-900">Find the right fit for where you are</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Remote Jobs",
                desc: "Work from anywhere — Kenya, home, or abroad. Curated remote-first roles from top global companies.",
                href: "/remote-jobs",
                icon: Wifi,
                accent: "#3b82f6",
                accentBg: "#eff6ff",
              },
              {
                title: "Entry Level",
                desc: "0–2 years experience welcome. Roles designed for people starting out and building their career.",
                href: "/entry-level",
                icon: Rocket,
                accent: "#10b981",
                accentBg: "#f0fdf4",
              },
              {
                title: "Graduate Jobs",
                desc: "Just finished university? These listings are built for fresh graduates entering the workforce.",
                href: "/graduate-jobs",
                icon: GraduationCap,
                accent: "#8b5cf6",
                accentBg: "#f5f3ff",
              },
              {
                title: "Work From Home",
                desc: "Full-time WFH roles — skip the commute and work from the comfort of your own space.",
                href: "/work-from-home",
                icon: HomeIcon,
                accent: "#f59e0b",
                accentBg: "#fffbeb",
              },
            ].map(({ title, desc, href, icon: Icon, accent, accentBg }) => (
              <Link key={href} href={href}
                className="group bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                  style={{ backgroundColor: accentBg }}
                >
                  <Icon size={19} style={{ color: accent }} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{desc}</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  Browse listings <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
