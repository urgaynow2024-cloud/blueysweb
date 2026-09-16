import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-nebula opacity-50" />
        <div className="bg-cosmic-fog opacity-50" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group font-display" aria-label={`${siteConfig.name} — home`}>
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-[var(--shadow-md)] group-hover:shadow-[var(--accent-glow)] transition-shadow">
                B
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
              {siteConfig.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {siteConfig.footerNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-4">Information</h4>
            <ul className="space-y-2.5">
              {siteConfig.footerInfo.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <Link href="/commission" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                  Commission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-[10px] font-bold">
                B
              </span>
              <span>© {new Date().getFullYear()} Bluey's Creations</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/tos" className="hover:text-white transition-colors">TOS</Link>
              <Link href="/credits" className="hover:text-white transition-colors">Credits</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}