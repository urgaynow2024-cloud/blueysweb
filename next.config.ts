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
   * Image optimisation.
   *
   * Every portfolio, adoptable, review, credit and hero image is served from
   * Supabase Storage. Without these patterns next/image refuses to optimise
   * remote hosts, and the site was falling back to raw <img> tags with no
   * resizing, no WebP/AVIF negotiation and no lazy loading.
   */
  images: {
    formats: ["image/avif", "image/webp"],
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