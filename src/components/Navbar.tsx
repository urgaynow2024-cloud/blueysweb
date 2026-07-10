"use client";

import { useState, useEffect } from "react";
import { Zap, Menu, X, ChevronRight } from "lucide-react";
import { navLinks } from "@/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-3"
      }`}
    >
      <div
        className={`mx-4 md:mx-6 rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-[var(--bg)]/80 backdrop-blur-2xl border border-[var(--border)] shadow-2xl shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 md:h-16 flex items-center justify-between">
          <a
            href="/"
            className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2.5 group"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-lg shadow-[var(--accent)]/20 group-hover:shadow-[var(--accent)]/40 transition-shadow">
              B
            </span>
            <span className="hidden sm:inline">Bluey<span className="text-[var(--accent)]">'s</span></span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/contact"
              className="ml-3 btn-primary !py-2 !px-5 !text-sm !rounded-xl inline-flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Commission
            </a>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 grid place-items-center rounded-xl border border-[var(--border)] bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          open ? "max-h-[480px] opacity-100 mt-2 mx-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[var(--bg)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-2xl px-4 py-5 space-y-1 shadow-2xl shadow-black/40">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all group"
            >
              {link.label}
              <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
            </a>
          ))}
          <a
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 btn-primary w-full !py-3 !text-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Commission Me
          </a>
        </div>
      </div>
    </nav>
  );
}
