import type { Adoptable, AdoptableGalleryImage } from "@/types/database";
import { isPubliclyListed, normalizeStatus } from "./status";

/** The single public bucket every adoptable asset is written to. */
export const ADOPTABLE_BUCKET = "portfolio-images";

/**
 * Extensions that genuinely cannot be drawn in an artwork frame.
 *
 * The gallery upload config also accepts video, and a bare `<img src>` pointed
 * at an mp4 renders as a broken image.
 */
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;

function supabaseProjectUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url ? url.replace(/\/+$/, "") : null;
}

/** Builds the public object URL for a storage path in the portfolio bucket. */
export function publicUrlForPath(path: string | null | undefined): string | null {
  const base = supabaseProjectUrl();
  if (!base || !path) return null;
  const clean = path.replace(/^\/+/, "").replace(/^\/+/, "");
  if (!clean) return null;
  return `${base}/storage/v1/object/public/${ADOPTABLE_BUCKET}/${clean}`;
}

/**
 * True when the URL is worth handing to an `<img>`.
 *
 * Deliberately does NOT require an image extension. Supabase stores some objects
 * under opaque names — the live gallery images on this project are all named
 * `<uuid>.blob` and serve `image/webp` — so an extension check would discard
 * real, working artwork. Videos are rejected because they genuinely cannot be
 * drawn, and signed endpoints are rejected because a stored reference to one has
 * expired. Anything else is attempted and falls back gracefully on `onError`.
 */
export function isRenderableImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const value = url.trim();
  if (!value) return false;
  if (VIDEO_EXTENSIONS.test(value)) return false;
  if (value.startsWith("data:image/") || value.startsWith("blob:")) return true;
  if (!/^https?:\/\//i.test(value)) return false;
  // Supabase public objects always carry an extension; a URL without one is
  // usually a signed/object endpoint that has expired.
  if (/\/object\/(sign|authenticated)\//i.test(value)) return false;
  return true;
}

/**
 * Returns a URL that can actually be loaded for a stored media reference.
 *
 * This is the fix for the empty artwork frame on the public page. Legacy rows
 * can hold any of the following, all of which fail to render:
 *   * a URL into the private `adoptables` bucket (schema declares it non-public);
 *   * an expired `/object/sign/` URL;
 *   * a bare storage path stored in the `url` column;
 *   * a missing URL but a valid `path` (the artwork exists in storage);
 *   * a URL pointing at a video, which cannot be drawn in an artwork frame.
 *
 * Returns `null` when nothing usable can be derived, so callers render a proper
 * fallback instead of a solid placeholder block.
 */
/**
 * Recovers a storage path from a full Supabase object URL.
 *
 * `path` is sometimes populated with a whole object URL rather than a bare path.
 * The bucket has to be matched explicitly: for the public `portfolio-images`
 * bucket the remainder is already the path, whereas the legacy private
 * `adoptables` bucket stored objects under an `adoptables/` prefix that has to be
 * kept so the object can be found in the public bucket.
 */
function pathFromObjectUrl(url: string): string | null {
  const match = url.trim().match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#]+)\/([^?#]+)/i,
  );
  if (!match) return null;
  const bucket = match[1];
  // Query strings and fragments are not part of the stored object path.
  const rest = match[2];
  return bucket.toLowerCase() === ADOPTABLE_BUCKET ? rest : `${bucket}/${rest}`;
}

export function resolveMediaUrl(
  url: string | null | undefined,
  path?: string | null,
): string | null {
  const raw = (url ?? "").trim();

  if (raw && /^https?:\/\//i.test(raw)) {
    if (isRenderableImageUrl(raw)) {
      const unusableBucket =
        /\/storage\/v1\/object\/(sign|authenticated)\/adoptables\//i.test(raw) ||
        /\/storage\/v1\/object\/public\/adoptables\//i.test(raw);
      if (!unusableBucket) return raw;
      // Fall through: the same object may live in the public bucket.
    }
  }

  // The explicit `path` argument is authoritative: it is the column the app
  // writes on every upload, so it must win over anything parsed out of `url`.
  const fromPathArg = (path ?? "").trim();
  const rawIsBarePath = raw && !/^(https?:\/\/|data:|blob:)/i.test(raw);

  const candidatePath =
    pathFromObjectUrl(fromPathArg) ??
    fromPathArg.replace(/^\/+/, "") ??
    "";

  const resolvedPath = candidatePath || pathFromObjectUrl(raw) || (rawIsBarePath ? raw : "");

  // A candidate that is neither a nested path nor a file-like name is not a
  // storage object, so it is rejected rather than turned into a plausible but
  // guaranteed-404 URL.
  if (!/[./]/.test(resolvedPath)) return null;

  const derived = publicUrlForPath(resolvedPath);
  if (derived && isRenderableImageUrl(derived)) return derived;

  return null;
}

