import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Uganda Travel Guide | Gorilla Trekking & Safari Planning",
  description:
    "Download the Wild Spine Uganda planning guide for gorilla trekking Uganda, Bwindi permit timing, Rwenzori hiking, and private safari planning.",
  path: "/guide",
  image: "/images/travel/forest-trek.jpg",
  keywords: ["Uganda travel guide", "gorilla trekking Uganda", "Bwindi permit", "Uganda safari planning"],
});

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
