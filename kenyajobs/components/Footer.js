// components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-white text-xl font-bold mb-2">KenyaJobs.co.ke</h2>
          <p className="text-sm">Your #1 source for remote, entry level, graduate and work-from-home jobs in Kenya.</p>
        </div>

        {/* Job Categories */}
        <div>
          <h3 className="text-white font-semibold mb-3">Job Categories</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/remote-jobs" className="hover:text-white">Remote Jobs</Link></li>
            <li><Link href="/entry-level" className="hover:text-white">Entry Level Jobs</Link></li>
            <li><Link href="/graduate-jobs" className="hover:text-white">Graduate Jobs</Link></li>
            <li><Link href="/work-from-home" className="hover:text-white">Work From Home</Link></li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><a href="mailto:hello@kenyajobs.co.ke" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} KenyaJobs.co.ke — All rights reserved.
      </div>
    </footer>
  );
}