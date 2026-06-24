import Link from "next/link";
import { Mail } from "lucide-react";

const SOURCES = ["Remotive", "Jobicy", "Arbeitnow", "ReliefWeb", "BrighterMonday", "MyJobMag", "Adzuna"];

export default function Footer() {
  return (
    <footer className="bg-[#0b2233] text-slate-400">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-8 mb-12">

          {/* Brand */}
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

            <div className="flex items-center gap-3">
              <a
                href="https://t.me/+JN0rNZmNbGlkN2I0"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram channel"
                title="Join our Telegram channel"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="text-slate-300">
                  <path d="M21.94 4.36a1.5 1.5 0 00-1.55-.27L2.7 11.27a1.45 1.45 0 00.07 2.71l4.62 1.5 1.76 5.6a1.4 1.4 0 002.31.55l2.5-2.3 4.49 3.31a1.5 1.5 0 002.36-.9l3.18-15.05a1.5 1.5 0 00-.05-1.33zM9.05 14.36l-.46 4.3-1.4-4.45 10.6-7.6-8.74 7.75z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/254701059192"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="Chat with us on WhatsApp"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="text-slate-300">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.014 21.785h-.005a9.825 9.825 0 01-5.011-1.371l-.36-.214-3.728.978.995-3.633-.235-.373a9.799 9.799 0 01-1.504-5.227c.002-5.42 4.418-9.832 9.85-9.832 2.633 0 5.107 1.026 6.966 2.888a9.776 9.776 0 012.882 6.961c-.002 5.42-4.418 9.823-9.85 9.823zm8.392-18.214A11.815 11.815 0 0012.013 0C5.439 0 .088 5.348.085 11.92a11.88 11.88 0 001.59 5.96L0 24l6.255-1.638a11.91 11.91 0 005.752 1.466h.005c6.573 0 11.924-5.349 11.927-11.921a11.852 11.852 0 00-3.533-8.336z"/>
                </svg>
              </a>
            </div>
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

          {/* Candidates */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Candidates</h3>
            <ul className="space-y-2.5 text-base">
              {[
                ["Career Blog", "/blog"],
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
                ["Developers", "/developers"],
                ["Documentation", "/developers"],
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

          {/* Our Sources */}
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
                  <Link href={h} className="hover:text-white transition-colors">{l}</Link>
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

            <Link href="/sitemap" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
