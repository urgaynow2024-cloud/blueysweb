/**
 * Adoptable lifecycle status.
 *
 * Stored in the database as `adoptables.availability` (lower-case TEXT with a
 * 5-value CHECK constraint). This is the single source of truth for both the
 * public site and the admin panel — there is no second availability flag.
 *
 * The legacy `visible` boolean is retained as a mirror (`visible = status !==
 * "hidden"`) for backwards compatibility with any older row or query.
 */
export type AdoptableStatus = "available" | "pending" | "reserved" | "sold" | "hidden";

export interface Adoptable {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price?: string | null;
  availability: AdoptableStatus;
  featured?: boolean;
  visible?: boolean;
  sort_order?: number;
  species?: string | null;
  included_items?: string | null;
  rules_license?: string | null;
  vrchat_info?: string | null;
  sfw_price?: string | null;
  nsfw_price?: string | null;
  bundle_price?: string | null;
  /** Optional USD equivalents, shown alongside the GBP price when set. */
  sfw_price_usd?: string | null;
  nsfw_price_usd?: string | null;
  bundle_price_usd?: string | null;
  sfw_available?: boolean;
  nsfw_available?: boolean;
  bundle_available?: boolean;
  main_image?: string | null;
  main_image_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdoptableGalleryImage {
  id: string;
  adoptable_id: string;
  url: string;
  path?: string | null;
  storage_path?: string | null;
  sort_order?: number;
  is_nsfw?: boolean;
  media_role?: string | null;
  mime_type?: string | null;
  original_filename?: string | null;
  created_at?: string;
}

export interface AdoptableBeforeAfter {
  id: string;
  adoptable_id: string;
  before_url?: string | null;
  after_url?: string | null;
  before_path?: string | null;
  after_path?: string | null;
  label?: string | null;
  sort_order?: number;
  created_at?: string;
}
