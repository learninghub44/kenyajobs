import Link from "next/link";
import { Mail, Briefcase, Phone } from "lucide-react";
import SocialChannelLinks from "@/components/SocialChannelLinks";

const SOURCES = ["Remotive", "Jobicy", "Arbeitnow", "ReliefWeb", "BrighterMonday", "MyJobMag", "Adzuna"];
const FOOTER_LINKS = {
  "Browse Jobs": [["Remote Jobs", "/remote-jobs"], ["Entry Level", "/entry-level"], ["Graduate Jobs", "/graduate-jobs"], ["Work From Home", "/work-from-home"], ["Internships", "/internships"], ["Africa Jobs", "/africa-jobs"]],
  "Popular Roles": [["Software Engineer", "/search?q=software+engineer"], ["Accountant", "/search?q=accountant"], ["Nurse", "/search?q=nurse"], ["Teacher", "/search?q=teacher"], ["Sales Manager", "/search?q=sales+manager"], ["Customer Service", "/search?q=customer+service"]],
  "For Candidates": [["Career Blog", "/blog"], ["CV Tips", "/cv-tips"], ["Job Trends", "/job-trends"], ["Companies Hiring", "/companies"], ["Search Jobs", "/search"], ["Help & FAQs", "/faq"]],
  "For Employers": [["Post a Job", "/advertise"], ["Advertise", "/advertise"], ["About Us", "/about"], ["Contact", "/contact"], ["Developers", "/developers"]],
};

export default function Footer() {
  return (
    <footer className="bg-text-primary text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4"><Link href="/"><img src="/logo-nav.svg" alt="Online Jobs" style={{ height: "32px", width: "auto", filter: "brightness(0) invert(1)" }} /></Link></div>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">A practical job discovery platform for Kenya, Africa and worldwide remote opportunities. Find roles, compare opportunities and apply through the original source.</p>
            <div className="mb-5 space-y-2">
              <a href="mailto:support@christech.co.ke" className="flex items-center gap-2 text-sm hover:text-white"><Mail size={14} /> support@christech.co.ke</a>
              <a href="tel:+254701059192" className="flex items-center gap-2 text-sm hover:text-white"><Phone size={14} /> +254 701 059 192</a>
            </div>
            <SocialChannelLinks variant="footer" />
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">{heading}</h3>
              <ul className="space-y-2.5">{links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm hover:text-white">{label}</Link></li>)}</ul>
            </div>
          ))}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Our Sources</h3>
            <div className="mb-5 flex flex-wrap gap-1.5">{SOURCES.map((src) => <span key={src} className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-400">{src}</span>)}<span className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-gray-500">+23 more</span></div>
            <ul className="space-y-2.5">
              <li><Link href="/privacy-policy" className="text-sm hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-sm hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <div className="space-y-1.5 text-center sm:text-left">
            <p>{new Date().getFullYear()} Online Jobs. All rights reserved.</p>
            <p>Built by <a href="https://www.christech.co.ke" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-300 hover:text-white">ChrisTech</a> — need a website or web app? <Link href="/contact" className="font-medium text-gray-300 hover:text-white">Reach us out</Link>.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link><Link href="/terms-and-conditions" className="hover:text-white">Terms</Link><Link href="/faq" className="hover:text-white">FAQ</Link><Link href="/about" className="hover:text-white">About</Link><Link href="/contact" className="hover:text-white">Contact</Link><Link href="/sitemap" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
