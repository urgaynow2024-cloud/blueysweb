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

export async function getPortfolioItems() {
  return fetchAll("portfolio_items", []);
}

export async function getReviews() {
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

export async function uploadImage(file: File, path?: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${path || "general"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
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

export async function deleteImage(path: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.storage.from("portfolio-images").remove([path]);
  return !error;
}
