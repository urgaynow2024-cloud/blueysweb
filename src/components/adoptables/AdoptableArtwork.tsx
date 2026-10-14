"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /**
   * Prominent name shown on the fallback, so an adoptable with no artwork is
   * still identifiable in a grid (e.g. "Thunder" under a lightning icon).
   */
  fallbackName?: string;
  /** Secondary line under the fallback name — the species, for example. */
  fallbackDetail?: string;
  loading?: "lazy" | "eager";
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
 *   2. shows a soft shimmer while the request is in flight;
 *   3. retries once against the derived public-bucket URL if the stored URL 404s;
 *   4. falls back to an explanatory, non-block placeholder on failure;
 *   5. aborts a stuck load after a hard timeout instead of spinning forever.
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
  timeoutMs = LOAD_TIMEOUT_MS,
}: AdoptableArtworkProps) {
  const resolved = useMemo(() => resolveMediaUrl(url, path), [url, path]);
  const [state, setState] = useState<ArtworkState>(resolved ? "loading" : "failed");
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new resolved URL resets every transient state, including a previous
  // timeout, otherwise a stuck image would keep the card degraded forever.
  useEffect(() => {
    setAttemptedFallback(false);
    setTimedOut(false);
    setState(resolved ? "loading" : "failed");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (resolved) {
      timerRef.current = setTimeout(() => setTimedOut(true), timeoutMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resolved, timeoutMs]);

  const handleFailure = useCallback(() => {
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

  const handleError = useCallback(() => {
    handleFailure();
  }, [handleFailure]);

  const heading = fallbackName || fallbackLabel;

  if (state === "failed" || timedOut) {
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
