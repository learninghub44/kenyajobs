import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">J</span>
              </div>
              <span className="text-white font-bold text-lg">Jobs<span className="text-blue-400">Worldwide</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-5">Your #1 source for jobs in Kenya and across Africa. Remote, entry level, graduate and work-from-home opportunities updated daily.</p>
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@jobsworldwide.online" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={13} /> hello@jobsworldwide.online
              </a>
            </div>
          </div>

          {/* Job Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Job Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {[["Remote Jobs", "/remote-jobs"], ["Entry Level", "/entry-level"], ["Graduate Jobs", "/graduate-jobs"], ["Work From Home", "/work-from-home"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Popular Roles */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Popular Searches</h3>
            <ul className="space-y-2.5 text-sm">
              {["Software Engineer", "Accountant", "Nurse", "Teacher", "Sales Manager", "Customer Service"].map(r => (
                <li key={r}><span className="hover:text-white transition-colors cursor-pointer">{r}</span></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {[["About Us", "/about"], ["Privacy Policy", "/privacy-policy"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
              <li><a href="mailto:hello@jobsworldwide.online" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="mailto:hello@jobsworldwide.online" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} JobsWorldwide. All rights reserved.</p>
          <p>Built for job seekers across Africa 🌍</p>
        </div>
      </div>
    </footer>
  );
}
