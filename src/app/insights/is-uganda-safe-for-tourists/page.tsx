import { seoMetadata } from "@/lib/seo";
import InsightArticle from "../InsightArticle";

export const metadata = seoMetadata({
  title: "Is Uganda Safe for Tourists?",
  description:
    "Practical safety guidance for private Uganda travel, gorilla trekking, transfers, park procedures, and expedition planning.",
  path: "/insights/is-uganda-safe-for-tourists",
  image: "/images/travel/trail-team.jpg",
  keywords: ["is Uganda safe for tourists", "Uganda travel safety", "gorilla trekking Uganda safety", "private Uganda travel"],
});

export default function IsUgandaSafeForTouristsPage() {
  return (
    <InsightArticle
      kicker="Is Uganda safe for tourists"
      title="Uganda can be deeply rewarding when the route is planned properly."
      description="Safety is not a slogan. It comes from realistic routing, local support, clear communication, and careful decisions before arrival."
      image="/images/travel/trail-team.jpg"
      route="Custom Uganda Safari"
      path="/insights/is-uganda-safe-for-tourists"
      sections={[
        {
          heading: "Good planning reduces avoidable risk",
          body: [
            "International travelers should think about airport arrival, transfer distances, park procedures, road timing, health preparation, and reliable local contacts.",
            "A strong itinerary avoids vague logistics. It tells you who meets you, how transfers work, where you sleep, what each day demands, and how changes are handled.",
          ],
        },
        {
          heading: "Private support matters for premium travelers",
          body: [
            "For high-value trips, the goal is not only to see Uganda. It is to move through the country with confidence, privacy, and a clear operating plan.",
            "Wild Spine focuses on communication, realistic route design, trusted field coordination, and experiences that do not depend on guesswork.",
          ],
        },
      ]}
      faqs={[
        ["Should I use a local operator?", "For gorilla trekking and multi-region travel, local route knowledge is a major advantage."],
        ["Are long transfers normal?", "Yes. Uganda routes can involve long drives, so pacing and vehicle quality matter."],
        ["Can Wild Spine help before arrival?", "Yes. The planning process covers arrival, routing, permits, lodge fit, and practical expectations."],
      ]}
    />
  );
}
