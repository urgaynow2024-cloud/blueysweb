"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const PRIMARY_LINKS = siteConfig.nav;
const MOBILE_LINKS = siteConfig.mobileNav;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

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

  return (
    <nav ref={navRef} className={`site-nav ${scrolled ? "is-scrolled" : ""}`} aria-label="Primary navigation">
      <div className="nav-shell">
        <Link href="/" className="brand-lockup" aria-label="Bluey — home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span className="brand-wordmark">
            <strong>Bluey</strong>
            <small>avatar commissions</small>
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
