"use client";

import { Lock } from "lucide-react";
import type { Adoptable } from "@/types/database";
import { adoptablePriceRows } from "@/lib/adoptables/catalog";

interface PriceListProps {
  adoptable: Adoptable;
  ageVerified: boolean;
  className?: string;
  /** `card` is a compact inline summary, `detail` is the stacked price table. */
  variant?: "card" | "detail";
}

/**
 * Renders only the pricing that is actually configured.
 *
 * An option is shown when it is both enabled and priced, so a disabled SFW/NSFW
 * tier never appears as available and a blank field is never displayed. NSFW and
 * bundle prices stay hidden until the visitor verifies their age.
 */
export function PriceList({ adoptable, ageVerified, className = "", variant = "card" }: PriceListProps) {
  const rows = adoptablePriceRows(adoptable);
  const visible = rows.filter((row) => !row.ageRestricted || ageVerified);

  if (rows.length === 0) {
    return (
      <p className={`text-xs text-[var(--text-dim)] ${className}`}>
        Pricing available on request
      </p>
    );
  }

  if (variant === "card") {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
        {visible.map((row) => (
          <span key={row.id} className="text-xs text-[var(--text-secondary)]">
            {row.id !== "legacy" && (
              <span className="mr-1 uppercase tracking-wider text-[var(--text-dim)]">
                {row.label}
              </span>
            )}
            <strong className={`font-semibold ${row.accent ? "text-white" : "text-rose-300"}`}>
              {row.price}
            </strong>
            {row.priceUsd && (
              <span className="ml-1 text-[var(--text-dim)]">{row.priceUsd}</span>
            )}
          </span>
        ))}
        {visible.length < rows.length && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-dim)]">
            <Lock className="h-3 w-3" aria-hidden />
            Age-restricted
          </span>
        )}
      </div>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {rows.map((row) => {
        const hidden = row.ageRestricted && !ageVerified;
        return (
          <li
            key={row.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white/[0.02] px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              {row.ageRestricted && <Lock className="h-3.5 w-3.5 text-rose-300" aria-hidden />}
              {row.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span
                className={`text-lg font-bold ${
                  hidden ? "text-[var(--text-dim)]" : row.accent ? "text-[var(--accent)]" : "text-rose-300"
                }`}
              >
                {hidden ? "• • •" : row.price}
              </span>
              {!hidden && row.priceUsd && (
                <span className="text-xs text-[var(--text-dim)]">{row.priceUsd}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
