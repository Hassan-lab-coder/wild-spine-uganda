import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Gorilla Trekking Guide 2026",
  description:
    "Download the Wild Spine Uganda Gorilla Trekking Guide 2026 for Bwindi permit timing, safety basics, packing notes, and private journey planning.",
  path: "/guide",
  image: "/images/travel/forest-trek.jpg",
  keywords: ["Gorilla Trekking Guide 2026", "gorilla trekking Uganda", "Bwindi permit", "Uganda safari planning"],
});

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
