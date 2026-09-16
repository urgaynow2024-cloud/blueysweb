export interface Adoptable {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price?: string | null;
  availability: "available" | "sold" | "reserved";
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
  sort_order?: number;
  is_nsfw?: boolean;
  created_at?: string;
}
