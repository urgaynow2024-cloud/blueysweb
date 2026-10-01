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
}

/** A 1x1 (or 0-wide) decode is a placeholder, never real artwork. */
function isDegenerate(width: number, height: number): boolean {
  return width <= 1 || height <= 1;
}

export function StorageImage({
  unavailableLabel = "Image unavailable",
  unavailableClassName = "",
  className = "",
  alt,
  ...props
}: StorageImageProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const imgRef = useRef<HTMLImageElement | null>(null);

  // A new src must reset the state, otherwise a previous failure sticks.
  useEffect(() => {
    setStatus("loading");
  }, [props.src]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      // naturalWidth is the decoded intrinsic width. For a 1x1 placeholder this
      // is 1, which is the only reliable way to spot the corrupt uploads.
      if (isDegenerate(img.naturalWidth, img.naturalHeight)) {
        setStatus("unavailable");
        return;
      }
      setStatus("ready");
    },
    [],
  );

  const handleError = useCallback(() => {
    setStatus("unavailable");
  }, []);

  if (status === "unavailable") {
    const isFill = props.fill === true;
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? `${alt} — ${unavailableLabel}` : unavailableLabel}
        className={`adoptable-artwork-fallback flex flex-col items-center justify-center gap-2 px-4 text-center ${
          isFill ? "absolute inset-0 h-full w-full" : "min-h-[160px] w-full"
        } ${unavailableClassName}`}
      >
        <ImageOff className="h-6 w-6 shrink-0 text-[var(--text-dim)]" aria-hidden />
        <p className="text-[11px] font-medium leading-snug text-[var(--text-dim)]">
          {unavailableLabel}
        </p>
      </div>
    );
  }

  return (
    <>
      {status === "loading" && props.fill === true && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Loader2 className="h-5 w-5 animate-spin text-[var(--text-dim)]" />
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
    </>
  );
}

export default StorageImage;
