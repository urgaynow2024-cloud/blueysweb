import { supabase, isSupabaseConfigured } from "./supabase";

const FALLBACKS = {
  siteConfig: {
    name: "Bluey's Avatar Commissions",
    tagline: "VRChat Avatar Edits • Blender Work • Unity Setup",
    description: "Clean, stylish, performance-friendly avatars built for VRChat.",
    discord: "BlueyBarks",
  },
  workflowSteps: [
    { emoji: "💬", title: "Request", desc: "Message me with what you're looking for and your avatar base" },
    { emoji: "📋", title: "Planning", desc: "We discuss details and I provide a detailed quote" },
    { emoji: "🎨", title: "Development", desc: "I work on your avatar with regular progress updates" },
    { emoji: "🔁", title: "Revisions", desc: "You review the work and request any changes" },
    { emoji: "📦", title: "Delivery", desc: "Final files sent after payment is complete" },
  ],
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
  const result: any = { ...FALLBACKS.siteConfig };
  data.forEach((row: any) => { result[row.key] = row.value; });
  return result;
}

export async function getPortfolioImages() {
  return fetchAll("portfolio_images", []);
}

export async function getApprovedReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getPendingReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").eq("approved", false).order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getAllReviews() {
  return fetchAll("reviews", []);
}

export async function getPricingTiers() {
  return fetchAll("pricing_tiers", []);
}

export async function getFaqItems() {
  return fetchAll("faq_items", []);
}

export async function getWorkflowSteps() {
  return fetchAll("workflow_steps", []);
}

export async function getSiteConfig() {
  return fetchSiteConfig();
}

export async function getSiteImages() {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase.from("site_images").select("*");
  if (error || !data) return {};
  const result: Record<string, { url: string; path?: string }> = {};
  data.forEach((item: any) => {
    result[item.key] = { url: item.url, path: item.path };
  });
  return result;
}

export async function uploadImage(file: File, path?: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop();
  const fileName = `${path || "portfolio"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from("portfolio-images").upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
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
  const ext = file.name.split(".").pop();
  const storagePath = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from("portfolio-images").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: true,
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

export async function submitReview(data: { name: string; text: string; star_rating: number; image_url?: string; project?: string }) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("reviews").insert([{ ...data, approved: false }]).select();
  return error ? null : result?.[0];
}

export async function approveReview(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
  return !error;
}

export async function updateReview(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").update(data).eq("id", id);
  return !error;
}

export async function deleteReview(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return !error;
}
