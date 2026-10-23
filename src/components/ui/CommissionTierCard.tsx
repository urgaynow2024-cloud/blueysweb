import Link from "next/link";
import { Check } from "lucide-react";

export interface CommissionTier {
  id?: string;
  name: string;
  emoji?: string;
  price: string;
  badge?: string | null;
  popular?: boolean;
  description?: string;
  features?: string[];
}

/**
 * Shared commission-tier card.
 *
 * Used by the Home page, the /services catalogue, /pricing and the
 * /commission page so that a single data source (pricingTiers from
 * config/site.ts or the pricing_tiers table) renders identically
 * everywhere. Changing a tier updates every location automatically.
 */
export default function CommissionTierCard({
  tier,
  href = "/commission",
  ctaLabel,
  showFeatures = true,
}: {
  tier: CommissionTier;
  href?: string;
  ctaLabel?: string;
  showFeatures?: boolean;
}) {
  const popular = !!tier.popular;
  const label = ctaLabel || `Select ${tier.name.split(" ")[0]}`;

  return (
    <div
      className={`group relative flex h-full flex-col rounded-[var(--r-lg)] border bg-[var(--bg-card)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)] md:p-7 ${
        popular
          ? "border-[var(--accent)]/40 shadow-[0_0_30px_-12px_var(--accent-glow)]"
          : "border-[var(--border)]"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-[#04060a] border-none">
          Most Popular
        </span>
      )}
      {tier.badge && !popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-[var(--bg-elevated)] text-[var(--accent)] border-[var(--accent)]/30">
          {tier.badge}
        </span>
      )}

      <div className="flex items-center gap-3">
        {tier.emoji && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-xl transition-transform duration-300 group-hover:scale-110">
            {tier.emoji}
          </span>
        )}
        <h3 className="heading-sm text-white">{tier.name}</h3>
      </div>

      {tier.description && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{tier.description}</p>
      )}

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{tier.price}</span>
      </div>

      {showFeatures && tier.features && tier.features.length > 0 && (
        <>
          <div className="my-5 h-px w-full bg-gradient-to-r from-[var(--border)] to-transparent" />
          <ul className="flex-1 space-y-2.5">
            {tier.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <Link href={href} className={`btn-base w-full justify-center ${popular ? "btn-primary" : "btn-secondary"}`}>
          {label}
        </Link>
      </div>
    </div>
  );
}