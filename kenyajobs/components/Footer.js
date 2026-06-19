import Link from "next/link";
import { Mail } from "lucide-react";

const SOURCES = ["Remotive", "Jobicy", "Arbeitnow", "ReliefWeb", "BrighterMonday", "MyJobMag", "Adzuna"];

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@jobsworldwideke",
    href: "https://instagram.com/jobsworldwideke",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "@jobsworldwideke",
    href: "https://facebook.com/jobsworldwideke",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    handle: "@jobsworldwideke",
    href: "https://twitter.com/jobsworldwideke",
    color: "#ffffff",
    bg: "rgba(255,255,255,0.10)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@jobsworldwideke",
    href: "https://tiktok.com/@jobsworldwideke",
    color: "#69C9D0",
    bg: "rgba(105,201,208,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.75a4.85 4.85 0 01-1.03-.06z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b2233] text-slate-400">

      {/* Trust strip */}
      <div className="border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center md:justify-between">
            <div className="text-base">
              <span className="text-slate-300 font-semibold">Verified job listings</span>
              <span className="text-slate-500"> — from 30+ trusted global sources</span>
            </div>
            <div className="text-base">
              <span className="text-slate-300 font-semibold">Live aggregation</span>
              <span className="text-slate-500"> — updated multiple times daily</span>
            </div>
            <div className="text-base">
              <span className="text-slate-300 font-semibold">30+ countries</span>
              <span className="text-slate-500"> — Africa, Europe, Americas &amp; more</span>
            </div>
            <div className="text-base">
              <span className="text-slate-300 font-semibold">No fake listings</span>
              <span className="text-slate-500"> — sourced from reputable boards only</span>
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
              We aggregate live job listings from 30+ reputable boards and post them in one place — so you spend less time searching and more time applying.
            </p>
            <a href="mailto:hello@jobsworldwide.online" className="flex items-center gap-2 text-sm hover:text-white transition-colors mb-6">
              <Mail size={13} /> hello@jobsworldwide.online
            </a>

            {/* Social media icons */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Follow us</p>
              <div className="flex gap-3">
                {SOCIALS.map(({ name, href, color, bg, icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:brightness-125"
                    style={{ background: bg, color: color, border: `1px solid ${color}22` }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3 font-medium">@jobsworldwideke</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Job Categories</h3>
            <ul className="space-y-2.5 text-base">
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
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Popular Roles</h3>
            <ul className="space-y-2.5 text-base">
              {["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales Manager", "Customer Service"].map(r => (
                <li key={r}>
                  <span className="hover:text-white transition-colors cursor-pointer">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Job sources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Our Sources</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {SOURCES.map(src => (
                <span key={src} className="text-xs font-medium px-2 py-0.5 rounded bg-white/8 text-slate-400 border border-white/10">
                  {src}
                </span>
              ))}
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/8 text-slate-500 border border-white/10">
                +23 more
              </span>
            </div>
            <ul className="space-y-2.5 text-base">
              {[["About Us", "/about"], ["Contact Us", "/contact"], ["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms-and-conditions"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
              <li><a href="mailto:hello@jobsworldwide.online" className="hover:text-white transition-colors">Post a Job</a></li>
            </ul>
          </div>
        </div>

        {/* Social banner */}
        <div className="border border-white/10 rounded-2xl px-6 py-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.03]">
          <div>
            <p className="text-white font-semibold text-base mb-0.5">Stay updated — follow us on social media</p>
            <p className="text-slate-500 text-sm">Daily job alerts, career tips and hiring news on all platforms</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {SOCIALS.map(({ name, href, color, bg, icon, handle }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${name} — ${handle}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:brightness-125"
                style={{ background: bg, color: color, border: `1px solid ${color}33` }}
              >
                {icon}
                <span className="hidden sm:inline">{name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} JobsWorldwide. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Aggregating opportunities from trusted boards worldwide.</p>
            <div className="flex gap-3">
              {SOCIALS.map(({ name, href, color, icon }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform"
                  style={{ color: color }} title={name}>
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
