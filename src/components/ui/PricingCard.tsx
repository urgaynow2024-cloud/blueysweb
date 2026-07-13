import { Check, ArrowRight } from "lucide-react";

export interface PricingTier {
  id?: string;
  name: string;
  emoji?: string;
  price: string;
  badge?: string | null;
  popular?: boolean;
  features?: string[];
}

export default function PricingCard({
  tier,
  href = "/contact",
  ctaLabel = "Request",
}: {
  tier: PricingTier;
  href?: string;
  ctaLabel?: string;
}) {
  const popular = !!tier.popular;

  return (
    <div
      className={`group relative flex h-full flex-col rounded-[var(--r-lg)] p-7 transition-all duration-500 md:p-8 ${
        popular
          ? "glow-border border border-[var(--accent)]/60 bg-[var(--accent-soft)] shadow-[var(--shadow-glow)] md:-translate-y-2 md:hover:-translate-y-3"
          : "premium-card border border-[var(--border)]"
      }`}
    >
      {/* Ambient glow for popular tier (clipped to the card so it doesn't affect the badge) */}
      {popular && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--r-lg)]">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[var(--accent)] opacity-[0.12] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]" />
        </div>
      )}

      {tier.badge && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#04060a] shadow-lg shadow-[var(--accent)]/25">
          {tier.badge}
        </span>
      )}

      <div className="relative flex items-center gap-3">
        {tier.emoji && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
            {tier.emoji}
          </span>
        )}
        <h3 className="text-base font-semibold leading-tight text-white md:text-lg">{tier.name}</h3>
      </div>

      <div className="relative mt-6 flex items-baseline gap-2">
        <p className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">{tier.price}</p>
      </div>
      <p className="relative mt-1.5 text-xs uppercase tracking-wider text-[var(--text-dim)]">Per avatar</p>

      <div className="relative my-6 h-px w-full bg-gradient-to-r from-[var(--border-strong)] to-transparent" />

      <ul className="relative mb-8 flex-1 space-y-3.5">
        {tier.features?.map((feat) => (
          <li key={feat} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <Check className="h-3 w-3" />
            </span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className={`relative flex items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 ${
          popular
            ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] text-[#04060a] shadow-lg shadow-[var(--accent)]/20 hover:brightness-105"
            : "border border-[var(--border-strong)] text-white hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
        }`}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
