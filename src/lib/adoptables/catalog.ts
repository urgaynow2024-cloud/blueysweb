import type { Adoptable } from "@/types/database";

export interface AdoptableCategory {
  value: string;
  label: string;
}

export const ADOPTABLE_CATEGORIES: readonly AdoptableCategory[] = [
  { value: "avatar", label: "Avatar" },
  { value: "character", label: "Character" },
  { value: "adoptable", label: "Adoptable" },
  { value: "outfit", label: "Outfit" },
  { value: "accessory", label: "Accessory" },
  { value: "clothing", label: "Clothing" },
  { value: "texture", label: "Texture" },
  { value: "other", label: "Other" },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  ADOPTABLE_CATEGORIES.map((c) => [c.value, c.label]),
);

const CATEGORY_ALIASES: Record<string, string> = {
  character: "character",
  avatar: "avatar",
  adoptable: "adoptable",
  outfit: "outfit",
  clothes: "clothing",
  clothing: "clothing",
  accessory: "accessory",
  accessories: "accessory",
  texture: "texture",
  textures: "texture",
  other: "other",
  misc: "other",
};

export function categoryLabel(value: string | null | undefined): string {
  const key = (value ?? "").trim().toLowerCase();
  if (!key) return "Adoptable";
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  if (CATEGORY_ALIASES[key]) return CATEGORY_LABELS[CATEGORY_ALIASES[key]] ?? key;
  // Unknown value: title-case it rather than hiding it from the admin.
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function normalizeCategory(value: unknown): string {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!key) return "avatar";
  if (ADOPTABLE_CATEGORIES.some((c) => c.value === key)) return key;
  return CATEGORY_ALIASES[key] ?? "other";
}

export interface AdoptablePriceRow {
  id: "sfw" | "nsfw" | "bundle" | "legacy";
  label: string;
  price: string;
  priceUsd?: string | null;
  /** NSFW rows are only revealed to age-verified visitors. */
  ageRestricted: boolean;
  accent: boolean;
}

/**
 * Builds the pricing rows that are actually meaningful for an adoptable.
 *
 * A pricing option only appears when it is both enabled and carries a price, so
 * a disabled SFW/NSFW tier never renders as "available" and an empty field is
 * never shown to a visitor.
 */
export function adoptablePriceRows(adoptable: Adoptable): AdoptablePriceRow[] {
  const rows: AdoptablePriceRow[] = [];

  if (adoptable.sfw_available && adoptable.sfw_price?.trim()) {
    rows.push({
      id: "sfw",
      label: "SFW",
      price: adoptable.sfw_price.trim(),
      priceUsd: adoptable.sfw_price_usd?.trim() || null,
      ageRestricted: false,
      accent: true,
    });
  }

  if (adoptable.nsfw_available && adoptable.nsfw_price?.trim()) {
    rows.push({
      id: "nsfw",
      label: "NSFW",
      price: adoptable.nsfw_price.trim(),
      priceUsd: adoptable.nsfw_price_usd?.trim() || null,
      ageRestricted: true,
      accent: false,
    });
  }

  if (adoptable.bundle_available && adoptable.bundle_price?.trim()) {
    rows.push({
      id: "bundle",
      label: "SFW + NSFW Bundle",
      price: adoptable.bundle_price.trim(),
      priceUsd: adoptable.bundle_price_usd?.trim() || null,
      ageRestricted: true,
      accent: true,
    });
  }

  if (rows.length === 0 && adoptable.price?.trim()) {
    rows.push({
      id: "legacy",
      label: "Price",
      price: adoptable.price.trim(),
      ageRestricted: false,
      accent: true,
    });
  }

  return rows;
}

/** Compact price summary for cards, e.g. "£25 SFW · £35 NSFW". */
export function adoptablePriceSummary(adoptable: Adoptable, ageVerified: boolean): string {
  const rows = adoptablePriceRows(adoptable).filter(
    (row) => !row.ageRestricted || ageVerified || row.id === "sfw",
  );
  if (rows.length === 0) return "Price on request";
  return rows
    .map((row) => (row.ageRestricted ? `${row.price} ${row.label.toLowerCase()}` : row.price))
    .join(" · ");
}

/** Numeric-ish value used only for sorting; unparseable prices sort last. */
export function priceSortValue(adoptable: Adoptable): number {
  const candidates = [
    adoptable.sfw_available ? adoptable.sfw_price : null,
    adoptable.nsfw_available ? adoptable.nsfw_price : null,
    adoptable.bundle_available ? adoptable.bundle_price : null,
    adoptable.price,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = candidate.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return Number.POSITIVE_INFINITY;
}

export function hasAnyNsfw(adoptable: Adoptable, gallery: { is_nsfw?: boolean }[] = []): boolean {
  if (adoptable.nsfw_available) return true;
  return gallery.some((img) => img.is_nsfw);
}

/** Included-feature bullets parsed from the free-text `included_items` field. */
export function includedFeatureList(adoptable: Adoptable): string[] {
  const raw = adoptable.included_items?.trim();
  if (!raw) return [];
  return raw
    .split(/\r?\n|;/)
    .map((line) => line.replace(/^[-*•\u2022]\s*/, "").trim())
    .filter(Boolean);
}
