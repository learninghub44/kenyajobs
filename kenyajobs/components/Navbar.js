import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, X, CheckCircle2 } from "lucide-react";

const NAV_LINKS = [
  ["Remote", "/remote-jobs"],
  ["Entry Level", "/entry-level"],
  ["Graduate", "/graduate-jobs"],
  ["Work From Home", "/work-from-home"],
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      {/* Trust bar */}
      <div className="bg-[#0b2233] text-white/70 text-sm py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={10} className="text-emerald-400" />
              Jobs verified from 15+ trusted sources
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={10} className="text-emerald-400" />
              Updated multiple times daily
            </span>
          </div>
          <a href="mailto:hello@jobsworldwide.online" className="hover:text-white transition-colors">
            hello@jobsworldwide.online
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-15 py-2">

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image src="/logo-nav.svg" alt="JobsWorldwide" width={260} height={44} className="h-10 w-auto" priority />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                Home
              </Link>
              {NAV_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className="text-base font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/search"
                className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
                aria-label="Search jobs"
              >
                <Search size={17} />
              </Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2">
                About
              </Link>
              <a
                href="mailto:hello@jobsworldwide.online"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Post a Job
              </a>
            </div>

            {/* Mobile burger */}
            <button className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1 shadow-lg">
            {[["Home", "/"], ["Search Jobs", "/search"], ...NAV_LINKS, ["About", "/about"]].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 hover:text-gray-900"
              >
                {label}
              </Link>
            ))}
            <a
              href="mailto:hello@jobsworldwide.online"
              className="mt-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
            >
              Post a Job
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
