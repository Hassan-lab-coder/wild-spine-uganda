import { seoMetadata } from "@/lib/seo";
import SeoLandingPage from "../components/SeoLandingPage";

export const metadata = seoMetadata({
  title: "Rwenzori Mountains Hiking Tours | Private Uganda Expeditions",
  description:
    "Plan Rwenzori mountains hiking in Uganda with route guidance, logistics, private transfers, fitness preparation, and optional gorilla trekking add-ons.",
  path: "/rwenzori-hiking-tours",
  image: "/images/travel/boardwalk-trek.jpg",
  keywords: ["Rwenzori mountains hiking", "Rwenzori hiking tours", "Uganda trekking", "Rwenzori expedition"],
});

export default function RwenzoriHikingToursPage() {
  return (
    <SeoLandingPage
      kicker="Rwenzori hiking tours"
      title="Hike the Rwenzori Mountains with honest expedition planning."
      description="Explore Uganda's Rwenzori Mountains with route guidance, pacing advice, private transfers, and practical preparation for weather, fitness, altitude, and recovery."
      image="/images/travel/boardwalk-trek.jpg"
      imageAlt="Hikers crossing a wooden boardwalk on a misty Rwenzori trail"
      route="The Summit Trail"
      cta="Plan My Rwenzori Expedition"
      bullets={["Route and duration guidance", "Mountain logistics coordination", "Fitness and gear preparation", "Gorilla trekking add-on options"]}
      faqs={[
        ["How fit should I be?", "Good hiking fitness is important, and route choice should match your experience. We would rather be honest than oversell the mountain."],
        ["Can I combine gorillas and Rwenzori?", "Yes. The Summit Trail is built around that combination."],
        ["When is the best season?", "Drier months are preferred, though mountain weather remains variable."],
        ["Do I need technical gear?", "For higher routes and Margherita, gear planning matters. We review that early."],
      ]}
    />
  );
}
