import Link from "next/link";
import { siteConfig } from "@/config/site";

const EXPLORE_LINKS = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/commission", label: "Commissions" },
  { href: "/adoptables", label: "Adoptables" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/tos", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="flex flex-col items-center gap-8 text-center">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 group font-display" aria-label="Bluey — home">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-sm font-bold shadow-[var(--shadow-md)] group-hover:shadow-[var(--accent-glow)] transition-shadow">
                B
              </span>
              Bluey
            </Link>
            <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
              Avatar creator • VRChat artist
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {EXPLORE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="w-full max-w-xs">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
          </div>

          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            aria-label="Discord"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 01.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
            </svg>
            Discord
          </a>

          <div className="flex flex-col items-center gap-3 text-xs text-[var(--text-dim)]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-[#05070a] text-[10px] font-bold">
                B
              </span>
              <span>© {new Date().getFullYear()} Bluey</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}