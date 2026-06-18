import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
import { Search, MapPin, TrendingUp, Users, Briefcase, Globe, ChevronRight, Star, Wifi, GraduationCap, Home as HomeIcon, Rocket, RefreshCw } from "lucide-react";

const CATEGORIES = [
  { label: "All Jobs", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Entry Level", value: "entry" },
  { label: "Graduate", value: "graduate" },
  { label: "Work From Home", value: "wfh" },
];

const STATS = [
  { value: "100+", label: "Active Jobs", icon: Briefcase },
  { value: "50+", label: "Companies", icon: Users },
  { value: "30+", label: "Countries", icon: Globe },
  { value: "Daily", label: "New Listings", icon: TrendingUp },
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
      <section className="relative overflow-hidden bg-[#1a6fba]">
        {/* Background photo — sky blue image, overlay matches it */}
        <div className="absolute inset-0">
          <Image
            src="/dream-job-signpost.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-55"
            style={{ objectPosition: "center 30%" }}
          />
          {/* Sky-toned gradient: top stays airy, bottom fades to deep blue */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/30 via-blue-700/65 to-blue-900/92" />
        </div>
        {/* Subtle glow matching the sky tone */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-sky-300 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400 opacity-10 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">

          {/* Continent pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["Europe", "Asia", "North America", "South America", "Oceania", "Middle East"].map(c => (
              <span key={c} className="text-xs font-medium text-white/90 bg-white/15 border border-white/25 px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight text-white mb-6 drop-shadow-lg">
            Find Your<br />
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Dream Job</span>
          </h1>

          <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
            Thousands of live opportunities from top employers across every continent — updated daily.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/15 border border-white/25 text-white placeholder-blue-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            <button
              onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-4 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg shadow-blue-900/30">
              Search Jobs
            </button>
          </div>

          {/* Trending searches */}
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <span className="text-blue-200 text-sm">Trending:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 px-3 py-1 rounded-full transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-r from-indigo-900 to-blue-800 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px"}} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="text-blue-200 text-sm font-medium">Featured Opportunity</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Are You Hiring?</h2>
            <p className="text-blue-200 text-sm max-w-md">Reach thousands of qualified candidates across Europe, Asia, the Americas, Oceania and beyond. Post your job and get applications fast.</p>
          </div>
          <a href="mailto:hello@jobsworldwide.online"
            className="relative flex-shrink-0 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
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
              {search.trim() ? `Results for "${search}"` : "Latest Jobs"}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
              {searching ? (
                <><span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" /> Searching live...</>
              ) : search.trim() ? (
                <>{filtered.length} results found · <button onClick={() => setSearch("")} className="text-blue-600 hover:underline">Clear</button></>
              ) : baseJobs.length > 0 ? (
                `${filtered.length} opportunities available`
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-500 text-sm mb-8">Find the right opportunity for your stage of career</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Remote Jobs", desc: "Work from anywhere in the world", href: "/remote-jobs", color: "from-blue-500 to-blue-600", icon: Wifi },
              { title: "Entry Level", desc: "Start your career journey today", href: "/entry-level", color: "from-green-500 to-emerald-600", icon: Rocket },
              { title: "Graduate Jobs", desc: "Opportunities for fresh graduates", href: "/graduate-jobs", color: "from-purple-500 to-violet-600", icon: GraduationCap },
              { title: "Work From Home", desc: "Skip the commute, work remotely", href: "/work-from-home", color: "from-orange-500 to-amber-600", icon: HomeIcon },
            ].map(({ title, desc, href, color, icon: Icon }) => (
              <Link key={href} href={href}
                className={`group bg-gradient-to-br ${color} text-white rounded-2xl p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5`}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-white/80 text-sm mb-4">{desc}</p>
                <span className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                  Browse jobs <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
