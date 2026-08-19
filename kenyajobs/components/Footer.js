import Link from "next/link";
import { Mail, Globe, ExternalLink } from "lucide-react";

const SOURCES = ["Remotive", "Jobicy", "Arbeitnow", "ReliefWeb", "BrighterMonday", "MyJobMag", "Adzuna"];

const FOOTER_LINKS = {
  "Browse Jobs": [
    ["Remote Jobs", "/remote-jobs"],
    ["Entry Level", "/entry-level"],
    ["Graduate Jobs", "/graduate-jobs"],
    ["Work From Home", "/work-from-home"],
    ["Internships", "/internships"],
    ["Africa Jobs", "/africa-jobs"],
  ],
  "Popular Roles": [
    ["Software Engineer", "/search?q=software+engineer"],
    ["Accountant", "/search?q=accountant"],
    ["Nurse", "/search?q=nurse"],
    ["Teacher", "/search?q=teacher"],
    ["Sales Manager", "/search?q=sales+manager"],
    ["Customer Service", "/search?q=customer+service"],
  ],
  "For Candidates": [
    ["Career Blog", "/blog"],
    ["CV Tips", "/cv-tips"],
    ["Job Trends", "/job-trends"],
    ["Companies Hiring", "/companies"],
    ["Search Jobs", "/search"],
    ["Help & FAQs", "/faq"],
  ],
  "For Employers": [
    ["Post a Job", "/advertise"],
    ["Advertise", "/advertise"],
    ["About Us", "/about"],
    ["Contact", "/contact"],
    ["Developers", "/developers"],
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#202124] text-[#9AA0A6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2">
            <div className="mb-4">
              <Link href="/">
                <img
                  src="/logo-nav.svg"
                  alt="JobsWorldwide"
                  style={{ height: "32px", width: "auto", filter: "brightness(0) invert(1)" }}
                />
              </Link>
            </div>

            <p className="text-sm leading-relaxed mb-5 text-[#9AA0A6]">
              Aggregating live job listings from 30+ boards so you spend less time searching and more time applying.
            </p>

            <a
              href="mailto:hello@jobsworldwide.online"
              className="flex items-center gap-2 text-sm hover:text-white transition-colors mb-5"
            >
              <Mail size={14} />
              hello@jobsworldwide.online
            </a>

            <div className="flex items-center gap-2">
              <a
                href="https://t.me/+JN0rNZmNbGlkN2I0"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram channel"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Globe size={15} className="text-[#9AA0A6]" />
              </a>
              <a
                href="https://wa.me/254701059192"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ExternalLink size={15} className="text-[#9AA0A6]" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Sources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
              Our Sources
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {SOURCES.map((src) => (
                <span key={src} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-[#9AA0A6]">
                  {src}
                </span>
              ))}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-[#6B7280]">
                +23 more
              </span>
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-sm hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>{new Date().getFullYear()} JobsWorldwide. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
