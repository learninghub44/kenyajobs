import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo-nav.svg" alt="JobsWorldwide" className="h-11 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">Home</Link>
            <Link href="/remote-jobs" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">Remote</Link>
            <Link href="/entry-level" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">Entry Level</Link>
            <Link href="/graduate-jobs" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">Graduate</Link>
            <Link href="/work-from-home" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">WFH</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">About</Link>
            <a href="mailto:hello@jobsworldwide.online"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Post a Job
            </a>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {[
            ["Home", "/"],
            ["Remote Jobs", "/remote-jobs"],
            ["Entry Level", "/entry-level"],
            ["Graduate Jobs", "/graduate-jobs"],
            ["Work From Home", "/work-from-home"],
            ["About", "/about"],
          ].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600">
              {label}
            </Link>
          ))}
          <a href="mailto:hello@jobsworldwide.online"
            className="mt-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center">
            Post a Job
          </a>
        </div>
      )}
    </nav>
  );
}
