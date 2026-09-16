"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const PRIMARY_LINKS = siteConfig.nav;
const MORE_LINKS = siteConfig.moreMenu;
const MOBILE_LINKS = siteConfig.mobileNav;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 80);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !navRef.current) return;
      const focusable = Array.from(
        navRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const allNavLinks = [...PRIMARY_LINKS, ...MORE_LINKS];

  return (
    <nav ref={navRef} className={`site-nav ${scrolled ? "is-scrolled" : ""}`} aria-label="Primary navigation">
      <div className="nav-shell">
        <Link href="/" className="brand-lockup" aria-label={`${siteConfig.name} — home`}>
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-wordmark">
            <strong>Bluey</strong>
            <small>creations</small>
          </span>
        </Link>

        <div className="nav-desktop" role="navigation">
          {PRIMARY_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link ${active ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              className={`nav-link inline-flex items-center gap-1 ${moreOpen ? "active text-white" : ""}`}
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              More
              <ChevronDown className="h-3 w-3" />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full z-40 mt-1 min-w-[12rem] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="nav-link block px-4 py-2"
                      onClick={() => setMoreOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Link href={siteConfig.commissionPath} className="nav-cta">
          <span>Commission</span>
          <ArrowUpRight className="nav-cta-icon" aria-hidden="true" />
        </Link>

        <button
          ref={closeButtonRef}
          type="button"
          className="nav-menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-nav-layer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <div className="mobile-nav-panel">
          <div className="mobile-nav-heading">
            <span className="brand-mark" aria-hidden="true">B</span>
            <div>
              <strong>Explore the studio</strong>
              <small>Art, characters, and commissions</small>
            </div>
          </div>
          <div className="mobile-nav-links">
            {MOBILE_LINKS.map((link, index) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`mobile-nav-link ${active ? "active" : ""}`}
                  style={{ "--link-delay": `${index * 35}ms` } as React.CSSProperties}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="mobile-nav-arrow" aria-hidden="true" />
                </Link>
              );
            })}
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${isActive(pathname, link.href) ? "active" : ""}`}
                style={{ "--link-delay": `${(MOBILE_LINKS.length + MORE_LINKS.indexOf(link)) * 35}ms` } as React.CSSProperties}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                <span>{link.label}</span>
                <ArrowUpRight className="mobile-nav-arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Link
            href={siteConfig.commissionPath}
            className="mobile-nav-cta"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            Start a commission
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <p className="mobile-nav-status">
            <span className="status-dot" />
            Commissions open
          </p>
        </div>
      </div>
    </nav>
  );
}
