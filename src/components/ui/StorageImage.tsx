"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff, Loader2 } from "lucide-react";

/**
 * Renders a real image, and refuses to render a fake one.
 *
 * Why this exists
 * ---------------
 * A previous version of the upload pipeline stored a 1x1 pixel WebP of 94 bytes
 * (RGB 0,1,255) instead of the real artwork. A browser loads that successfully —
 * HTTP 200, valid image, no console error — and then stretches the single pixel
 * across the whole container. The result is a large flat blue rectangle that
 * looks like a broken image but is actually a "successful" load. It cannot be
 * caught with an `onError` handler, because nothing errored.
 *
 * The only reliable client-side signal is the decoded intrinsic size, so this
 * component measures it and treats a 1x1 (or otherwise degenerate) image as
 * unavailable.
 *
 * Deliberate behaviour
 * --------------------
 *   * A genuine image is shown exactly as before — no re-encoding, no
 *     downscale, no visual change.
 *   * A 1x1 or failed load renders a neutral "Image unavailable" panel. It is
 *     never a coloured block, and never fabricated artwork.
 *   * `fill` and non-`fill` layouts are both supported, because the components
 *     that use this differ: masonry cards use `fill`, the hero uses `fill`, and
 *     some admin previews use intrinsic sizing.
 */

export interface StorageImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** Shown when the image is missing, corrupt, or fails to load. */
  unavailableLabel?: string;
  /** Extra classes for the neutral unavailable panel. */
  unavailableClassName?: string;
  /**
   * Wrapper classes for the block that holds either the image or the fallback.
   * AdoptableArtwork passes its own `wrapperClassName` here so the fallback
   * frame keeps the same dimensions as the artwork frame it replaces.
   */
  wrapperClassName?: string;
  /**
   * Explicit aspect ratio as "width/height" (e.g. "4/3"). When set, the image
   * reserves its space before the first byte arrives, so a gallery of cards
   * does not jump as each photo decodes. next/image alone cannot infer this
   * for a remote URL, so without it every card reflows on load.
   */
  aspectRatio?: string;
  /**
   * How long a slow or stalled image may take before we give up and show the
   * fallback. A bare `onError` only fires on a hard failure, so a stuck
   * connection left every card spinning forever. Defaults to 8 seconds — long
   * enough for any healthy image to arrive, short enough that a stuck card is
   * visibly degraded rather than permanently frozen.
   */
  timeoutMs?: number;
  /** Fired with the resolved src once a real (non-degenerate) image decodes. */
  onLoaded?: (src: string) => void;
  /** Fired when the image fails to load or is a degenerate placeholder. */
  onError?: () => void;
  /**
   * Prominent name shown on the fallback, so an adoptable with no artwork is
   * still identifiable in a grid (e.g. "Thunder" under a lightning icon).
   */
  fallbackName?: string;
  /** Secondary line under the fallback name — the species, for example. */
  fallbackDetail?: string;
}

/** A 1x1 (or 0-wide) decode is a placeholder, never real artwork. */
function isDegenerate(width: number, height: number): boolean {
  return width <= 1 || height <= 1;
}

function parseRatio(value: string | undefined): [number, number] | null {
  if (!value) return null;
  const [w, h] = value.split("/").map((part) => Number(part.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return [w, h];
}

export function StorageImage({
  unavailableLabel = "Image unavailable",
  unavailableClassName = "",
  wrapperClassName = "",
  className = "",
  aspectRatio,
  timeoutMs = 8000,
  onLoaded,
  onError,
  fallbackName,
  fallbackDetail,
  alt,
  ...props
}: StorageImageProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [timedOut, setTimedOut] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new src resets every transient state, including a previous timeout,
  // otherwise a stuck image would keep the card degraded forever.
  useEffect(() => {
    setStatus("loading");
    setTimedOut(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (props.src) {
      timerRef.current = setTimeout(() => setTimedOut(true), timeoutMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [props.src, timeoutMs]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const img = event.currentTarget;
      // next/image renders lazy `fill` images with a 1x1 transparent GIF as an
      // initial placeholder and swaps in the real source once it intersects.
      // That placeholder fires its own load event, and measuring it would latch
      // a real photograph into the unavailable state. Keep waiting instead.
      if (img.currentSrc?.startsWith("data:")) return;

      // naturalWidth is the decoded intrinsic width. For a 1x1 placeholder this
      // is 1, which is the only reliable way to spot the corrupt uploads.
      if (isDegenerate(img.naturalWidth, img.naturalHeight)) {
        setStatus("unavailable");
        onError?.();
        return;
      }
      setStatus("ready");
      onLoaded?.(img.currentSrc || String(props.src || ""));
    },
    [onLoaded, onError, props.src],
  );

  const handleError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("unavailable");
    onError?.();
  }, [onError]);

  const ratio = parseRatio(aspectRatio);
  const isFill = props.fill === true;

  if (status === "unavailable" || timedOut) {
    const heading = fallbackName || (timedOut ? "Took too long to load" : unavailableLabel);
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? `${alt} — ${unavailableLabel}` : unavailableLabel}
        className={`adoptable-artwork-fallback relative flex flex-col items-center justify-center gap-2 overflow-hidden px-4 text-center ${
          isFill ? "absolute inset-0 h-full w-full" : "min-h-[160px] w-full"
        } ${unavailableClassName}`}
      >
        <ImageOff className="h-6 w-6 shrink-0 text-[var(--text-dim)]" aria-hidden />
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold text-white">{heading}</p>
          {fallbackDetail ? (
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-dim)]">{fallbackDetail}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={isFill ? undefined : "relative"}
      style={
        ratio && !isFill
          ? { aspectRatio: `${ratio[0]} / ${ratio[1]}` }
          : undefined
      }
    >
      {status === "loading" && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isFill ? "" : "min-h-[160px]"
          }`}
          aria-hidden
        >
          <div className="h-7 w-7 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)] animate-spin" />
        </div>
      )}
      <Image
        {...props}
        ref={imgRef}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${status === "ready" ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      />
    </div>
  );
}

export default StorageImage;
