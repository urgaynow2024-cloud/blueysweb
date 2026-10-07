import { supabase, isSupabaseConfigured } from "./supabase/client";
import { cached } from "./api-cache";
import { pricingTiers, additionalServices, faqItems, workflowSteps, siteConfig } from "../config/site";
import type { Adoptable, AdoptableGalleryImage } from "../types/database";
import type { AdoptableStatus } from "./adoptables/status";
import { normalizeStatus, visibleForStatus } from "./adoptables/status";
import { notConfiguredFailure, toAdoptablesQueryError } from "./adoptables/errors";

/**
 * Fallbacks are only ever used for editorial content that Bluey authored and
 * that is already published on the live site (pricing tiers, FAQ answers,
 * process steps, site branding).
 *
 * Customer-facing records (reviews, portfolio images, NSFW images, credits,
 * adoptables) MUST NOT fall back to anything. If Supabase has zero real
 * records the correct result is an empty list so the UI can render a real
 * empty state. Fabricated reviews or placeholder imagery are never acceptable.
 */
const FALLBACKS = {
  siteConfig,
  workflowSteps,
  pricingTiers,
  additionalServices,
  faqItems,
  reviews: [] as any[],
  portfolioImages: [] as { id: string; url: string; sort_order: number }[],
  nsfwPortfolioImages: [] as { id: string; url: string; sort_order: number }[],
  adoptables: [] as Adoptable[],
  adoptableGallery: [] as AdoptableGalleryImage[],
};

async function fetchAll<T>(table: string, fallback: T[]): Promise<T[]> {
  if (!isSupabaseConfigured || !supabase) return fallback;
  const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fallback;
  return data as T[];
}

async function fetchSiteConfig() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.siteConfig;
  // Shared across the homepage, Hero, FeaturedWork and every page that
  // mounts a component reading site_config — previously each mounted a
  // separate identical query.
  const data = await cached(
    "db:site_config",
    () => supabase!.from("site_config").select("key, value").then((r) => (r.error ? null : r.data)),
  );
  if (!data) return FALLBACKS.siteConfig;
  const result = { ...FALLBACKS.siteConfig } as Record<string, unknown>;
  data.forEach((row: { key: string; value: string }) => { result[row.key] = row.value; });
  return result;
}

export async function getPortfolioImages() {
  return cached("db:portfolio_images", () => fetchAll("portfolio_images", FALLBACKS.portfolioImages));
}

export async function getApprovedReviews() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.reviews;
  return cached("db:reviews_approved", () =>
    supabase!
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => (error || !data || data.length === 0 ? FALLBACKS.reviews : data)),
  );
}

export async function getPendingReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").eq("status", "pending").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getAllReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];
  return data;
}

export async function getPricingTiers() {
  return cached("db:pricing_tiers", () => fetchAll("pricing_tiers", FALLBACKS.pricingTiers));
}

export async function getFaqItems() {
  return cached("db:faq_items", () => fetchAll("faq_items", FALLBACKS.faqItems));
}

export async function getWorkflowSteps() {
  return cached("db:workflow_steps", () => fetchAll("workflow_steps", FALLBACKS.workflowSteps));
}

export async function getSiteConfig() {
  return fetchSiteConfig();
}

export async function getSiteImages() {
  return cached("db:site_images", async () => {
    if (!isSupabaseConfigured || !supabase) return {};
    const { data, error } = await supabase.from("site_images").select("*");
    if (error || !data) return {};
    const result: Record<string, { url: string; path?: string }> = {};
    data.forEach((item: { key: string; url: string; path?: string }) => {
      result[item.key] = { url: item.url, path: item.path };
    });
    return result;
  });
}

export async function getNsfwPortfolioImages() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.nsfwPortfolioImages;
  return cached("db:nsfw_portfolio_images", () =>
    supabase!.from("nsfw_portfolio_images").select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (error) {
        console.error("Failed to load NSFW portfolio images:", error);
        return FALLBACKS.nsfwPortfolioImages;
      }
      if (!data || data.length === 0) return FALLBACKS.nsfwPortfolioImages;
      return data;
    }),
  );
}

