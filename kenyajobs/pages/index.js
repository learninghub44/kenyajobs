import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import AdSlot from "@/components/AdSlot";
import SourcesMarquee from "@/components/SourcesMarquee";
import { Search, Briefcase, Globe, ChevronRight, Wifi, GraduationCap, Home as HomeIcon, Rocket, RefreshCw, CheckCircle2, Building2, BookOpen } from "lucide-react";

const CATEGORIES = [
  { label: "All Jobs", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Entry Level", value: "entry" },
  { label: "Graduate", value: "graduate" },
  { label: "Work From Home", value: "wfh" },
];

const STATS = [
  { value: "1,200+", label: "Active listings", sub: "Refreshed every few hours", icon: Briefcase },
  { value: "30+", label: "Job board sources", sub: "BrighterMonday, LinkedIn & more", icon: Building2 },
  { value: "30+", label: "Countries covered", sub: "Africa, Europe, Americas & beyond", icon: Globe },
  { value: "Free", label: "Always free to browse", sub: "No account required", icon: CheckCircle2 },
];

const POPULAR_SEARCHES = ["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales", "Driver", "Customer Service", "Marketing"];

const HERO_SOURCES = [
  { name: "LinkedIn", abbr: "in", color: "#0A66C2" },
  { name: "Indeed", abbr: "IN", color: "#003A9B" },
  { name: "BrighterMonday", abbr: "BM", color: "#E8A000" },
  { name: "Remotive", abbr: "RM", color: "#6C3FC5" },
  { name: "Jobicy", abbr: "JB", color: "#FF5733" },
  { name: "ReliefWeb", abbr: "RW", color: "#0072BC" },
  { name: "The Muse", abbr: "TM", color: "#00B186" },
  { name: "Arbeitnow", abbr: "AN", color: "#4F46E5" },
  { name: "Himalayas", abbr: "HM", color: "#3B5BDB" },
  { name: "MyJobMag", abbr: "MJ", color: "#C0392B" },
  { name: "Fuzu", abbr: "FZ", color: "#F97316" },
  { name: "UNDP", abbr: "UN", color: "#009EDB" },
  { name: "Devex", abbr: "DX", color: "#2E86AB" },
  { name: "Corporate Staffing", abbr: "CS", color: "#1B4332" },
  { name: "NGO Jobs", abbr: "NG", color: "#7B2FBE" },
  { name: "Ajira (Govt KE)", abbr: "AJ", color: "#006600" },
];

const CAT_CARDS = [
  {
    title: "Remote Jobs",
    desc: "Work from anywhere — Kenya, home, or abroad. Curated remote-first roles from top global companies.",
    href: "/remote-jobs",
    icon: Wifi,
    accent: "#1A73E8",
    accentBg: "#E8F0FE",
    photo: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80&auto=format&fit=crop",
    alt: "Person working on laptop remotely",
  },
  {
    title: "Entry Level",
    desc: "0-2 years experience welcome. Roles designed for people starting out and building their career.",
    href: "/entry-level",
    icon: Rocket,
    accent: "#1E8E3E",
    accentBg: "#E6F4EA",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop",
    alt: "Young professional at work",
  },
  {
    title: "Graduate Jobs",
    desc: "Just finished university? These listings are built for fresh graduates entering the workforce.",
    href: "/graduate-jobs",
    icon: GraduationCap,
    accent: "#9334E6",
    accentBg: "#F3E8FD",
    photo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80&auto=format&fit=crop",
    alt: "University graduation",
  },
  {
    title: "Work From Home",
    desc: "Full-time WFH roles — skip the commute and work from the comfort of your own space.",
    href: "/work-from-home",
    icon: HomeIcon,
    accent: "#E8710A",
    accentBg: "#FEF7E0",
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
        const res = await fetch(url);
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
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <span className="kicker mb-4 inline-block">JobsWorldwide</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mb-5 leading-[1.1]">
            Real jobs.<br />
            <span className="text-primary">No sign-up.</span> Updated daily.
          </h1>
          <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            We pull thousands of openings from BrighterMonday, LinkedIn, Indeed, Remotive and 26 more — so you spend less time searching and more time applying.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto mb-6 bg-surface rounded-full p-1.5 border border-border">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-border"
              />
            </div>
            <button
              onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-7 py-3 rounded-full transition-colors text-sm whitespace-nowrap">
              Find Jobs
            </button>
          </div>

          {/* Trending searches */}
          <div className="flex flex-wrap justify-center gap-2 items-center mb-10">
            <span className="text-text-tertiary text-xs uppercase tracking-wide font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-xs text-text-secondary hover:text-primary bg-surface hover:bg-primary-light border border-border px-3 py-1.5 rounded-full transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Source logos marquee */}
          <div className="w-full overflow-hidden border-t border-border pt-6">
            <p className="text-xs text-text-tertiary uppercase tracking-widest mb-4">Pulling live jobs from</p>
            <div className="overflow-hidden w-full">
              <div className="marquee flex gap-3 w-max" style={{ animationDuration: "22s" }}>
                {[...HERO_SOURCES, ...HERO_SOURCES, ...HERO_SOURCES].map((src, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0 bg-surface border border-border">
                    <span className="text-xs font-semibold" style={{ color: src.color }}>{src.abbr}</span>
                    <span className="text-xs text-text-secondary font-medium">{src.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, sub, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center px-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mb-3">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="text-2xl font-bold text-text-primary mb-0.5 tabular">{value}</div>
              <div className="text-sm font-medium text-text-primary mb-1">{label}</div>
              <div className="text-xs text-text-tertiary leading-snug max-w-[140px]">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="kicker mb-2 text-center">How it works</p>
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Your shortcut to the right job</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, photo, alt }) => (
              <div key={step} className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow">
                <div className="relative h-44 w-full">
                  <Image src={photo} alt={alt} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-4xl font-bold text-white/40 leading-none tabular">{step}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-text-primary text-base mb-2">{title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIRING BANNER ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="relative rounded-2xl overflow-hidden border border-border min-h-[160px] flex items-center bg-surface">
          <Image
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80&auto=format&fit=crop"
            alt="Team collaboration"
            fill className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
          <div className="relative px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full">
            <div>
              <p className="kicker mb-1">Hiring?</p>
              <h2 className="text-xl font-bold text-text-primary mb-1">Post a job — reach thousands of active candidates</h2>
              <p className="text-text-secondary text-sm max-w-md">Africa, East Africa, and global remote audiences — direct placements, no recruiter fees.</p>
            </div>
            <a href="mailto:hello@jobsworldwide.online"
              className="flex-shrink-0 bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-full transition-colors text-sm whitespace-nowrap">
              Get in touch
            </a>
          </div>
        </div>
      </section>

      {/* ── JOBS SECTION ──────────────────────────────────────────────────── */}
      <section id="jobs-section" className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {search.trim() ? `Results for "${search}"` : "Latest Listings"}
            </h2>
            <p className="text-text-secondary text-sm mt-0.5 flex items-center gap-2">
              {searching ? (
                <><span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" /> Searching live...</>
              ) : search.trim() ? (
                <>{filtered.length} results · <button onClick={() => setSearch("")} className="text-primary hover:underline">Clear</button></>
              ) : baseJobs.length > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {filtered.length} live opportunities
                  </span>
                  {sources.loaded > 0 && <span className="text-text-tertiary">· from {sources.loaded} source{sources.loaded !== 1 ? "s" : ""}</span>}
                </>
              ) : "Loading opportunities..."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setActiveTab(cat.value)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    activeTab === cat.value ? "bg-primary text-white" : "bg-surface text-text-secondary hover:bg-surface-muted border border-border"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <button onClick={refreshJobs} disabled={refreshing}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                refreshing ? "bg-primary-light border-primary/20 text-primary cursor-wait" : "bg-white border-border text-text-secondary hover:border-primary hover:text-primary"
              }`}>
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Scanning..." : "Refresh"}
            </button>
          </div>
        </div>

        {lastUpdated && !refreshing && (
          <p className="text-xs text-text-tertiary -mt-3 mb-4 flex items-center gap-1">
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
            <Search size={40} className="mx-auto text-text-tertiary mb-4" />
            <p className="text-text-primary font-semibold text-lg">No results for &ldquo;{search}&rdquo;</p>
            <p className="text-text-secondary text-sm mt-1 mb-4">Try a different keyword or browse categories below</p>
            <button onClick={() => setSearch("")} className="bg-primary text-white text-sm px-5 py-2.5 rounded-full hover:bg-primary-hover transition-colors">Browse all jobs</button>
          </div>
        )}
        {!searching && !loading && baseJobs.length === 0 && !search.trim() && (
          <div className="text-center py-20">
            <Briefcase size={40} className="mx-auto mb-4 text-text-tertiary" />
            <p className="font-medium text-text-primary">No jobs right now</p>
            <p className="text-sm mt-1 text-text-secondary">Sources update every 30 minutes — check back shortly.</p>
          </div>
        )}
      </section>

      {/* ── CATEGORY CARDS ────────────────────────────────────────────────── */}
      <section className="bg-surface border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="kicker mb-2">Browse by type</p>
          <h2 className="text-3xl font-bold text-text-primary mb-10">Find the right fit for where you are</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAT_CARDS.map(({ title, desc, href, icon: Icon, accent, accentBg, photo, alt }) => (
              <Link key={href} href={href}
                className="group bg-white border border-border hover:border-primary/30 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
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
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-text-primary text-base mb-2 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-1">{desc}</p>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Browse listings <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PWA SECTION ───────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-border py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="kicker mb-4 inline-block">Works everywhere</span>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
                Job hunt on the go.<br />
                <span className="text-primary">Add to your home screen.</span>
              </h2>
              <p className="text-text-secondary text-base mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                JobsWorldwide works as a full app on your phone — no download required.
                Browse thousands of live jobs, get instant search, and apply in seconds.
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                {["No sign-up needed", "Works offline", "Instant search", "Free forever"].map(f => (
                  <span key={f} className="flex items-center gap-1.5 text-sm text-text-secondary bg-surface border border-border px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={14} className="text-success" />
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-3 bg-surface hover:bg-surface-muted border border-border rounded-xl px-5 py-3.5 transition-colors cursor-pointer"
                  onClick={() => alert("On iPhone: tap the Share button in Safari, then tap 'Add to Home Screen'")}>
                  <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">iOS</span>
                  </div>
                  <div className="text-left">
                    <p className="text-text-tertiary text-[10px] leading-none mb-0.5">Download on</p>
                    <p className="text-text-primary font-semibold text-sm">iPhone / iPad</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface hover:bg-surface-muted border border-border rounded-xl px-5 py-3.5 transition-colors cursor-pointer"
                  onClick={() => alert("On Android: tap the 3-dot menu in Chrome, then tap 'Add to Home screen'")}>
                  <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="text-left">
                    <p className="text-text-tertiary text-[10px] leading-none mb-0.5">Get it on</p>
                    <p className="text-text-primary font-semibold text-sm">Android</p>
                  </div>
                </div>
              </div>

              <p className="text-text-tertiary text-xs mt-4">
                No app store needed · Works in your browser · Installable as a PWA
              </p>
            </div>

            {/* Phone mockup */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-56 h-auto mx-auto">
                <div className="bg-text-primary rounded-[2.5rem] border-4 border-[#3C4043] shadow-lg p-3 relative">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-text-primary rounded-full z-10" />
                  <div className="bg-white rounded-[1.75rem] overflow-hidden">
                    <div className="bg-white px-4 pt-6 pb-4 border-b border-border">
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">JW</span>
                        </div>
                        <span className="text-text-primary text-[8px] font-bold">JobsWorldwide</span>
                      </div>
                      <div className="bg-surface rounded-full px-2 py-1.5 flex items-center gap-1.5 border border-border">
                        <Search size={8} className="text-text-tertiary" />
                        <span className="text-text-tertiary text-[7px]">Search jobs...</span>
                      </div>
                    </div>
                    <div className="bg-surface p-2 space-y-2">
                      {[
                        { title: "Product Designer", co: "Safaricom", loc: "Remote", color: "bg-primary-light text-primary" },
                        { title: "Software Engineer", co: "Google", loc: "Nairobi", color: "bg-success-light text-success" },
                        { title: "Marketing Manager", co: "Equity Bank", loc: "Hybrid", color: "bg-warning-light text-[#E8710A]" },
                      ].map((j, i) => (
                        <div key={i} className="bg-white rounded-xl p-2.5 border border-border">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                              {j.co[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-text-primary font-semibold text-[8px] leading-tight truncate">{j.title}</p>
                              <p className="text-text-tertiary text-[7px]">{j.co}</p>
                              <span className={`text-[6px] font-semibold px-1.5 py-0.5 rounded-full ${j.color} mt-0.5 inline-block`}>{j.loc}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-1">
                        <span className="text-primary text-[7px] font-semibold">View 200+ more</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 top-8 bg-white rounded-xl shadow-md border border-border px-3 py-2 text-center">
                  <p className="text-success font-bold text-sm">Free</p>
                  <p className="text-text-tertiary text-[9px]">No sign-up</p>
                </div>
                <div className="absolute -left-8 bottom-12 bg-primary rounded-xl shadow-md px-3 py-2 text-center">
                  <p className="text-white font-bold text-sm">New</p>
                  <p className="text-primary-light text-[9px]">Jobs daily</p>
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
