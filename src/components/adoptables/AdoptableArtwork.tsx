"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { resolveMediaUrl } from "@/lib/adoptables/images";

type ArtworkState = "loading" | "ready" | "failed";

interface AdoptableArtworkProps {
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
  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain";
  onLoaded?: (src: string) => void;
}

/**
 * Artwork frame that never leaves a bare coloured block behind.
 *
 * The public Adoptables page used to render a fixed-aspect frame filled with
 * `--bg-card` and a plain `<img>` with no error handling, so any adoptable whose
 * image was missing, private, signed or pointed at a video produced a large
 * empty rectangle. This component:
 *
 *   1. resolves the stored reference to a URL that can actually load;
 *   2. shows a soft shimmer while the request is in flight;
 *   3. retries once against the derived public-bucket URL if the stored URL 404s;
 *   4. falls back to an explanatory, non-block placeholder on failure.
 */
export function AdoptableArtwork({
  url,
  path,
  alt,
  className = "h-full w-full object-cover",
  wrapperClassName = "",
  fallbackLabel = "Artwork unavailable",
  loading = "lazy",
  objectFit = "cover",
  onLoaded,
}: AdoptableArtworkProps) {
  const resolved = useMemo(() => resolveMediaUrl(url, path), [url, path]);
  const [state, setState] = useState<ArtworkState>(resolved ? "loading" : "failed");
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  useEffect(() => {
    setAttemptedFallback(false);
    setState(resolved ? "loading" : "failed");
  }, [resolved]);

  const handleError = useCallback(() => {
    // A stored URL that fails but has a usable storage path is retried once
    // against the derived public URL, which repairs rows saved before the
    // bucket was made public.
    if (!attemptedFallback) {
      const derived = resolveMediaUrl(null, path);
      if (derived && derived !== resolved) {
        setAttemptedFallback(true);
        setState("loading");
        return;
      }
    }
    setState("failed");
  }, [attemptedFallback, path, resolved]);

  if (state === "failed") {
    return (
      <div
        className={`adoptable-artwork-fallback flex flex-col items-center justify-center gap-2 px-4 text-center ${wrapperClassName}`}
        role="img"
        aria-label={`${alt} — ${fallbackLabel}`}
      >
        <ImageOff className="h-7 w-7 shrink-0 text-[var(--text-dim)]" aria-hidden />
        <p className="text-[11px] font-medium leading-snug text-[var(--text-dim)]">
          {fallbackLabel}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {state === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <Loader2 className="h-5 w-5 animate-spin text-[var(--text-dim)]" />
        </div>
      )}
      {/* The retry is driven by a keyed remount so a failed request re-runs
          against the derived URL instead of being cached by the browser. */}
      <img
        key={attemptedFallback ? "fallback" : "primary"}
        src={resolved ?? ""}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={(event) => {
          // A 1x1 WebP loads successfully, so `onError` never fires for it, and
          // the browser stretches that single pixel over the whole frame — the
          // flat blue rectangle this component is meant to prevent. The decoded
          // intrinsic size is the only reliable signal, so check it here too.
          const img = event.currentTarget;
          if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
            handleError();
            return;
          }
          setState("ready");
          if (resolved) onLoaded?.(resolved);
        }}
        onError={handleError}
        className={`${className} ${state === "ready" ? "opacity-100" : "opacity-0"} ${
          objectFit === "contain" ? "object-contain" : "object-cover"
        } transition-opacity duration-500`}
      />
    </div>
  );
}
