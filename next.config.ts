import type { NextConfig } from "next";

/**
 * Supabase project URL, read at build time purely so remote images can be
 * optimised by next/image. Only the host is used — no secrets are exposed and
 * this file is imported on the server.
 */
const SUPABASE_HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Static assets in /public are content-stable, so let
   * browsers cache them aggressively instead of
   * re-requesting the favicon and brand mark on every
   * navigation.
   */
  async headers() {
    return [
      {
        source: "/:file(favicon.svg|bluey-avatar.svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  /**
   * Image optimisation.
   *
   * Every portfolio, adoptable, review, credit and hero image is served from
   * Supabase Storage. Without these patterns next/image refuses to optimise
   * remote hosts, and the site was falling back to raw <img> tags with no
   * resizing, no WebP/AVIF negotiation and no lazy loading.
   */
  images: {
    formats: ["image/avif", "image/webp"],

    /**
     * Widths the optimizer is allowed to produce.
     *
     * Next's default tops out at 3840, which made browsers request a 3840px
     * variant of sources that are far smaller than that — the largest review
     * photo here is 2350x1322, so 3840 is a pure upscale. Optimizing a 4.2MB
     * PNG to that width reliably took over seven seconds and returned HTTP 500,
     * which is what left review images failing on wide/high-DPR displays.
     *
     * Capping at 2560 keeps a sensible 2x asset for the largest artwork while
     * never asking the optimizer for a size these sources cannot justify.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],

    remotePatterns: [
      // Supabase Storage public/signed asset host.
      ...(SUPABASE_HOST
        ? [
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/**",
            },
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/render/image/**",
            },
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/sign/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;