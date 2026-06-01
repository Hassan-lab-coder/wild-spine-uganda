import type { MetadataRoute } from "next";

type PublicRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

export const publicRoutes: PublicRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/gorilla-trekking-uganda", changeFrequency: "weekly", priority: 0.95 },
  { path: "/uganda-gorilla-permit-help", changeFrequency: "weekly", priority: 0.95 },
  { path: "/uganda-luxury-safari", changeFrequency: "weekly", priority: 0.9 },
  { path: "/rwenzori-hiking-tours", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tours", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tours/spine-explorer", changeFrequency: "monthly", priority: 0.85 },
  { path: "/tours/summit-trail", changeFrequency: "monthly", priority: 0.85 },
  { path: "/tours/margherita-expedition", changeFrequency: "monthly", priority: 0.85 },
  { path: "/insights/gorilla-trekking-cost-uganda", changeFrequency: "monthly", priority: 0.82 },
  { path: "/insights/best-time-to-visit-bwindi", changeFrequency: "monthly", priority: 0.82 },
  { path: "/insights/is-uganda-safe-for-tourists", changeFrequency: "monthly", priority: 0.82 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/conservation-membership", changeFrequency: "monthly", priority: 0.7 },
  { path: "/corporate-retreats", changeFrequency: "monthly", priority: 0.75 },
  { path: "/expertise", changeFrequency: "monthly", priority: 0.7 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.75 },
  { path: "/planning", changeFrequency: "monthly", priority: 0.7 },
  { path: "/private-travel", changeFrequency: "monthly", priority: 0.75 },
  { path: "/rare-experience", changeFrequency: "monthly", priority: 0.7 },
  { path: "/reviews", changeFrequency: "monthly", priority: 0.7 },
  { path: "/volunteer", changeFrequency: "monthly", priority: 0.55 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.25 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.25 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.25 },
];

export function publicRouteUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path}`;
}
