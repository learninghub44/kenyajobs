import Head from "next/head";
import Link from "next/link";
import {
  Globe, Search, ShieldCheck, Zap, Mail, Users, Briefcase,
  GraduationCap, Laptop, Home, MapPin, RefreshCw, ExternalLink,
  CheckCircle2, ArrowRight, Clock, Database, AlertTriangle, Star
} from "lucide-react";

const SOURCES = [
  { name: "BrighterMonday KE", region: "Kenya", color: "#16a34a" },
  { name: "MyJobMag KE",       region: "Kenya", color: "#16a34a" },
  { name: "VacancyKenya",      region: "Kenya", color: "#16a34a" },
  { name: "CareerPoint KE",    region: "Kenya", color: "#16a34a" },
  { name: "JobsInKenya",       region: "Kenya", color: "#16a34a" },
  { name: "Fuzu EA",           region: "East Africa", color: "#0891b2" },
  { name: "BrighterMonday UG", region: "Uganda", color: "#0891b2" },
  { name: "BrighterMonday TZ", region: "Tanzania", color: "#0891b2" },
  { name: "MyJobMag NG",       region: "Nigeria", color: "#7c3aed" },
  { name: "PNet SA",           region: "South Africa", color: "#7c3aed" },
  { name: "Remotive",          region: "Global Remote", color: "#2563eb" },
  { name: "Jobicy",            region: "Global Remote", color: "#2563eb" },
  { name: "Arbeitnow",         region: "Europe", color: "#2563eb" },
  { name: "ReliefWeb",         region: "NGO / Global", color: "#b45309" },
  { name: "Adzuna",            region: "Global", color: "#2563eb" },
];