export async function uploadNsfwPortfolioImage(file: File) {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `nsfw/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("portfolio-images")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError || !uploadData) {
    console.error("NSFW upload error:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);
  const url = urlData.publicUrl;

  const { data: dbData, error: dbError } = await supabase
    .from("nsfw_portfolio_images")
    .insert([{ url, path: storagePath, original_filename: file.name, mime_type: file.type }])
    .select();

  if (dbError || !dbData || dbData.length === 0) {
    console.error("NSFW DB insert error:", dbError);
    await supabase.storage.from("portfolio-images").remove([storagePath]);
    return null;
  }

  return { id: dbData[0].id, url, path: storagePath };
}

export async function removeNsfwPortfolioImage(id: string, path?: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  
  if (path) {
    const { data, error: fetchError } = await supabase.from("nsfw_portfolio_images").select("id").eq("id", id).single();
    if (fetchError || !data) {
      console.warn("removeNsfwPortfolioImage: no DB record for id", id);
      return false;
    }
    await supabase.storage.from("portfolio-images").remove([path]);
  }

  const { error } = await supabase.from("nsfw_portfolio_images").delete().eq("id", id);
  return !error;
}

export async function reorderNsfwPortfolioImages(items: { id: string; sort_order: number }[]) {
  if (!isSupabaseConfigured || !supabase) return;
  for (const item of items) {
    const { error } = await supabase
      .from("nsfw_portfolio_images")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);
    if (error) console.error("NSFW reorder error:", error);
  }
}

export async function uploadImage(file: File, path?: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${path || "portfolio"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from("portfolio-images").upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error || !data) {
    console.error("Upload error:", error);
    return null;
  }
  const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadPortfolioImage(file: File) {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from("portfolio-images").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (uploadError || !uploadData) {
    console.error("Storage upload error:", uploadError);
    return null;
  }
  const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);
  const url = urlData.publicUrl;

  const { data: dbData, error: dbError } = await supabase.from("portfolio_images").insert([{ url, path: storagePath }]).select();
  if (dbError || !dbData || dbData.length === 0) {
    console.error("DB insert error:", dbError);
    await supabase.storage.from("portfolio-images").remove([storagePath]);
    return null;
  }

  return { id: dbData[0].id, url, path: storagePath };
}

export async function deleteImage(path: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data, error } = await supabase.from("portfolio_images").select("id").eq("path", path).single();
  if (error || !data) {
    console.warn("deleteImage: no DB record found for storage path:", path);
    return false;
  }
  const { error: delError } = await supabase.storage.from("portfolio-images").remove([path]);
  return !delError;
}

export async function addPortfolioImage(url: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from("portfolio_images").insert([{ url }]).select();
  return error ? null : data?.[0];
}

export async function removePortfolioImage(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
   const { data, error: fetchError } = await supabase.from("portfolio_images").select("path").eq("id", id).single();
   if (fetchError || !data) return false;
   if (data.path) {
     const { error: storageError } = await supabase.storage.from("portfolio-images").remove([data.path]);
     if (storageError) console.error("Storage cleanup error:", storageError);
   }
  const { error } = await supabase.from("portfolio_images").delete().eq("id", id);
  return !error;
}

export async function reorderPortfolioImages(items: { id: string; sort_order: number }[]) {
  if (!isSupabaseConfigured || !supabase) return;
  for (const item of items) {
    const { error } = await supabase.from("portfolio_images").update({ sort_order: item.sort_order }).eq("id", item.id);
    if (error) console.error("Reorder error:", error);
  }
}

export async function submitReview(data: { display_name: string; review_text: string; rating: number; image_url?: string }) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("reviews").insert([{ ...data, status: "pending" }]).select();
  return error ? null : result?.[0];
}

export async function approveReview(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  return !error;
}

export async function updateReview(id: string, data: { display_name?: string; review_text?: string; rating?: number; status?: string; hidden?: boolean; image_url?: string | null; updated_at?: string }) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").update(data).eq("id", id);
  return !error;
}

export async function deleteReview(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return !error;
}

export async function getSocialLinks() {
  return cached("db:social_links", () => fetchAll("social_links", []));
}

export async function addSocialLink(data: { name: string; url: string; description?: string }) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("social_links").insert([{ name: data.name, url: data.url, description: data.description || null }]).select();
  return error ? null : result?.[0];
}

export async function updateSocialLink(id: string, data: { name?: string; url?: string; description?: string }) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("social_links").update(data).eq("id", id);
  return !error;
}

export async function deleteSocialLink(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  return !error;
}

export async function getTosSections() {
  if (!isSupabaseConfigured || !supabase) return [];
  return cached("db:tos_sections", () =>
    supabase!
      .from("tos_sections")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load TOS sections:", error);
          return [];
        }
        return data || [];
      }),
  );
}

const ADOPTABLE_COLUMNS =
  "id, title, description, category, price, availability, featured, visible, sort_order, species, included_items, rules_license, vrchat_info, sfw_price, nsfw_price, bundle_price, sfw_price_usd, nsfw_price_usd, bundle_price_usd, sfw_available, nsfw_available, bundle_available, main_image, main_image_path, created_at, updated_at";

export async function getAdoptables(): Promise<Adoptable[]> {
  if (!isSupabaseConfigured || !supabase) throw notConfiguredFailure();

  // `availability` is the single source of truth: HIDDEN adoptables are not
  // listed publicly, and SOLD adoptables stay listed as portfolio history.
  // `visible` is the mirrored column kept for backwards compatibility.
  return cached("db:adoptables", () =>
    supabase!
      .from("adoptables")
      .select(ADOPTABLE_COLUMNS)
      .eq("visible", true)
      .neq("availability", "hidden")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          // Errors are surfaced, not swallowed. Returning `[]` on failure made an RLS
          // denial indistinguishable from a genuinely empty table, which is how a
          // permission problem ends up looking like "no adoptables yet".
          throw toAdoptablesQueryError(error).failure;
        }
        if (!data || data.length === 0) return FALLBACKS.adoptables;
        return data;
      }),
  );
}

export async function getAdoptableById(id: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("adoptables")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
    .neq("availability", "hidden")
    .single();
  if (error || !data) return null;
  return data;
}

export async function getAdoptableGalleryImages(adoptableId: string) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("adoptable_gallery")
    .select("*")
    .eq("adoptable_id", adoptableId)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load adoptable gallery:", error);
    return [];
  }
  return data || [];
}

export async function getAdoptableBeforeAfters(adoptableId?: string) {
  if (!isSupabaseConfigured || !supabase) return [];
  let query = supabase.from("adoptable_before_after").select("*").order("sort_order", { ascending: true });
  if (adoptableId) {
    query = query.eq("adoptable_id", adoptableId);
  }
  const { data, error } = await query;
  if (error) {
    const msg = typeof error === "object" && error && "message" in error ? (error as any).message : String(error);
    if (!/relation .* does not exist/i.test(msg)) {
      console.error("Failed to load adoptable before/after:", error);
    }
    return [];
  }
  return data || [];
}

export async function uploadAdoptableGalleryImage(adoptableId: string, file: File, isNsfw = false) {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `adoptables/${adoptableId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from("portfolio-images").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (uploadError || !uploadData) {
    console.error("Adoptable gallery upload error:", uploadError);
    return null;
  }
  const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);
  const url = urlData.publicUrl;
  const { data: dbData, error: dbError } = await supabase.from("adoptable_gallery").insert([{ adoptable_id: adoptableId, url, path: storagePath, is_nsfw: isNsfw, original_filename: file.name, mime_type: file.type }]).select();
  if (dbError || !dbData || dbData.length === 0) {
    await supabase.storage.from("portfolio-images").remove([storagePath]);
    return null;
  }
  return { id: dbData[0].id, url, path: storagePath, is_nsfw: isNsfw };
}

