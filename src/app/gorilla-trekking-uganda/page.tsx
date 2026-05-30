import { seoMetadata } from "@/lib/seo";
import SeoLandingPage from "../components/SeoLandingPage";

export const metadata = seoMetadata({
  title: "Gorilla Trekking Uganda | Private Bwindi Forest Planning",
  description:
    "Plan private gorilla trekking in Uganda with Bwindi permit guidance, sector advice, lodge planning, safe transfers, and local Wild Spine Uganda expertise.",
  path: "/gorilla-trekking-uganda",
  image: "/images/travel/forest-guide.jpg",
  keywords: ["gorilla trekking Uganda", "Bwindi forest experience", "Uganda gorilla permit", "private Uganda safari"],
});

export default function GorillaTrekkingUgandaPage() {
  return (
    <SeoLandingPage
      kicker="Gorilla trekking Uganda"
      title="Stand face to face with mountain gorillas in Bwindi."
      description="Plan a private gorilla trekking Uganda journey with permit guidance, realistic transfers, carefully matched lodges, and local expertise that makes the forest feel safe, rare, and deeply moving."
      image="/images/travel/forest-guide.jpg"
      route="The Spine Explorer"
      cta="Request Your Gorilla Trek Plan"
      bullets={["Permit timing guidance before you commit", "Bwindi route and lodge support by sector", "Private driver and guide coordination", "Optional safari, lake, or Rwenzori extensions"]}
      faqs={[
        ["When should I book permits?", "As early as possible, especially around peak travel months. Permit availability can decide the sector, lodge area, and route."],
        ["Is trekking difficult?", "It can be moderate or demanding depending on the gorilla family location. We help set honest expectations before you arrive."],
        ["Can this be private?", "Yes. Transfers, planning, lodge selection, and pacing can be private for your group."],
        ["Can I add other parks?", "Yes. Queen Elizabeth, Lake Bunyonyi, and Rwenzori extensions can turn the trek into a richer Uganda safari experience."],
      ]}
    />
  );
}
