/**
 * Shared types for the "What I Won't Do" page.
 *
 * The page is a two-level structure: categories (headings) own items
 * (individual refusals). Both are stored in Supabase and edited from the
 * admin panel; nothing about the content is hardcoded in the frontend.
 */

export interface WontDoCategory {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface WontDoItem {
  id: string;
  category_id: string;
  title: string;
  description: string;
  sort_order: number;
  visible: boolean;
}

/** A category together with the items that belong to it. */
export interface WontDoCategoryView extends WontDoCategory {
  items: WontDoItem[];
}

/** Payload shape returned by `GET /api/wont-do` (public, published only). */
export interface WontDoPublicResponse {
  categories: WontDoCategoryView[];
}

/** Payload shape returned by `GET /api/wont-do/manage` (admin, everything). */
export interface WontDoManageResponse {
  categories: WontDoCategory[];
  items: WontDoItem[];
}
