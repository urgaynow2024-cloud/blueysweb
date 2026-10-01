import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE = siteConfig.websiteUrl.replace(/\/$/, "");

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin and API surfaces are not useful to crawlers.
        disallow: ["/admin", "/moderator", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}