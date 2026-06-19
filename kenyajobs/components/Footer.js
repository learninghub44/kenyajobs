import Link from "next/link";
import { Mail } from "lucide-react";

const SOURCES = [
  "Remotive",
  "Jobicy",
  "Arbeitnow",
  "ReliefWeb",
  "BrighterMonday",
  "MyJobMag",
  "Adzuna",
];

export default function Footer() {
  return (
    <footer className="bg-[#0b2233] text-slate-400">
      {/* Trust strip */}
      <div className="border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center md:justify-between">
            <div className="text-base">
              <span className="text-slate-300 font-semibold">
                Verified job listings
              </span>
              <span className="text-slate-500">
                {" "}
                — from 30+ trusted global sources
              </span>
            </div>

            <div className="text-base">
              <span className="text-slate-300 font-semibold">
                Live aggregation
              </span>
              <span className="text-slate-500">
                {" "}
                — updated multiple times daily
              </span>
            </div>

            <div className="text-base">
              <span className="text-slate-300 font-semibold">
                30+ countries
              </span>
              <span className="text-slate-500">
                {" "}
                — Africa, Europe, Americas &amp; more
              </span>
            </div>

            <div className="text-base">
              <span className="text-slate-300 font-semibold">
                No fake listings
              </span>
              <span className="text-slate-500">
                {" "}
                — sourced from reputable boards only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-2">
            <div className="mb-4">
              <Link href="/">
                <img
                  src="/logo-nav.svg"
                  alt="JobsWorldwide"
                  style={{
                    height: "44px",
                    width: "auto",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </Link>
            </div>

            <p className="text-base leading-relaxed mb-5 text-slate-400">
              We aggregate live job listings from 30+ reputable boards and post
              them in one place — so you spend less time searching and more time
              applying.
            </p>

            <a
              href="mailto:hello@jobsworldwide.online"
              className="flex items-center gap-2 text-base hover:text-white transition-colors mb-6"
            >
              <Mail size={13} />
              hello@jobsworldwide.online
            </a>
          </div>

          {/* Browse Jobs */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Browse Jobs
            </h3>

            <ul className="space-y-2.5 text-base">
              {[
                ["Remote Jobs", "/remote-jobs"],
                ["Entry Level", "/entry-level"],
                ["Graduate Jobs", "/graduate-jobs"],
                ["Work From Home", "/work-from-home"],
                ["Internships", "/internships"],
                ["Africa Jobs", "/africa-jobs"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Roles */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Popular Roles
            </h3>

            <ul className="space-y-2.5 text-base">
              {[
                ["Software Engineer", "software engineer"],
                ["Accountant", "accountant"],
                ["Nurse", "nurse"],
                ["Teacher", "teacher"],
                ["Sales Manager", "sales manager"],
                ["Customer Service", "customer service"],
              ].map(([label, q]) => (
                <li key={label}>
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Resources
            </h3>

            <ul className="space-y-2.5 text-base">
              {[
                ["CV Tips", "/cv-tips"],
                ["Job Trends", "/job-trends"],
                ["Companies Hiring", "/companies"],
                ["Search Jobs", "/search"],
                ["Help / FAQs", "/faq"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Employers
            </h3>

            <ul className="space-y-2.5 text-base">
              {[
                ["Post a Job", "/advertise"],
                ["Advertise", "/advertise"],
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}

              <li>
                <a
                  href="mailto:hello@jobsworldwide.online?subject=Post a Job"
                  className="hover:text-white transition-colors"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Our Sources
            </h3>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {SOURCES.map((src) => (
                <span
                  key={src}
                  className="text-sm font-medium px-2.5 py-1 rounded bg-white/10 text-slate-400 border border-white/10"
                >
                  {src}
                </span>
              ))}

              <span className="text-sm font-medium px-2.5 py-1 rounded bg-white/10 text-slate-500 border border-white/10">
                +23 more
              </span>
            </div>

            <ul className="space-y-2.5 text-base">
              {[
                ["Privacy Policy", "/privacy-policy"],
                ["Terms & Conditions", "/terms-and-conditions"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="hover:text-white transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} JobsWorldwide. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-and-conditions"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>

            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>

            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>

            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
