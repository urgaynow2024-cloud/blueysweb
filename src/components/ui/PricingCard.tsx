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
          ? "border border-[var(--accent)]/40 bg-[rgba(124,58,237,0.04)] shadow-[0_18px_40px_-20px_rgba(124,58,237,0.35)] md:-translate-y-2 md:hover:-translate-y-3"
          : "border border-[var(--border)] bg-[rgba(255,255,255,0.02)] hover:border-[var(--border-strong)]"
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-4)] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#04060a] shadow-lg shadow-[var(--accent)]/25">
          {tier.badge}
        </span>
      )}

      <div className="relative flex items-center gap-3">
        {tier.emoji && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
            {tier.emoji}
          </span>
        )}
        <h3 className="text-base font-semibold leading-tight text-white md:text-lg">{tier.name}</h3>
      </div>

      <div className="relative mt-6 flex items-baseline gap-2">
        <p className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">{tier.price}</p>
      </div>
      <p className="relative mt-1.5 text-xs uppercase tracking-wider text-[var(--text-dim)]">Per avatar</p>

      <div className="relative my-6 h-px w-full bg-gradient-to-r from-[var(--border)] to-transparent" />

      <ul className="relative mb-8 flex-1 space-y-3">
        {tier.features?.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className={`btn-base btn-md w-full ${
          popular ? "btn-primary" : "btn-secondary"
        }`}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}