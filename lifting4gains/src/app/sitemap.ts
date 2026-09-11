import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/repository";
import { site } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number; frequency: "daily" | "weekly" | "monthly" | "yearly" }> = [
    { path: "", priority: 1, frequency: "weekly" },
    { path: "/shop", priority: 0.9, frequency: "weekly" },
    { path: "/rankings", priority: 0.9, frequency: "weekly" },
    { path: "/bundles", priority: 0.8, frequency: "monthly" },
    { path: "/partners", priority: 0.8, frequency: "monthly" },
    { path: "/about", priority: 0.6, frequency: "monthly" },
    { path: "/faq", priority: 0.6, frequency: "monthly" },
    { path: "/contact", priority: 0.5, frequency: "yearly" },
    { path: "/shipping-returns", priority: 0.4, frequency: "yearly" },
    { path: "/privacy", priority: 0.3, frequency: "yearly" },
    { path: "/terms", priority: 0.3, frequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: route.frequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
