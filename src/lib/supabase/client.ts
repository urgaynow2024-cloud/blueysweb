import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

export const supabaseAdmin = isSupabaseConfigured && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

/**
 * Extracts the Supabase Storage host from the configured URL.
 * Returns null if not configured.
 */
export function getSupabaseStorageHost(): string | null {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

/**
 * Converts a Supabase Storage public object URL to a render API URL
 * for on-the-fly image transformation (resize, format, quality).
 * This avoids Next.js image optimization timeouts for large images.
 *
 * @param objectUrl - The original public object URL from Supabase Storage
 * @param options - Transformation options
 * @returns The render API URL, or the original URL if not a Supabase object URL
 */
export function toSupabaseRenderUrl(
  objectUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: "webp" | "avif" | "png" | "jpg" } = {}
): string {
  const host = getSupabaseStorageHost();
  if (!host) return objectUrl;

  const objectPrefix = `https://${host}/storage/v1/object/public/`;
  const renderPrefix = `https://${host}/storage/v1/render/image/public/`;

  if (!objectUrl.startsWith(objectPrefix)) {
    return objectUrl;
  }

  const path = objectUrl.slice(objectPrefix.length);
  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));
  if (options.format) params.set("format", options.format);

  const query = params.toString();
  return `${renderPrefix}${path}${query ? `?${query}` : ""}`;
}

/**
 * A card-sized thumbnail URL.
 *
 * Supabase's render API can resize a stored object on read, so a gallery card
 * never has to download the original artwork — a 1786x1837 PNG is hundreds of
 * KB where a 320px WebP is a few. This is the read-side equivalent of generating
 * and caching thumbnails at upload time: the resized variant is produced once
 * per (url, width, quality) combination and cached by the CDN, so repeat visits
 * and repeated cards cost a single small request.
 *
 * Originals are never overwritten and never deleted; this only changes the URL
 * the browser asks for, not what is stored.
 */
export function toThumbnailUrl(
  objectUrl: string,
  options: { width?: number; height?: number; quality?: number; format?: "webp" | "avif" | "png" | "jpg" } = {},
): string {
  return toSupabaseRenderUrl(objectUrl, {
    width: options.width ?? 320,
    quality: options.quality ?? 70,
    format: options.format ?? "webp",
    height: options.height,
  });
}
