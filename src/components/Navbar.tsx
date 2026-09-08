"use client";

import { useState, useEffect, useRef } from "react";
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
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      <div
        className={`mx-auto max-w-6xl px-4 pt-4 md:pt-5 transition-all duration-500 will-change-transform ${
          scrolled
            ? "translate-y-0 opacity-100"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`relative flex items-center justify-between gap-4 ${
            scrolled
              ? "rounded-2xl border border-white/[0.05] bg-[rgba(8,11,18,0.55)] px-4 py-2.5 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)]"
              : "rounded-2xl border border-transparent bg-transparent px-2 py-2"
          }`}
        >
          {/* Logo */}
          <a
            href="/"
            className="group flex items-center gap-3 shrink-0"
            aria-label="Comisioner — home"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] text-sm font-extrabold shadow-lg shadow-[var(--accent)]/25 transition-transform duration-500 group-hover:scale-105">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              B
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:inline font-display">
              Comisioner<span className="text-[var(--accent)]"> ✦</span>
            </span>
          </a>

          {/* Desktop links */}
          <div ref={navRef} className="hidden lg:flex items-center gap-1">
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
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]"
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
            className="hidden lg:inline-flex btn-base btn-primary btn-sm items-center gap-2"
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
            className="lg:hidden grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] bg-white/[0.03] text-white transition-all hover:bg-white/[0.06] hover:border-[var(--border-hover)]"
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
          <div className="glass-strong overflow-hidden rounded-3xl p-3">
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`mobile-nav-link ${
                    active
                      ? "active"
                      : "border border-transparent"
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
              className="mt-3 flex w-full items-center justify-center gap-2 btn-base btn-primary btn-md"
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