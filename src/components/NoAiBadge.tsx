"use client";

import { useEffect, useState } from "react";
import { getSiteConfig, getSiteImages } from "@/lib/db";
import { NO_AI_HEADING, NO_AI_TAGLINE, showsAtPlacement } from "@/lib/no-ai";

/**
 * Public NO AI badge.
 *
 * Reads the badge image (site_images → "no_ai_badge") and
 * its settings (site_config → no_ai_enabled / no_ai_placement)
 * from the same sources as the rest of the site, so the
 * owner manages everything from the admin panel and never
 * touches code.
 *
 * The image is a completely independent asset: it has its
 * own storage path and its own admin upload control, and
 * nothing here reads or replaces any other icon.
 */
export default function NoAiBadge({ placement }: { placement: "footer" | "home" }) {
  const [visible, setVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [site, images] = await Promise.all([getSiteConfig(), getSiteImages()]);
        if (cancelled) return;
        if (!showsAtPlacement(site, placement)) {
          setVisible(false);
          return;
        }
        setImageUrl(images.no_ai_badge?.url || null);
        setVisible(true);
      } catch {
        // The badge is decorative status text — a failed
        // read must never break the page it sits on.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!visible) return null;

  return (
    <div className="no-ai-badge mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/70 px-6 py-5 text-center backdrop-blur-sm">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="NO AI badge"
          loading="lazy"
          decoding="async"
          className="max-h-16 w-auto max-w-[180px] object-contain"
        />
      )}
      <div>
        <p className="text-sm font-bold tracking-[0.18em] text-white">{NO_AI_HEADING}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{NO_AI_TAGLINE}</p>
      </div>
    </div>
  );
}