export async function deleteAdoptableGalleryImage(id: string, path?: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (path) {
    const { data, error: fetchError } = await supabase.from("adoptable_gallery").select("id").eq("id", id).single();
    if (fetchError || !data) {
      console.warn("deleteAdoptableGalleryImage: no DB record for id", id);
      return false;
    }
    await supabase.storage.from("portfolio-images").remove([path]);
  }
  const { error } = await supabase.from("adoptable_gallery").delete().eq("id", id);
  return !error;
}

/**
 * Persists a new gallery ordering through the authenticated API route.
 *
 * The anon client cannot write to `adoptable_gallery` (the RLS write policy
 * requires an authenticated role), so this goes through the admin endpoint
 * instead of issuing updates directly.
 */
export async function reorderAdoptableGalleryImages(
  adoptableId: string,
  items: { id: string; sort_order: number }[],
) {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const response = await fetch(`/api/adoptables/${adoptableId}/gallery`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    return response.ok;
  } catch (error) {
    console.error("Adoptable gallery reorder error:", error);
    return false;
  }
}

export async function getAllAdoptableGalleryImages(): Promise<AdoptableGalleryImage[]> {
  if (!isSupabaseConfigured || !supabase) throw notConfiguredFailure();
  const { data, error } = await supabase
    .from("adoptable_gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw toAdoptablesQueryError(error).failure;
  }

  return data || [];
}

export async function updateAdoptableStatus(id: string, status: AdoptableStatus) {
  if (!isSupabaseConfigured || !supabase) return null;
  const resolved = normalizeStatus(status);
  const { data, error } = await supabase
    .from("adoptables")
    .update({
      availability: resolved,
      visible: visibleForStatus(resolved),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();
  if (error) return null;
  return data?.[0];
}

export async function updateAdoptableMainImage(adoptableId: string, url: string | null, path?: string | null) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("adoptables")
    .update({ main_image: url, main_image_path: path, updated_at: new Date().toISOString() })
    .eq("id", adoptableId)
    .select();
  if (error) return null;
  return data?.[0];
}

export async function getCredits() {
  if (!isSupabaseConfigured || !supabase) return [];
  return cached("db:credits", () =>
    supabase!
      .from("credits")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load credits:", error);
          return [];
        }
        return data || [];
      }),
  );
}
