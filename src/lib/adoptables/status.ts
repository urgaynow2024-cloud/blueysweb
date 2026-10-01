import type { AdoptableStatus } from "@/types/database";

export type { AdoptableStatus };

/**
 * The five lifecycle states, in the order an adoptable travels through them.
 * `hidden` is deliberately last: it is a publishing flag, not a sales stage.
 */
export const ADOPTABLE_STATUSES: readonly AdoptableStatus[] = [
  "available",
  "pending",
  "reserved",
  "sold",
  "hidden",
] as const;

export interface AdoptableStatusMeta {
  /** Short uppercase label used on badges and cards. */
  label: string;
  /** Title-case label used in admin selects and confirmations. */
  title: string;
  /** One-line explanation shown in the admin status picker. */
  description: string;
  /** Tailwind text colour. */
  text: string;
  /** Tailwind background colour. */
  bg: string;
  /** Tailwind border colour. */
  border: string;
  /** Solid colour used for the status dot / accent glow. */
  dot: string;
  /** Whether an adoptable in this state can still be claimed. */
  purchasable: boolean;
  /** Whether the adoptable is listed on the public site. */
  publiclyListed: boolean;
}

export const ADOPTABLE_STATUS_META: Record<AdoptableStatus, AdoptableStatusMeta> = {
  available: {
    label: "AVAILABLE",
    title: "Available",
    description: "Publicly listed and open for purchase or claim.",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    purchasable: true,
    publiclyListed: true,
  },
  pending: {
    label: "PENDING",
    title: "Pending",
    description: "Someone is currently claiming this adoptable.",
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
    purchasable: true,
    publiclyListed: true,
  },
  reserved: {
    label: "RESERVED",
    title: "Reserved",
    description: "Held for someone, not yet completed.",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    purchasable: false,
    publiclyListed: true,
  },
  sold: {
    label: "SOLD",
    title: "Sold",
    description: "Sold. Stays in the portfolio with all media and pricing intact.",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    purchasable: false,
    publiclyListed: true,
  },
  hidden: {
    label: "HIDDEN",
    title: "Hidden",
    description: "Kept in the database but removed from the public site.",
    text: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
    purchasable: false,
    publiclyListed: false,
  },
};

const LEGACY_ALIASES: Record<string, AdoptableStatus> = {
  available: "available",
  avail: "available",
  open: "available",
  pending: "pending",
  in_progress: "pending",
  "in-progress": "pending",
  claimed: "pending",
  reserved: "reserved",
  hold: "reserved",
  sold: "sold",
  gone: "sold",
  hidden: "hidden",
  draft: "hidden",
  unpublished: "hidden",
  private: "hidden",
};

const STATUS_SET = new Set<string>(ADOPTABLE_STATUSES);

/**
 * Coerces any stored or user-supplied value into a valid status.
 *
 * Legacy rows may hold mixed case ("Available") or padded values, and old code
 * paths may still send a `visible` boolean instead of a status, so both are
 * accepted. Unknown values fall back to "available" so a typo can never make a
 * live listing disappear from the public site.
 */
export function normalizeStatus(value: unknown, visible?: unknown): AdoptableStatus {
  if (typeof value === "string") {
    const key = value.trim().toLowerCase();
    if (STATUS_SET.has(key)) return key as AdoptableStatus;
    if (LEGACY_ALIASES[key]) return LEGACY_ALIASES[key];
  }

  // Fall back to the legacy visibility flag when no usable status was given.
  if (visible === false) return "hidden";
  return "available";
}

export function isAdoptableStatus(value: unknown): value is AdoptableStatus {
  return typeof value === "string" && STATUS_SET.has(value.trim().toLowerCase());
}

export function statusMeta(status: unknown): AdoptableStatusMeta {
  return ADOPTABLE_STATUS_META[normalizeStatus(status)];
}

/** The `visible` mirror the database expects for a given status. */
export function visibleForStatus(status: AdoptableStatus): boolean {
  return ADOPTABLE_STATUS_META[status].publiclyListed;
}

/** An adoptable can only be claimed while it is available or pending. */
export function canPurchase(status: unknown): boolean {
  return statusMeta(status).purchasable;
}

/** An adoptable is shown on the public site unless it is hidden. */
export function isPubliclyListed(status: unknown): boolean {
  return statusMeta(status).publiclyListed;
}

/** Copy shown to visitors in place of the purchase button. */
export function unavailabilityMessage(status: unknown): string {
  switch (normalizeStatus(status)) {
    case "pending":
      return "This adoptable is currently being claimed. Check back shortly.";
    case "reserved":
      return "This adoptable is reserved and is no longer open for claims.";
    case "sold":
      return "This adoptable is no longer available.";
    case "hidden":
      return "This adoptable is not currently published.";
    default:
      return "This adoptable is not currently available.";
  }
}
