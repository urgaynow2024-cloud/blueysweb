import { supabase, isSupabaseConfigured } from "./supabase";
import { pricingTiers, additionalServices, faqItems, workflowSteps, mockReviews, mockPortfolioImages, mockNsfwPortfolioImages } from "../data/site";
import type { Adoptable, AdoptableGalleryImage } from "../types/adoptables";

const FALLBACKS = {
  siteConfig: {
    name: "Bluey's Avatar Commissions",
    tagline: "VRChat Avatar Edits • Blender Work • Unity Setup",
    description: "Clean, stylish, performance-friendly avatars built for VRChat.",
    discord: "BlueyBarks",
    tos_last_updated: "August 2025",
    tos_version: "2.0",
  },
  workflowSteps,
  pricingTiers,
  additionalServices,
  faqItems,
  reviews: mockReviews,
  portfolioImages: mockPortfolioImages,
  nsfwPortfolioImages: mockNsfwPortfolioImages,
  adoptables: [],
  adoptableGallery: [],
};

async function fetchAll<T>(table: string, fallback: T[]): Promise<T[]> {
  if (!isSupabaseConfigured || !supabase) return fallback;
  const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return fallback;
  return data as T[];
}

async function fetchSiteConfig() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.siteConfig;
  const { data, error } = await supabase.from("site_config").select("key, value");
  if (error || !data) return FALLBACKS.siteConfig;
  const result: Record<string, string> = { ...FALLBACKS.siteConfig };
  data.forEach((row: { key: string; value: string }) => { result[row.key] = row.value; });
  return result;
}

export async function getPortfolioImages() {
  return fetchAll("portfolio_images", FALLBACKS.portfolioImages);
}

export async function getApprovedReviews() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.reviews;
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return FALLBACKS.reviews;
  return data;
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
  return fetchAll("pricing_tiers", FALLBACKS.pricingTiers);
}

export async function getFaqItems() {
  return fetchAll("faq_items", FALLBACKS.faqItems);
}

export async function getWorkflowSteps() {
  return fetchAll("workflow_steps", FALLBACKS.workflowSteps);
}

export async function getSiteConfig() {
  return fetchSiteConfig();
}

export async function getSiteImages() {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase.from("site_images").select("*");
  if (error || !data) return {};
  const result: Record<string, { url: string; path?: string }> = {};
  data.forEach((item: { key: string; url: string; path?: string }) => {
    result[item.key] = { url: item.url, path: item.path };
  });
  return result;
}

export async function getNsfwPortfolioImages() {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.nsfwPortfolioImages;
  const { data, error } = await supabase.from("nsfw_portfolio_images").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load NSFW portfolio images:", error);
    return FALLBACKS.nsfwPortfolioImages;
  }
  if (!data || data.length === 0) return FALLBACKS.nsfwPortfolioImages;
  return data;
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
    .insert([{ url, path: storagePath }])
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

  const { data: dbData, error: dbError } = await supabase.from("portfolio_images").insert([{ url }]).select();
  if (dbError || !dbData || dbData.length === 0) {
    console.error("DB insert error:", dbError);
    await supabase.storage.from("portfolio-images").remove([storagePath]);
    return null;
  }

  return { id: dbData[0].id, url, path: storagePath };
}

export async function deleteImage(path: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.storage.from("portfolio-images").remove([path]);
  return !error;
}

export async function addPortfolioImage(url: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from("portfolio_images").insert([{ url }]).select();
  return error ? null : data?.[0];
}

export async function removePortfolioImage(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
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
  return fetchAll("social_links", []);
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
  const { data, error } = await supabase
    .from("tos_sections")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load TOS sections:", error);
    return [];
  }
  return data || [];
}

export async function getAdoptables(): Promise<Adoptable[]> {
  if (!isSupabaseConfigured || !supabase) return FALLBACKS.adoptables;
  const { data, error } = await supabase
    .from("adoptables")
    .select("id, title, description, category, price, availability, featured, visible, sort_order, species, included_items, rules_license, vrchat_info, sfw_price, nsfw_price, bundle_price, sfw_available, nsfw_available, bundle_available, main_image, main_image_path, created_at, updated_at")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    const msg = typeof error === "object" && error && "message" in error ? (error as any).message : String(error);
    if (/relation .* does not exist/i.test(msg) || /schema .* does not exist/i.test(msg) || error.code === "42P01") {
      console.error("Adoptables table is missing in Supabase. Run supabase/schema.sql in the SQL Editor.", error);
      throw new Error("ADOPTABLES_TABLE_MISSING");
    }
    console.error("Failed to load adoptables:", error);
    return FALLBACKS.adoptables;
  }

  if (!data || data.length === 0) return FALLBACKS.adoptables;
  return data;
}

export async function getAdoptableById(id: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("adoptables")
    .select("*")
    .eq("id", id)
    .eq("visible", true)
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
  const { data: uploadData, error: uploadError } = await supabase.storage.from("adoptables").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (uploadError || !uploadData) {
    console.error("Adoptable gallery upload error:", uploadError);
    return null;
  }
  const { data: urlData } = supabase.storage.from("adoptables").getPublicUrl(storagePath);
  const url = urlData.publicUrl;
  const { data: dbData, error: dbError } = await supabase.from("adoptable_gallery").insert([{ adoptable_id: adoptableId, url, path: storagePath, is_nsfw: isNsfw }]).select();
  if (dbError || !dbData || dbData.length === 0) {
    await supabase.storage.from("adoptables").remove([storagePath]);
    return null;
  }
  return { id: dbData[0].id, url, path: storagePath, is_nsfw: isNsfw };
}

export async function deleteAdoptableGalleryImage(id: string, path?: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  if (path) await supabase.storage.from("adoptables").remove([path]);
  const { error } = await supabase.from("adoptable_gallery").delete().eq("id", id);
  return !error;
}

export async function reorderAdoptableGalleryImages(items: { id: string; sort_order: number }[]) {
  if (!isSupabaseConfigured || !supabase) return;
  for (const item of items) {
    const { error } = await supabase.from("adoptable_gallery").update({ sort_order: item.sort_order }).eq("id", item.id);
    if (error) console.error("Adoptable gallery reorder error:", error);
  }
}

export async function getAllAdoptableGalleryImages(): Promise<AdoptableGalleryImage[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("adoptable_gallery")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    const msg = typeof error === "object" && error && "message" in error ? (error as any).message : String(error);
    if (/relation .* does not exist/i.test(msg) || /schema .* does not exist/i.test(msg) || error.code === "42P01") {
      console.error("adoptable_gallery table is missing in Supabase. Run supabase/schema.sql in the SQL Editor.", error);
      throw new Error("ADOPTABLE_GALLERY_TABLE_MISSING");
    }
    console.error("Failed to load adoptable gallery:", error);
    return [];
  }

  return data || [];
}

export async function updateAdoptableStatus(id: string, status: "available" | "sold" | "reserved") {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from("adoptables")
    .update({ availability: status, updated_at: new Date().toISOString() })
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
