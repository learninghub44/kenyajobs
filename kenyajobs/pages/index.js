import Head from "next/head";
import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import { Search, MapPin, TrendingUp, Users, Briefcase, Globe, ChevronRight, Star, Wifi, GraduationCap, Home, Rocket } from "lucide-react";

const CATEGORIES = [
  { label: "All Jobs", value: "" },
  { label: "Remote", value: "remote" },
  { label: "Entry Level", value: "entry" },
  { label: "Graduate", value: "graduate" },
  { label: "Work From Home", value: "wfh" },
];

const STATS = [
  { value: "10,000+", label: "Active Jobs", icon: Briefcase },
  { value: "500+", label: "Companies", icon: Users },
  { value: "20+", label: "African Countries", icon: Globe },
  { value: "Daily", label: "New Listings", icon: TrendingUp },
];

const POPULAR_SEARCHES = ["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales", "Driver", "Customer Service", "Marketing"];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [sources, setSources] = useState({ loaded: 0, total: 5 });

  const mergeJobs = (prev, incoming) => {
    const ids = new Set(prev.map(j => j.id));
    return [...prev, ...incoming.filter(j => !ids.has(j.id))].slice(0, 60);
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchSource = async (url, sliceCount, label) => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data.slice(0, sliceCount) : [];
        if (items.length > 0) {
          setJobs(prev => mergeJobs(prev, items));
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

    const t = setTimeout(() => setLoading(false), 7000);
    return () => { clearTimeout(t); controller.abort(); };
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q);
    const matchTab = !activeTab ||
      (activeTab === "remote" && ((j.location || "").toLowerCase().includes("remote") || (j.type || "").toLowerCase().includes("remote"))) ||
      (activeTab === "entry" && (j.source || "entry")) ||
      (activeTab === "graduate" && (j.source || "").toLowerCase().includes("graduate")) ||
      (activeTab === "wfh" && ((j.location || "").toLowerCase().includes("home") || (j.type || "").toLowerCase().includes("home")));
    return matchSearch && matchTab;
  });

  return (
    <>
      <Head>
        <title>JobsWorldwide — Find Jobs in Kenya & Africa | Remote · Entry Level · Graduate</title>
        <meta name="description" content="Find the latest jobs in Kenya and across Africa. Remote, entry level, graduate and work from home opportunities updated daily." />
      </Head>

      {/* ─── HERO ─── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
            Find Your Dream Job<br />
            <span className="text-blue-200">in Kenya & Africa</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Thousands of jobs from top employers — remote, on-site, entry level, and more.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword..."
                className="w-full pl-11 pr-4 py-4 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
            </div>
            <button
              onClick={() => {}}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg text-sm whitespace-nowrap">
              Search Jobs
            </button>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-blue-200 text-sm">Popular:</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => setSearch(s)}
                className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition-all">
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
            <p className="text-blue-200 text-sm max-w-md">Reach thousands of qualified candidates across Kenya and Africa. Post your job today and get applications fast.</p>
          </div>
          <a href="mailto:hello@jobsworldwide.online"
            className="relative flex-shrink-0 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
            Post a Job →
          </a>
        </div>
      </section>

      {/* ─── JOBS SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {jobs.length > 0 ? `${filtered.length} opportunities available` : "Loading opportunities..."}
            </p>
          </div>

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
        </div>

        {/* Job grid */}
        {loading && jobs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <JobSkeleton key={i} />)}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((job, index) => (
              <div key={job.id || index}>
                <JobCard job={job} />
                {(index + 1) % 9 === 0 && (
                  <div className="col-span-full bg-gray-100 text-gray-400 text-center text-xs py-5 rounded-xl mt-5">
                    Advertisement
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && jobs.length > 0 && (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No jobs match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="mt-3 text-blue-600 text-sm hover:underline">Clear search</button>
          </div>
        )}

        {!loading && jobs.length === 0 && (
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
              { title: "Work From Home", desc: "Skip the commute, work remotely", href: "/work-from-home", color: "from-orange-500 to-amber-600", icon: Home },
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
