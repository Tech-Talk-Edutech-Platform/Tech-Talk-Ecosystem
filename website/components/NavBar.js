"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled ? "bg-background shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand Identity / Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => handleScrollTo("hero")}
        >
          <Image src="/logo.png" alt="Logo" width={60} height={40} priority />
          <span className="font-bold text-xl text-primary">Tech Talk Hub</span>
        </div>

        {/* Desktop Anchor Paths */}
        <div className="hidden md:flex space-x-8 text-text font-medium">
          <button onClick={() => handleScrollTo("pricing")} className="hover:text-secondary">Pricing</button>
          <button onClick={() => handleScrollTo("contact")} className="hover:text-secondary">Contact</button>
          <button onClick={() => handleScrollTo("programs")} className="hover:text-secondary">Courses</button>
          <Link href="/careers" className="hover:text-secondary flex items-center">Careers</Link>
        </div>

        {/* Desktop Entry Actions */}
        <div className="hidden md:flex items-center space-x-4 relative">
<a 
  href="https://tech-talk-dashboards.vercel.app" 
  target="_blank" 
  rel="noopener noreferrer" 
  onClick={() => setIsOpen(false)} 
  className="hover:text-secondary"
>
  Login
</a>
          <div className="flex items-center space-x-3">
            <Link href="/book-class">
              <button className="bg-secondary text-background px-4 py-2 rounded-xl font-bold shadow-btn hover:bg-secondary-dark transition">
                Book Trial
              </button>
            </Link>
            <Link
              href="/donate"
              className="text-sm text-primary font-medium hover:text-secondary animate-pulse"
              title="Support Education Worldwide"
            >
              📚 Empower a Learner
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-background shadow-md">
          <div className="flex flex-col items-center py-6 space-y-4 text-text font-medium">
            <button onClick={() => handleScrollTo("pricing")} className="hover:text-secondary">Pricing</button>
            <button onClick={() => handleScrollTo("contact")} className="hover:text-secondary">Contact</button>
            <button onClick={() => handleScrollTo("programs")} className="hover:text-secondary">Courses</button>
            <Link href="/careers" onClick={() => setIsOpen(false)} className="hover:text-secondary">Careers</Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="hover:text-secondary">Login</Link>

            <div className="flex items-center space-x-2">
              <Link href="/book-class" onClick={() => setIsOpen(false)}>
                <button className="bg-secondary text-background px-4 py-2 rounded-xl font-bold shadow-btn hover:bg-secondary-dark">
                  Book Trial
                </button>
              </Link>
              <Link
                href="/donate"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 animate-pulse transition"
              >
                📚 Empower a Learner
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}