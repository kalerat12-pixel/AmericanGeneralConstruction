import type { MetadataRoute } from "next";
import { site } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing useful for a crawler, and we don't want them indexed.
      disallow: ["/cart", "/checkout", "/account", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
