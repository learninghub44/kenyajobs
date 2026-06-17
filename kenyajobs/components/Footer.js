import Link from "next/link";
import { Globe, Mail, Laptop, Briefcase, GraduationCap, Home, Info, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              <Globe size={16} strokeWidth={2.5} />
            </div>
            <span className="text-white text-lg font-bold">Jobs<span className="text-blue-400">Worldwide</span></span>
          </div>
          <p className="text-sm leading-relaxed">Your source for remote, entry level, graduate and work-from-home jobs. Updated daily.</p>
        </div>

        {/* Job Categories */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Job Categories</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/remote-jobs" className="flex items-center gap-2 hover:text-white transition-colors">
                <Laptop size={14} /> Remote Jobs
              </Link>
            </li>
            <li>
              <Link href="/entry-level" className="flex items-center gap-2 hover:text-white transition-colors">
                <Briefcase size={14} /> Entry Level Jobs
              </Link>
            </li>
            <li>
              <Link href="/graduate-jobs" className="flex items-center gap-2 hover:text-white transition-colors">
                <GraduationCap size={14} /> Graduate Jobs
              </Link>
            </li>
            <li>
              <Link href="/work-from-home" className="flex items-center gap-2 hover:text-white transition-colors">
                <Home size={14} /> Work From Home
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/about" className="flex items-center gap-2 hover:text-white transition-colors">
                <Info size={14} /> About Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="flex items-center gap-2 hover:text-white transition-colors">
                <ShieldCheck size={14} /> Privacy Policy
              </Link>
            </li>
            <li>
              <a href="mailto:hello@jobsworldwide.online" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} /> Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-5 text-xs text-gray-600">
        © {new Date().getFullYear()} JobsWorldwide — All rights reserved.
      </div>
    </footer>
  );
}
