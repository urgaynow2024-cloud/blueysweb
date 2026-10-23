"use client";

import { CircleAlert, Info } from "lucide-react";
import type { Adoptable } from "@/types/database";
import { adoptablePriceRows } from "@/lib/adoptables/catalog";
import { Input } from "@/components/admin/Field";
import { ToggleSwitch } from "./OverviewPanel";

export interface PricingPanelProps {
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
}

type TierKey = "sfw" | "nsfw" | "bundle";

interface TierConfig {
  key: TierKey;
  title: string;
  blurb: string;
  availableField: "sfw_available" | "nsfw_available" | "bundle_available";
  priceField: "sfw_price" | "nsfw_price" | "bundle_price";
  usdField: "sfw_price_usd" | "nsfw_price_usd" | "bundle_price_usd";
}

const TIERS: TierConfig[] = [
  {
    key: "sfw",
    title: "SFW",
    blurb: "Shown to everyone, with no age verification.",
    availableField: "sfw_available",
    priceField: "sfw_price",
    usdField: "sfw_price_usd",
  },
  {
    key: "nsfw",
    title: "NSFW",
    blurb: "Only revealed to visitors who have confirmed their age.",
    availableField: "nsfw_available",
    priceField: "nsfw_price",
    usdField: "nsfw_price_usd",
  },
  {
    key: "bundle",
    title: "Bundle",
    blurb: "One price covering both the SFW and NSFW versions.",
    availableField: "bundle_available",
    priceField: "bundle_price",
    usdField: "bundle_price_usd",
  },
];

/**
 * Builds the pricing half of a save payload.
 *
 * A disabled tier has its price columns cleared so a stale figure left over from
 * a previous edit cannot reappear on the public page if the tier is switched
 * back on later without a new price being typed.
 */
export function buildPricingPatch(value: Adoptable): Partial<Adoptable> {
  const patch: Partial<Adoptable> = {};
  for (const tier of TIERS) {
    const enabled = Boolean(value[tier.availableField]);
    patch[tier.availableField] = enabled;
    patch[tier.priceField] = enabled ? (value[tier.priceField] ?? "").trim() : "";
    patch[tier.usdField] = enabled ? (value[tier.usdField] ?? "").trim() : "";
  }
  return patch;
}

function TierEditor({
  tier,
  value,
  onChange,
}: {
  tier: TierConfig;
  value: Adoptable;
  onChange: (patch: Partial<Adoptable>) => void;
}) {
  const enabled = Boolean(value[tier.availableField]);
  const price = value[tier.priceField] ?? "";
  const usd = value[tier.usdField] ?? "";
  const priceMissing = enabled && price.trim().length === 0;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <ToggleSwitch
        checked={enabled}
        onChange={(next) => onChange({ [tier.availableField]: next } as Partial<Adoptable>)}
        label={`${tier.title} available`}
        hint={tier.blurb}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="ad-label">Price (GBP)</span>
          <Input
            type="text"
            inputMode="decimal"
            value={price}
            disabled={!enabled}
            placeholder={enabled ? "£25" : "Tier disabled"}
            onChange={(event) =>
              onChange({ [tier.priceField]: event.target.value } as Partial<Adoptable>)
            }
            aria-describedby={`${tier.key}-price-hint`}
          />
        </label>
        <label className="block">
          <span className="ad-label">USD (optional)</span>
          <Input
            type="text"
            inputMode="decimal"
            value={usd}
            disabled={!enabled}
            placeholder={enabled ? "$30" : "Tier disabled"}
            onChange={(event) =>
              onChange({ [tier.usdField]: event.target.value } as Partial<Adoptable>)
            }
            aria-describedby={`${tier.key}-price-hint`}
          />
        </label>
      </div>

      <p id={`${tier.key}-price-hint`} className="mt-2 text-xs text-[var(--text-dim)]">
        {enabled
          ? "Type the figure exactly as it should read, including the currency symbol."
          : "Disabled tiers are not shown publicly and their stored prices are cleared on save."}
      </p>

      {priceMissing && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-2.5 py-2 text-[11px] leading-snug text-amber-200">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {tier.title} is switched on but has no price, so it will not be shown publicly. Enter a
            price or switch the tier off.
          </span>
        </p>
      )}
    </section>
  );
}

export function PricingPanel({ value, onChange }: PricingPanelProps) {
  const anyTierEnabled = TIERS.some((tier) => Boolean(value[tier.availableField]));
  // The preview deliberately reads the draft, so the admin sees exactly what a
  // visitor will see for the values currently on screen.
  const rows = adoptablePriceRows(value);

  return (
    <div className="space-y-5">
      {TIERS.map((tier) => (
        <TierEditor key={tier.key} tier={tier} value={value} onChange={onChange} />
      ))}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <label className="block">
          <span className="ad-label">Legacy / original price (GBP)</span>
          <Input
            type="text"
            inputMode="decimal"
            value={value.price ?? ""}
            placeholder="£25"
            onChange={(event) => onChange({ price: event.target.value })}
            aria-describedby="legacy-price-hint"
          />
        </label>
        <p id="legacy-price-hint" className="mt-2 text-xs leading-snug text-[var(--text-dim)]">
          The fallback used only when no tier above is switched on and priced. Leave it empty if you
          never want a fallback price.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Info className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          How this appears publicly
        </h3>

        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {anyTierEnabled
              ? "Nothing is shown. At least one switched-on tier needs a price."
              : "No pricing tiers are switched on, so visitors see “Price on request”. Add the legacy price above if you want a figure instead."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-[var(--text-dim)]">
                  {row.label}
                  {row.ageRestricted && (
                    <span className="ml-2 text-rose-300">age verified only</span>
                  )}
                </span>
                <span className="flex items-baseline gap-2">
                  <span
                    className={`text-base font-semibold ${
                      row.accent ? "text-white" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {row.price}
                  </span>
                  {row.priceUsd && (
                    <span className="text-xs text-[var(--text-dim)]">≈ {row.priceUsd}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}