const CATEGORIES = [
  {
    icon: Laptop,
    label: "Remote Jobs",
    desc: "Roles that let you work from Kenya or anywhere — sourced from Remotive, Jobicy, and global remote-first boards.",
    href: "/remote-jobs",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    icon: Briefcase,
    label: "Entry Level Jobs",
    desc: "Positions open to candidates with little or no prior experience. Great for those entering the job market for the first time.",
    href: "/entry-level",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    icon: GraduationCap,
    label: "Graduate Jobs",
    desc: "Graduate trainee programmes, internships with full-time pathways, and roles targeting fresh university leavers.",
    href: "/graduate-jobs",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: Home,
    label: "Work From Home",
    desc: "Home-based roles in customer support, writing, data, and admin — categories that are strongly WFH-aligned and distinct from our general remote feed.",
    href: "/work-from-home",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About JobsWorldwide — Free Job Aggregator for Kenya & Africa</title>
        <meta
          name="description"
          content="JobsWorldwide aggregates live job listings from 15+ trusted sources across Kenya, East Africa, and global remote boards — free, no sign-up needed."
        />
      </Head>

      {/* ── PAGE HEADER ── */}
      <div className="bg-[#0b2233] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">About us</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            One place for every<br />
            <span className="text-amber-400">job in Kenya & beyond.</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
            JobsWorldwide is a free job aggregator built to save you hours of searching. We pull live listings from 15+ trusted boards across Kenya, East Africa, and global remote platforms — and surface them in one clean feed.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-16">

        {/* ── MISSION ── */}
        <section>
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Our mission</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">We built the shortcut we wished existed</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Finding a job in Kenya means visiting BrighterMonday, then MyJobMag, then LinkedIn, then checking various government portals, NGO boards, and company websites — only to find the same listings recycled across all of them, mixed in with outdated postings from months ago.
                </p>
                <p>
                  JobsWorldwide cuts through that. We aggregate directly from the source — pulling from 15+ job boards and RSS feeds multiple times a day — and present them in a single, searchable feed. No registration. No CV uploads. No paywalls. Just jobs.
                </p>
                <p>
                  When you click Apply on any listing, you go directly to the original employer's application page. We are a discovery tool, not a gatekeeper.
                </p>
              </div>
            </div>
            <div className="w-full md:w-64 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              {[
                { value: "15+", label: "Job board sources" },
                { value: "30+", label: "Countries covered" },
                { value: "1,200+", label: "Active listings" },
                { value: "Free", label: "Always, for job seekers" },
              ].map(({ value, label }) => (
                <div key={label} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">How it works</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">From source to your screen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                step: "01",
                title: "We pull from 15+ sources",
                desc: "Our system fetches fresh listings from Kenya-specific boards, East African platforms, global remote boards, and NGO job sites — multiple times a day.",
              },
              {
                icon: RefreshCw,
                step: "02",
                title: "Deduplication & sorting",
                desc: "Duplicate listings across sources are merged. Kenya and local listings are prioritised so they're never crowded out by high-volume global sources.",
              },
              {
                icon: ExternalLink,
                step: "03",
                title: "You apply directly",
                desc: "Every listing links straight to the original employer or job board. We never intercept your application or collect your personal data.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <span className="text-3xl font-black text-gray-100">{step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── JOB CATEGORIES ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">What we cover</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Four categories, one place</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map(({ icon: Icon, label, desc, href, color, bg }) => (
              <Link key={href} href={href}
                className="group flex items-start gap-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2 text-blue-600">
                    Browse <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SOURCES ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Our sources</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Where the jobs come from</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xl">
            We only pull from established, reputable job boards. No scraped company pages. No social media posts. No unverified listings.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {SOURCES.map(({ name, region }) => (
              <span key={name}
                className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                <span className="text-xs text-gray-400">{region}</span>
                <span className="w-px h-3 bg-gray-300" />
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400">Sources are checked and refreshed throughout the day. Coverage grows as we add new boards.</p>
        </section>

        {/* ── TRUST & SAFETY ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Trust & safety</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What we stand for</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                title: "Always free for job seekers",
                desc: "We will never charge you to browse, search, or apply for any job on this platform. Not now, not ever.",
              },
              {
                icon: ShieldCheck,
                color: "text-blue-600",
                bg: "bg-blue-50",
                title: "No personal data collected",
                desc: "You don't create an account. You don't upload a CV. We don't track who you are or which jobs you viewed.",
              },
              {
                icon: ExternalLink,
                color: "text-violet-600",
                bg: "bg-violet-50",
                title: "Direct to the employer",
                desc: "Every listing sends you directly to the original source. We are not in the middle of your application.",
              },
              {
                icon: AlertTriangle,
                color: "text-amber-600",
                bg: "bg-amber-50",
                title: "Spot a suspicious listing?",
                desc: "Legitimate employers never ask you to pay to apply. If any listing asks for money upfront, ignore it and report it to us.",
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={17} className={color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOR EMPLOYERS ── */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">For employers</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Looking to hire?</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xl mb-6">
            We work with employers and organisations that want to reach active job seekers across Kenya, East Africa, and the global remote workforce. Manual job postings are merged directly into our feed alongside aggregated listings — no algorithm hiding your role.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            {[
              { label: "Direct listing placement", desc: "Your job appears in our feed, not buried in a database" },
              { label: "Kenya & Africa focus", desc: "Reach candidates who are actively looking in this market" },
              { label: "No recruiter middlemen", desc: "Applications go straight from candidate to you" },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                <CheckCircle2 size={15} className="text-emerald-500 mb-2" />
                <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            ))}
          </div>
          <a href="mailto:hello@jobsworldwide.online"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Mail size={14} /> Get in touch — hello@jobsworldwide.online
          </a>
        </section>

        {/* ── CONTACT ── */}
        <section className="border-t border-gray-100 pt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Contact</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We'd like to hear from you</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mb-6">
            Whether you've spotted a broken listing, want to suggest a new job board source, have a partnership idea, or just want to say hello — reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:hello@jobsworldwide.online"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              <Mail size={14} /> hello@jobsworldwide.online
            </a>
            <Link href="/"
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Browse jobs <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
