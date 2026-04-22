import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kuwesa-logo.png";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#leadership", label: "Leadership" },
  { href: "#membership", label: "Membership" },
  { href: "#welfare", label: "Welfare" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        scrolled ? "bg-background/85 backdrop-blur-lg shadow-soft" : "bg-transparent"
      )}
    >
      <nav className="container-custom flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="KUWESA logo"
            className="h-11 w-11 object-contain transition-bounce group-hover:scale-110"
          />
          <div className="leading-tight">
            <div className="font-display font-bold text-foreground text-base">KUWESA</div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">Kuria West Students Association</div>
          </div>
        </Link>

        {onHome && (
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-smooth rounded-md"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
          {onHome && (
            <a href="#membership">
              <Button variant="hero" size="sm">Join KUWESA</Button>
            </a>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border animate-fade-in">
          <ul className="flex flex-col p-4 gap-1">
            {onHome &&
              links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 text-foreground/80 hover:text-primary hover:bg-secondary rounded-md transition-smooth"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            <li>
              <Link to="/admin" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full mt-2">Admin Panel</Button>
              </Link>
            </li>
            {onHome && (
              <li>
                <a href="#membership" onClick={() => setOpen(false)}>
                  <Button variant="hero" className="w-full mt-1">Join KUWESA</Button>
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};
