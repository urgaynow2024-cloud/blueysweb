import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE = siteConfig.websiteUrl.replace(/\/$/, "");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Single source of truth for public routes lives in config/site.ts so the
  // sitemap can never drift from the navigation.
  const primary = siteConfig.nav.map((item) => ({ href: item.href, priority: 0.8 }));
  const legal = siteConfig.footerLinks.map((item) => ({ href: item.href, priority: 0.4 }));

  const routes = [
    { href: siteConfig.commissionPath, priority: 0.9 },
    { href: "/pricing", priority: 0.8 },
    { href: "/about", priority: 0.6 },
    ...primary,
    ...legal,
  ];

  const seen = new Set<string>();

  return routes
    .filter((route) => {
      if (!route.href || route.href.startsWith("#")) return false;
      if (seen.has(route.href)) return false;
      seen.add(route.href);
      return true;
    })
    .map((route) => ({
      url: `${BASE}${route.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    }));
}