export interface AdoptableArtwork {
  url: string;
  /** Where the artwork came from, used for admin hints and diagnostics. */
  source: "main" | "gallery";
  galleryImage?: AdoptableGalleryImage;
}

/**
 * Picks the artwork that represents an adoptable: the main image when present,
 * otherwise the first SFW gallery image, otherwise any gallery image.
 * Used by the public cards, the public hero, and the admin cards.
 */
export function pickAdoptableArtwork(
  adoptable: Adoptable | null | undefined,
  gallery: AdoptableGalleryImage[] = [],
): AdoptableArtwork | null {
  if (!adoptable) return null;

  const main = resolveMediaUrl(adoptable.main_image, adoptable.main_image_path);
  if (main) return { url: main, source: "main" };

  // Scan every gallery entry rather than only the first two: a leading entry can
  // be a video or a dead URL, and stopping at it left the card with no artwork.
  const ordered = [
    ...gallery.filter((img) => !img.is_nsfw),
    ...gallery.filter((img) => img.is_nsfw),
  ];

  for (const img of ordered) {
    const url = resolveMediaUrl(img.url, img.path ?? img.storage_path);
    if (url) return { url, source: "gallery", galleryImage: img };
  }

  return null;
}

export interface HeroArtwork {
  adoptable: Adoptable;
  artwork: AdoptableArtwork;
}

/**
 * Chooses the adoptable whose artwork fills the public hero panel, returning the
 * adoptable alongside its artwork so the caption can name it.
 *
 * Preference order: a featured adoptable that is still listed (the admin
 * curated it), then any listed adoptable that is available, then any listed
 * adoptable, and finally anything with artwork at all. Falling all the way
 * through to sold/hidden rows means the hero is never empty just because
 * everything has been claimed.
 */
export function pickHeroArtwork(
  adoptables: Adoptable[],
  galleryMap: Record<string, AdoptableGalleryImage[]> = {},
): HeroArtwork | null {
  const withArtwork = (list: Adoptable[]) =>
    list
      .map((adoptable) => ({
        adoptable,
        artwork: pickAdoptableArtwork(adoptable, galleryMap[adoptable.id] ?? []),
      }))
      .filter((entry): entry is HeroArtwork => Boolean(entry.artwork));

  const listed = adoptables.filter((a) => isPubliclyListed(normalizeStatus(a.availability)));
  const candidates = withArtwork(listed.length > 0 ? listed : adoptables);
  if (candidates.length === 0) return null;

  const featured = candidates.find((entry) => entry.adoptable.featured);
  if (featured) return featured;

  const available = candidates.find(
    (entry) => normalizeStatus(entry.adoptable.availability) === "available",
  );
  return available ?? candidates[0];
}

/**
 * Diagnostic used by the admin media panel so a broken image is explained
 * rather than silently replaced.
 */
export function describeMediaProblem(
  url: string | null | undefined,
  path?: string | null,
): string | null {
  if (resolveMediaUrl(url, path)) return null;
  if (!url && !path) return "No artwork has been uploaded for this adoptable.";
  if (url && VIDEO_EXTENSIONS.test(url)) {
    return "This file is a video and cannot be used as artwork. Upload an image instead.";
  }
  if (url && !path) {
    return "The stored image URL could not be resolved. Re-upload the image to repair it.";
  }
  return "The stored file could not be found in storage. Re-upload the image to repair it.";
}
