"use client";

import { useCallback, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveMediaUrl } from "@/lib/adoptables/images";
import { StorageImage } from "@/components/ui/StorageImage";

export interface AdoptableArtworkProps {
  /** Stored URL, which may be missing, stale, signed, or private-bucket. */
  url?: string | null;
  /** Storage path, used to derive a working public URL when `url` cannot load. */
  path?: string | null;
  alt: string;
  className?: string;
  /** Wrapper classes. Defaults to a fill-ready block. */
  wrapperClassName?: string;
  /** Rendered instead of the image when nothing can be loaded. */
  fallbackLabel?: string;
  /**
   * Prominent name shown on the fallback, so an adoptable with no artwork is
   * still identifiable in a grid (e.g. "Thunder" under a lightning icon).
   */
  fallbackName?: string;
  /** Secondary line under the fallback name — the species, for example. */
  fallbackDetail?: string;
  /**
   * Passed through to next/image's `sizes` attribute. Without it the optimizer
   * cannot know how wide the card is and falls back to the largest configured
   * width, which means a 250px card downloads a 1200px+ variant.
   */
  sizes?: string;
  /**
   * Passed through to StorageImage as `aspectRatio` ("4/3"). Reserves the
   * card's height before the first byte arrives, so a grid of photos does not
   * reflow as each one decodes.
   */
  aspectRatio?: string;
  loading?: "lazy" | "eager";
  /**
   * How the image should fit its frame. Stored separately from `className`
   * because callers pass it as a prop rather than embedding it in a class, and
   * the underlying component only renders the image — it never wraps it, so
   * the fit has to be applied as a class here.
   */
  objectFit?: "cover" | "contain";
  onLoaded?: (src: string) => void;
  /** Override the hard load timeout in milliseconds. Defaults to LOAD_TIMEOUT_MS. */
  timeoutMs?: number;
}

/**
 * Hard ceiling on how long a real artwork may take to decode before we give up
 * and show the fallback.
 *
 * Why this exists
 * ---------------
 * The component used to sit in a `loading` state forever once the browser had
 * started fetching the image. A slow origin, a stalled connection, a proxy that
 * never responds, or a server-side render pass that had not yet optimised the
 * asset all left every card on the moderator dashboard spinning with no way
 * out — the `onError` handler only fires on a hard failure, and a genuinely
 * broken-but-200 response can take arbitrarily long to surface.
 *
 * Eight seconds is long enough for any healthy image to arrive and short enough
 * that a stuck card is visibly degraded rather than permanently frozen. It is a
 * client-side safety net only; it does not change what is stored or uploaded.
 */
const LOAD_TIMEOUT_MS = 8000;

/**
 * Artwork frame that never leaves a bare coloured block behind.
 *
 * The public Adoptables page used to render a fixed-aspect frame filled with
 * `--bg-card` and a plain `<img>` with no error handling, so any adoptable whose
 * image was missing, private, signed or pointed at a video produced a large
 * empty rectangle. This component:
 *
 *   1. resolves the stored reference to a URL that can actually load;
 *   2. retries once against the derived public-bucket URL if the stored URL 404s;
 *   3. falls back to an explanatory, non-block placeholder on failure;
 *   4. aborts a stuck load after a hard timeout instead of spinning forever.
 *
 * The actual decode is delegated to `StorageImage`, which wraps next/image and
 * therefore gets WebP/AVIF negotiation, CDN-cached resize variants, and the
 * hard load timeout — so this component no longer bypasses the optimizer with
 * a raw `<img>`.
 */
export function AdoptableArtwork({
  url,
  path,
  alt,
  className = "h-full w-full object-cover",
  wrapperClassName = "",
  fallbackLabel = "Artwork unavailable",
  fallbackName,
  fallbackDetail,
  loading = "lazy",
  objectFit = "cover",
  onLoaded,
  sizes,
  aspectRatio,
  timeoutMs = LOAD_TIMEOUT_MS,
}: AdoptableArtworkProps) {
  const resolved = useMemo(() => resolveMediaUrl(url, path), [url, path]);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  // A stored URL that fails but has a usable storage path is retried once
  // against the derived public-bucket URL, which repairs rows saved before the
  // bucket was made public. StorageImage does not do this itself, so the
  // derived src is handed off here.
  const src = useMemo(() => {
    if (attemptedFallback) return resolveMediaUrl(null, path);
    return resolved;
  }, [attemptedFallback, path, resolved]);

  const handleFailure = useCallback(() => {
    if (!attemptedFallback) {
      const derived = resolveMediaUrl(null, path);
      if (derived && derived !== resolved) {
        setAttemptedFallback(true);
        return;
      }
    }
  }, [attemptedFallback, path, resolved]);

  const heading = fallbackName || fallbackLabel;

  if (!src) {
    return (
      <div
        className={`adoptable-artwork-fallback relative flex flex-col items-center justify-center gap-2 overflow-hidden px-4 text-center ${wrapperClassName}`}
        role="img"
        aria-label={`${alt} — ${fallbackLabel}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/15 via-transparent to-[var(--accent-2)]/10" />
        <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/80 backdrop-blur">
          <ImageOff className="h-5 w-5 text-[var(--text-dim)]" aria-hidden />
        </div>
        <div className="relative min-w-0">
          <p className="truncate text-sm font-semibold text-white">{heading}</p>
          {fallbackDetail ? (
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-dim)]">{fallbackDetail}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // Delegate the actual decode to StorageImage, which wraps next/image and
  // therefore gets WebP/AVIF negotiation, the CDN-cached resize variants, and
  // the hard load timeout. The fallback above is shown when that component
  // reports unavailable or when this component's own retry logic gives up.
  return (
    <StorageImage
      src={src}
      alt={alt}
      fill
      wrapperClassName={wrapperClassName}
      className={`${className} ${fitClass}`}
      unavailableLabel={fallbackLabel}
      unavailableClassName="adoptable-artwork-fallback"
      fallbackName={fallbackName}
      fallbackDetail={fallbackDetail}
      aspectRatio={aspectRatio}
      sizes={sizes}
      loading={loading}
      timeoutMs={timeoutMs}
      onLoaded={onLoaded}
      onError={handleFailure}
    />
  );
}

export default AdoptableArtwork;