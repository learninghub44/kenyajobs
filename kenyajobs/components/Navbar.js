import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";

const NAV_LINKS = [
  ["Remote", "/remote-jobs"],
  ["Entry Level", "/entry-level"],
  ["Graduate", "/graduate-jobs"],
  ["Work From Home", "/work-from-home"],
  ["Internships", "/internships"],
  ["Africa Jobs", "/africa-jobs"],
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/logo-nav.svg" alt="JobsWorldwide" width={220} height={36} className="h-9 w-auto" priority />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-full hover:bg-surface transition-colors">
              Home
            </Link>
            {NAV_LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-full hover:bg-surface transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-surface"
              aria-label="Search jobs"
            >
              <Search size={18} />
            </Link>
            <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-full hover:bg-surface transition-colors">
              About
            </Link>
            <a
              href="mailto:hello@jobsworldwide.online"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              Post a Job
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 text-text-secondary rounded-full hover:bg-surface transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-border px-4 py-3 flex flex-col gap-1">
          {[["Home", "/"], ["Search Jobs", "/search"], ...NAV_LINKS, ["About", "/about"]].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-text-secondary px-4 py-3 rounded-full hover:bg-surface hover:text-text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
          <a
            href="mailto:hello@jobsworldwide.online"
            className="mt-2 bg-primary text-white text-sm font-medium px-4 py-3 rounded-full text-center"
          >
            Post a Job
          </a>
        </div>
      )}
    </header>
  );
}
