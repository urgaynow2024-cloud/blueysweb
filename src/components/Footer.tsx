"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[var(--border)] overflow-hidden">
      {/* Accent top border + glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[var(--accent)] opacity-[0.06] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group font-display">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-lg shadow-[var(--accent)]/15 group-hover:shadow-[var(--accent)]/30 transition-shadow">
                B
              </span>
              Bluey<span className="text-[var(--accent)]">'s</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              Custom VRChat avatars crafted in Blender & Unity. Edits, overhauls, and polish with care.
            </p>
          </div>

          <div className="md:justify-self-center">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] mb-5">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/pricing", label: "Pricing" },
                { href: "/faq", label: "FAQ" },
                { href: "/portfolio", label: "Portfolio" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[var(--text-secondary)] hover:text-white hover:translate-x-1 inline-block transition-all">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:justify-self-end">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-dim)] mb-5">
              Get in touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-white hover:translate-x-1 inline-block transition-all">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/commission" className="text-[var(--text-secondary)] hover:text-white hover:translate-x-1 inline-block transition-all">
                  Commission
                </Link>
              </li>
              <li>
                <Link href="/tos" className="text-[var(--text-secondary)] hover:text-white hover:translate-x-1 inline-block transition-all">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-5 text-sm text-[var(--text-dim)]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-xs font-bold">
              B
            </span>
            <span>© {new Date().getFullYear()} Bluey&rsquo;s Avatar Commissions</span>
          </div>
          <div className="flex gap-7">
            <Link href="/tos" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
