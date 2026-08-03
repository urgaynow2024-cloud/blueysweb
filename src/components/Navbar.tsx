"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Zap, Menu, X, ArrowUpRight } from "lucide-react";
import { navLinks } from "@/data/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 pt-3 sm:pt-4">
        <div
          className={`relative flex items-center justify-between gap-4 rounded-2xl transition-all duration-500 ${
            scrolled
              ? "glass py-2 shadow-2xl shadow-black/50"
              : "border border-transparent py-2.5"
          }`}
        >
          {/* Logo */}
          <a
            href="/"
            className="group flex items-center gap-2.5 shrink-0"
            aria-label="Bluey's Commissions — home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] text-sm font-extrabold shadow-lg shadow-[var(--accent)]/30 transition-transform duration-500 group-hover:scale-105">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              B
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:inline font-display">
              Bluey<span className="text-[var(--accent)]">'s</span>
            </span>
          </a>

          {/* Desktop links */}
          <div ref={navRef} className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${
                    active
                      ? "text-white"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-0 rounded-xl bg-[var(--accent-soft)] border border-[var(--border-accent)] -z-10" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <a
            href="/contact"
            className="hidden lg:inline-flex btn-primary !py-2 !px-5 !text-sm !rounded-xl items-center gap-2"
          >
            <Zap className="h-3.5 w-3.5" />
            Commission
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-white/5 text-white transition-all hover:bg-white/10 hover:border-[var(--border-hover)]"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet overlay menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-2xl"
          onClick={() => setOpen(false)}
        />
        <div
          className={`relative mx-auto mt-24 max-w-sm px-4 transition-all duration-500 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
          }`}
        >
          <div className="glass-strong overflow-hidden rounded-3xl p-3 shadow-2xl shadow-black/50">
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-5 py-3.5 text-base font-medium transition-all duration-300 ${
                    active
                      ? "bg-[var(--accent-soft)] text-white border border-[var(--border-accent)]"
                      : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                  style={
                    open
                      ? {
                          animationDelay: `${i * 40}ms`,
                          animation: "animateIn 0.4s var(--ease-out) both",
                        }
                      : undefined
                  }
                >
                  {link.label}
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  )}
                </a>
              );
            })}
            <a
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] px-5 py-3.5 font-bold text-[#04060a]"
              style={
                open
                  ? {
                      animationDelay: `${navLinks.length * 40}ms`,
                      animation: "animateIn 0.4s var(--ease-out) both",
                    }
                  : undefined
              }
            >
              <Zap className="h-4 w-4" />
              Commission Me
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
