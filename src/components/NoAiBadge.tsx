"use client";

import { memo, useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/db";

/**
 * The "NO AI" badge shown on the site to indicate no AI was used in the work.
 *
 * The badge is sized by its natural aspect ratio and constrained by the banner
 * so it never overflows or stretches. It is loaded lazily and only rendered
 * when the owner has enabled it via the admin dashboard.
 */
function NoAiBadgeImpl({ placement: propPlacement }: { placement?: string } = {}) {
  const [config, setConfig] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let mounted = true;
    getSiteConfig()
      .then((c) => { if (mounted) setConfig(c); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const enabled = config?.no_ai_badge_enabled === true;
  const url = config?.no_ai_badge_url;
  const placement = propPlacement || config?.no_ai_badge_placement || "hero";

  if (!enabled || !url) return null;

  // Sizing per placement: hero/section gets a prominent badge; footer gets a compact strip; sticky uses fixed positioning.
  const isFooter = placement === "footer";
  const isSticky = placement === "sticky";
  const baseClass = "no-ai-badge flex items-center justify-center";
  const placementClass = isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative";
  const containerClass = isFooter ? "py-2" : "py-4";
  const imgClass = isFooter
    ? "no-ai-badge-img block max-h-[clamp(20px,2.5vh,32px)] max-w-[clamp(100px,25vw,200px)] w-auto h-auto object-contain drop-shadow-sm"
    : "no-ai-badge-img block max-h-[clamp(40px,6vh,80px)] max-w-[clamp(160px,40vw,480px)] w-auto h-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]";

  return (
    <div
      className={`${baseClass} ${placementClass} ${containerClass}`}
      aria-label="No AI was used in this work"
    >
      <img
        src={url}
        alt="NO AI"
        loading="lazy"
        decoding="async"
        className={imgClass}
        style={{ aspectRatio: "auto" }}
      />
    </div>
  );
}

export const NoAiBadge = memo(NoAiBadgeImpl);