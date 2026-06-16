// components/Navbar.js
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          KenyaJobs<span className="text-gray-800">.co.ke</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/remote-jobs" className="hover:text-blue-600">Remote Jobs</Link>
          <Link href="/entry-level" className="hover:text-blue-600">Entry Level</Link>
          <Link href="/graduate-jobs" className="hover:text-blue-600">Graduate Jobs</Link>
          <Link href="/work-from-home" className="hover:text-blue-600">Work From Home</Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-600">
          <Link href="/remote-jobs" onClick={() => setMenuOpen(false)} className="hover:text-blue-600">Remote Jobs</Link>
          <Link href="/entry-level" onClick={() => setMenuOpen(false)} className="hover:text-blue-600">Entry Level</Link>
          <Link href="/graduate-jobs" onClick={() => setMenuOpen(false)} className="hover:text-blue-600">Graduate Jobs</Link>
          <Link href="/work-from-home" onClick={() => setMenuOpen(false)} className="hover:text-blue-600">Work From Home</Link>
        </div>
      )}
    </nav>
  );
}