"use client";

import Link from "next/link";

const EXPLORE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/adoptables", label: "Adoptables" },
  { href: "/credits", label: "Credits" },
];

const CONTACT_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/commission", label: "Commission" },
  { href: "/reviews", label: "Reviews" },
  { href: "/links", label: "Links" },
  { href: "/tos", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Soft cosmic glow at top of footer */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] rounded-full bg-[var(--accent)] opacity-[0.05] blur-[140px]" />
      <div className="pointer-events-none absolute top-0 left-[28%] w-[420px] h-[180px] rounded-full bg-[var(--accent-cosmic)] opacity-[0.04] blur-[110px]" />
      <div className="pointer-events-none absolute top-0 right-[28%] w-[420px] h-[180px] rounded-full bg-[var(--accent-nebula)] opacity-[0.04] blur-[110px]" />

      {/* Soft gradient transition from page to footer */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[var(--bg)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Branding */}
          <div className="md:col-span-5">
            <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group font-display">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-lg shadow-[var(--accent)]/15 group-hover:shadow-[var(--accent)]/30 transition-shadow">
                B
              </span>
              Comisioner<span className="text-[var(--accent)]"> ✦</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              A small creator studio for VRChat avatars — built in Blender &amp; Unity, polished with care, and made to feel unmistakably yours.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://discord.gg/zt48MZm5kD"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                aria-label="Discord"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
              </a>
              <a
                href="/contact"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                aria-label="Contact"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4 md:justify-self-center">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-dim)] mb-4">
              Explore
            </h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm md:grid-cols-1">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 md:justify-self-end">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-dim)] mb-4">
              Get in touch
            </h4>
            <ul className="space-y-2.5 text-sm">
              {CONTACT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar — hairline divider */}
        <div className="mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-[10px] font-bold">
              B
            </span>
            <span suppressHydrationWarning>© {new Date().getFullYear()} Comitioner ✦ Floating among the stars</span>
          </div>
          <div className="flex gap-6">
            <Link href="/tos" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/credits" className="hover:text-white transition-colors">Credits</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}