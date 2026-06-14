import { seoMetadata } from "@/lib/seo";
import InsightArticle from "../InsightArticle";

export const metadata = seoMetadata({
  title: "Gorilla Trekking Cost Uganda 2026",
  description:
    "A practical guide to Uganda gorilla trekking costs, permits, Bwindi sectors, lodges, transfers, and private safari planning.",
  path: "/insights/gorilla-trekking-cost-uganda",
  image: "/images/travel/forest-guide.jpg",
  keywords: ["gorilla trekking cost Uganda", "Uganda gorilla permit cost", "Bwindi gorilla trekking", "Uganda safari cost"],
});

export default function GorillaTrekkingCostUgandaPage() {
  return (
    <InsightArticle
      kicker="Gorilla trekking cost Uganda"
      title="What does gorilla trekking in Uganda really cost?"
      description="Understand the real cost drivers before choosing a cheap package or locking in a permit date."
      image="/images/travel/forest-guide.jpg"
      route="Gorilla Permit Help"
      path="/insights/gorilla-trekking-cost-uganda"
      sections={[
        {
          heading: "The permit is only one part of the cost",
          body: [
            "Most travelers start by asking about the gorilla permit. That matters, but it is not the whole trip. The final cost depends on your trekking sector, transfer route, lodge level, driver-guide support, safari extensions, and how much private logistics you want.",
            "A serious plan should show what is included, what is excluded, when payments are due, and what happens if permit or lodge availability changes.",
          ],
        },
        {
          heading: "Why premium trips cost more",
          body: [
            "High-end travelers usually pay for better pacing, stronger communication, reliable vehicles, carefully matched lodges, and private support before and during the trek.",
            "That premium is not just comfort. It reduces uncertainty around long drives, early trek starts, sector selection, and the handoff between permits, lodges, and park procedures.",
          ],
        },
      ]}
      faqs={[
        ["Can Wild Spine secure permits only?", "Yes. Permit help can be treated as a planning service, or folded into a full private itinerary."],
        ["Should I book the cheapest gorilla package?", "Only if it clearly explains sector, transport, accommodation, meals, guide support, and payment terms."],
        ["When should I request pricing?", "As soon as your month and group size are known, especially for peak travel periods."],
        ["What is included in the gorilla permit?", "The permit covers authorized tracking access and the regulated gorilla viewing experience with park guidance. It does not automatically include hotels, transfers, meals, private driver-guide support, or safari extensions."],
        ["Why do private journeys cost more?", "Private journeys include more planning time, route control, stronger communication, lodge matching, private transport, and better handling of long transfer days."],
        ["Can a Uganda gorilla trip start from $1,500?", "Shorter private journeys can start around $1,500+ depending on permits, season, lodge level, and transfer plan. Premium and expedition-style routes rise with comfort and complexity."],
      ]}
    />
  );
}
