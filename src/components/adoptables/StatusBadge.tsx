"use client";

import { CheckCircle2, Clock3, HelpCircle, Sparkles, XCircle, EyeOff } from "lucide-react";
import { ADOPTABLE_STATUS_META, normalizeStatus, type AdoptableStatus } from "@/lib/adoptables/status";

const ICONS: Record<AdoptableStatus, typeof CheckCircle2> = {
  available: CheckCircle2,
  pending: Clock3,
  reserved: Sparkles,
  sold: XCircle,
  hidden: EyeOff,
};

interface StatusBadgeProps {
  status: unknown;
  size?: "sm" | "md";
  className?: string;
}

/** Compact lifecycle badge used across cards, hero and the detail page. */
export function StatusBadge({ status, size = "sm", className = "" }: StatusBadgeProps) {
  const resolved = normalizeStatus(status);
  const meta = ADOPTABLE_STATUS_META[resolved];
  const Icon = ICONS[resolved];

  return (
    <span
      className={`adoptable-status-badge ${meta.text} ${meta.bg} ${meta.border} ${
        size === "md" ? "px-3 py-1 text-[11px]" : "px-2.5 py-[3px] text-[10px]"
      } ${className}`}
    >
      <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
      {meta.label}
    </span>
  );
}

interface StatusPillProps {
  status: unknown;
  className?: string;
}

/** Inline status line with a dot, used in text contexts. */
export function StatusPill({ status, className = "" }: StatusPillProps) {
  const resolved = normalizeStatus(status);
  const meta = ADOPTABLE_STATUS_META[resolved];
  const Icon = ICONS[resolved];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.text} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export { HelpCircle };
