import type { MetadataRoute } from "next";
import { publicRoutes, publicRouteUrl } from "@/lib/public-routes";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-01T00:00:00.000Z");

  return publicRoutes.map((route) => ({
    url: publicRouteUrl(siteUrl, route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
