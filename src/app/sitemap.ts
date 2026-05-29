import type { MetadataRoute } from "next";

const siteUrl = "https://www.wildspineuganda.com";

const routes = [
  "",
  "/about",
  "/conservation-membership",
  "/corporate-retreats",
  "/expertise",
  "/gorilla-trekking-uganda",
  "/guide",
  "/planning",
  "/private-travel",
  "/rare-experience",
  "/reviews",
  "/rwenzori-hiking-tours",
  "/tours",
  "/tours/margherita-expedition",
  "/tours/spine-explorer",
  "/tours/summit-trail",
  "/uganda-gorilla-permit-help",
  "/uganda-luxury-safari",
  "/volunteer",
  "/privacy",
  "/refund-policy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/tours") ? 0.85 : 0.7,
  }));
}
