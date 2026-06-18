import Link from "next/link";
import { Mail, Shield, Globe, Rss, CheckCircle2 } from "lucide-react";

const SOURCES = ["Remotive", "Jobicy", "Arbeitnow", "ReliefWeb", "BrighterMonday", "MyJobMag", "Adzuna"];

export default function Footer() {
  return (
    <footer className="bg-[#0b2233] text-slate-400">

      {/* Trust strip */}
      <div className="border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center md:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium">Verified job listings</span>
              <span className="text-slate-500 text-xs">from 15+ trusted global sources</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Rss size={14} className="text-blue-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium">Live aggregation</span>
              <span className="text-slate-500 text-xs">updated multiple times daily</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe size={14} className="text-amber-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium">30+ countries</span>
              <span className="text-slate-500 text-xs">Africa, Europe, Americas & more</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield size={14} className="text-violet-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium">No fake listings</span>
              <span className="text-slate-500 text-xs">sourced from reputable boards only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand col */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Link href="/">
                <img
                  src="/logo-nav.svg"
                  alt="JobsWorldwide"
                  style={{ height: "44px", width: "auto", filter: "brightness(0) invert(1)" }}
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-slate-400">
              We aggregate live job listings from 15+ reputable boards and post them in one place — so you spend less time searching and more time applying.
            </p>
            <a href="mailto:hello@jobsworldwide.online" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
              <Mail size={13} /> hello@jobsworldwide.online
            </a>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Job Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Remote Jobs", "/remote-jobs"],
                ["Entry Level", "/entry-level"],
                ["Graduate Jobs", "/graduate-jobs"],
                ["Work From Home", "/work-from-home"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="hover:text-white transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular roles */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Popular Roles</h3>
            <ul className="space-y-2.5 text-sm">
              {["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales Manager", "Customer Service"].map(r => (
                <li key={r}>
                  <span className="hover:text-white transition-colors cursor-pointer">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Job sources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Our Sources</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {SOURCES.map(src => (
                <span key={src} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/8 text-slate-400 border border-white/10">
                  {src}
                </span>
              ))}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/8 text-slate-500 border border-white/10">
                +8 more
              </span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[["About Us", "/about"], ["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms-and-conditions"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
              <li><a href="mailto:hello@jobsworldwide.online" className="hover:text-white transition-colors">Post a Job</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} JobsWorldwide. All rights reserved.</p>
          <p>Aggregating opportunities from trusted boards worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
