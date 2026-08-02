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

export async function getQueueConfig(): Promise<Record<string, string>> {
  const cfg = await fetchSiteConfig();
  const result: Record<string, string> = {};
  for (const key of ["queue_status", "queue_slots_total", "queue_slots_used", "queue_wait_time", "queue_notes", "queue_last_updated"]) {
    if (cfg[key] !== undefined) result[key] = String(cfg[key]);
  }
  return result;
}

export async function getHomepageSections() {
  return fetchAll("homepage_sections", []);
}

export async function getPortfolioImages() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("portfolio_images")
    .select("id, url, category, sort_order, created_at")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as Array<{ id: string; url: string; category?: string; sort_order: number; created_at: string }>;
}

export async function getApprovedReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .eq("hidden", false)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getPendingReviews() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("reviews").select("*").eq("status", "pending").order("created_at", { ascending: false });
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

export async function getNsfwPortfolioImages() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from("nsfw_portfolio_images").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load NSFW portfolio images:", error);
    return [];
  }
  if (!data) return [];
  return data;
}

export async function uploadNsfwPortfolioImage(file: File) {
  if (!isSupabaseConfigured || !supabase) return null;
  const ext = file.name.split(".").pop();
  const storagePath = `nsfw/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("portfolio-images")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError || !uploadData) {
    console.error("NSFW upload error:", uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(storagePath);
  const url = urlData.publicUrl;

  const { data: dbData, error: dbError } = await supabase
    .from("nsfw_portfolio_images")
    .insert([{ url }])
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

export async function uploadPortfolioImage(file: File, category = "VRChat Avatars") {
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

  const { data: dbData, error: dbError } = await supabase
    .from("portfolio_images")
    .insert([{ url, category }])
    .select();
  if (dbError || !dbData || dbData.length === 0) {
    console.error("DB insert error:", dbError);
    await supabase.storage.from("portfolio-images").remove([storagePath]);
    return null;
  }

  return { id: dbData[0].id, url, path: storagePath, category };
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

export async function getHeroContent() {
  return fetchAll("hero_content", []);
}

export async function addHeroContent(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("hero_content").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateHeroContent(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("hero_content").update(data).eq("id", id);
  return !error;
}

export async function deleteHeroContent(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("hero_content").delete().eq("id", id);
  return !error;
}

// Canonical homepage-stat mapping. Keep in sync with the homepage_stats seed in
// supabase/schema.sql (same keys, labels, and sublabels in the same order).
export const HOMEPAGE_STAT_SEED = [
  { key: "stat_commissions", label: "Commissions", sublabel: "Completed commissions" },
  { key: "stat_clients", label: "Clients", sublabel: "Satisfied clients" },
  { key: "stat_rating", label: "Rating", sublabel: "Average client rating" },
  { key: "stat_reviews", label: "Reviews", sublabel: "Published reviews" },
  { key: "stat_blender", label: "Blender", sublabel: "Years using Blender" },
  { key: "stat_unity", label: "Unity", sublabel: "Years using Unity" },
  { key: "stat_response", label: "Response", sublabel: "Typical first reply time" },
  { key: "stat_delivery", label: "Delivery", sublabel: "Typical turnaround" },
] as const;

export async function getHomepageStats() {
  const fromTable = await fetchAll("homepage_stats", []);
  if (fromTable.length > 0) return fromTable;
  // Fallback: migrate the real stat_* keys that already live in site_config so
  // existing statistics are never lost and the page never shows empty.
  const cfg = await fetchSiteConfig();
  const out: Array<{
    label: string;
    value: string | number;
    suffix: string;
    sublabel: string;
    sort_order: number;
  }> = [];
  HOMEPAGE_STAT_SEED.forEach((m, i) => {
    if (cfg[m.key]) out.push({ label: m.label, value: cfg[m.key], suffix: "", sublabel: m.sublabel, sort_order: i });
  });
  return out;
}

export async function addHomepageStat(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("homepage_stats").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateHomepageStat(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("homepage_stats").update(data).eq("id", id);
  return !error;
}

export async function deleteHomepageStat(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("homepage_stats").delete().eq("id", id);
  return !error;
}

export async function getServices() {
  return fetchAll("services", []);
}

export async function addService(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("services").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateService(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("services").update(data).eq("id", id);
  return !error;
}

export async function deleteService(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("services").delete().eq("id", id);
  return !error;
}

export async function getFbxMashups() {
  return fetchAll("fbx_mashups", []);
}

export async function addFbxMashup(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("fbx_mashups").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateFbxMashup(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("fbx_mashups").update(data).eq("id", id);
  return !error;
}

export async function deleteFbxMashup(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("fbx_mashups").delete().eq("id", id);
  return !error;
}

export async function getBeforeOrderingItems() {
  return fetchAll("before_ordering_items", []);
}

export async function addBeforeOrderingItem(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("before_ordering_items").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateBeforeOrderingItem(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("before_ordering_items").update(data).eq("id", id);
  return !error;
}

export async function deleteBeforeOrderingItem(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("before_ordering_items").delete().eq("id", id);
  return !error;
}

export async function getTosSections() {
  return fetchAll("tos_sections", []);
}

export async function addTosSection(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("tos_sections").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateTosSection(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("tos_sections").update(data).eq("id", id);
  return !error;
}

export async function deleteTosSection(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("tos_sections").delete().eq("id", id);
  return !error;
}

export async function getNavigationItems() {
  return fetchAll("navigation_items", []);
}

export async function addNavigationItem(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("navigation_items").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateNavigationItem(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("navigation_items").update(data).eq("id", id);
  return !error;
}

export async function deleteNavigationItem(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("navigation_items").delete().eq("id", id);
  return !error;
}

export async function getWebsiteSettings() {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase.from("website_settings").select("*");
  if (error || !data) return {};
  const result: Record<string, string> = {};
  data.forEach((item: any) => {
    result[item.key] = item.value;
  });
  return result;
}

export async function updateWebsiteSetting(key: string, value: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("website_settings").upsert({ key, value });
  return !error;
}

export async function getNsfwRules() {
  if (!isSupabaseConfigured || !supabase) {
    return { requirements: [], notAllowed: [], note: "" };
  }
  const { data, error } = await supabase.from("site_config").select("*").eq("key", "nsfw_rules");
  if (error || !data || data.length === 0) {
    return { requirements: [], notAllowed: [], note: "" };
  }
  try {
    return JSON.parse(data[0].value) as { requirements: string[]; notAllowed: string[]; note: string };
  } catch {
    return { requirements: [], notAllowed: [], note: "" };
  }
}

export async function getPortfolioCategories() {
  return fetchAll("portfolio_categories", []);
}

export async function addPortfolioCategory(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("portfolio_categories").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updatePortfolioCategory(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("portfolio_categories").update(data).eq("id", id);
  return !error;
}

export async function deletePortfolioCategory(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("portfolio_categories").delete().eq("id", id);
  return !error;
}

export async function getCommissionFormFields() {
  return fetchAll("commission_form_fields", []);
}

export async function addCommissionFormField(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("commission_form_fields").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateCommissionFormField(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("commission_form_fields").update(data).eq("id", id);
  return !error;
}

export async function deleteCommissionFormField(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("commission_form_fields").delete().eq("id", id);
  return !error;
}

export async function getMediaLibrary() {
  return fetchAll("media_library", []);
}

export async function addMediaLibraryItem(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("media_library").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateMediaLibraryItem(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("media_library").update(data).eq("id", id);
  return !error;
}

export async function deleteMediaLibraryItem(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("media_library").delete().eq("id", id);
  return !error;
}

export async function addHomepageSection(data: any) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: result, error } = await supabase.from("homepage_sections").insert([data]).select();
  return error ? null : result?.[0];
}

export async function updateHomepageSection(id: string, data: any) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("homepage_sections").update(data).eq("id", id);
  return !error;
}

export async function deleteHomepageSection(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from("homepage_sections").delete().eq("id", id);
  return !error;
}

export async function getFbxMashupCommission() {
  return fetchAll("fbx_mashup_commission", []);
}

export async function getFbxMashupCommissionItems() {
  return fetchAll("fbx_mashups", []);
}
