import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, X, ChevronDown, Briefcase, User } from "lucide-react";

const NAV_LINKS = [
  { label: "Job seeker", href: "#", children: [
    { label: "Remote Jobs", href: "/remote-jobs" },
    { label: "Entry Level", href: "/entry-level" },
    { label: "Graduate Jobs", href: "/graduate-jobs" },
    { label: "Work From Home", href: "/work-from-home" },
    { label: "Internships", href: "/internships" },
    { label: "Africa Jobs", href: "/africa-jobs" },
  ]},
  { label: "Blog", href: "/blog" },
  { label: "Employers", href: "/advertise" },
  { label: "Help center", href: "/faq" },
  { label: "About us", href: "/about" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-xs">
          <p className="text-gray-300">The future of work gets decided by you. Tell us what matters to your career.</p>
          <div className="hidden sm:flex items-center gap-4">
            <a href="mailto:hello@jobsworldwide.online" className="text-gray-300 hover:text-white transition-colors">hello@jobsworldwide.online</a>
            <span className="text-gray-500">|</span>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/logo-nav.svg" alt="JobsWorldwide" width={200} height={32} className="h-8 w-auto" priority />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors"
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} className="text-text-tertiary" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 w-56 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-muted"
              aria-label="Search jobs"
            >
              <Search size={18} />
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors"
            >
              <User size={16} />
              Login
            </Link>
            <a
              href="mailto:hello@jobsworldwide.online?subject=Post a Job"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <Briefcase size={16} />
              Post a Job
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 text-text-secondary rounded-lg hover:bg-surface-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-border px-4 py-4">
          {NAV_LINKS.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => !item.children && setMenuOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-text-secondary px-3 py-3 rounded-lg hover:bg-surface-muted hover:text-text-primary transition-colors"
              >
                {item.label}
                {item.children && <ChevronDown size={14} className="text-text-tertiary" />}
              </Link>
              {item.children && (
                <div className="pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      className="block text-sm text-text-secondary px-3 py-2.5 rounded-lg hover:bg-surface-muted hover:text-primary transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 text-sm font-medium text-text-secondary px-4 py-3 rounded-lg border border-border hover:bg-surface-muted transition-colors"
            >
              <User size={16} />
              Login
            </Link>
            <a
              href="mailto:hello@jobsworldwide.online?subject=Post a Job"
              className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-3 rounded-lg"
            >
              <Briefcase size={16} />
              Post a Job
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
