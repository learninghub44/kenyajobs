import Link from "next/link";
import { useState } from "react";
import { Globe, Briefcase, GraduationCap, Laptop, Home, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-lg p-1.5">
            <Globe size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900">Jobs<span className="text-blue-600">Worldwide</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-1 text-sm font-medium text-gray-600">
          <Link href="/remote-jobs" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Laptop size={15} /> Remote Jobs
          </Link>
          <Link href="/entry-level" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Briefcase size={15} /> Entry Level
          </Link>
          <Link href="/graduate-jobs" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <GraduationCap size={15} /> Graduate Jobs
          </Link>
          <Link href="/work-from-home" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Home size={15} /> Work From Home
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600 focus:outline-none p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1 text-sm font-medium text-gray-600">
          <Link href="/remote-jobs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600">
            <Laptop size={15} /> Remote Jobs
          </Link>
          <Link href="/entry-level" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600">
            <Briefcase size={15} /> Entry Level
          </Link>
          <Link href="/graduate-jobs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600">
            <GraduationCap size={15} /> Graduate Jobs
          </Link>
          <Link href="/work-from-home" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600">
            <Home size={15} /> Work From Home
          </Link>
        </div>
      )}
    </nav>
  );
}
