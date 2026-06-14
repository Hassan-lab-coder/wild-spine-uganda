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
      timeline={[
        ["Step 1", "Tell us your month, group size, fitness comfort, and whether gorilla trekking is the main reason for travel."],
        ["Step 2", "We review Bwindi or Mgahinga permit timing, likely sectors, lodge base logic, and transfer flow before shaping the route."],
        ["Step 3", "We compare Entebbe, Kampala, Kigali, drive-in, or fly-in access when useful, so the route fits your dates and comfort."],
        ["Step 4", "You receive a private trek plan with permit guidance, inclusions, payment steps, and realistic next decisions."],
      ]}
      faqs={[
        ["When should I book permits?", "As early as possible, especially around peak travel months. Permit availability can decide the sector, lodge area, and route."],
        ["Should I plan 2026 or 2027 gorilla travel early?", "Yes. Early planning gives you stronger permit, lodge, and route options. It also lets us explain deposit steps, date-change possibilities, and payment timing before you commit."],
        ["Is gorilla trekking safe in Uganda?", "Gorilla trekking is structured through park procedures, ranger briefings, and official guidance. Safety improves when transfers, lodge location, trek timing, and expectations are planned clearly before arrival."],
        ["How difficult is the hike?", "It can be moderate or demanding depending on terrain, weather, and the gorilla family location. We help set honest expectations around fitness, pacing, and footwear before you arrive."],
        ["What is included in the permit?", "A gorilla permit gives authorized access to join a guided trek and spend the regulated viewing time with a habituated gorilla family. Transport, lodging, meals, and private guide support are separate unless included in your itinerary."],
        ["Can I start a Uganda gorilla trip from Kigali?", "Often, yes. Kigali can work well for southwest Uganda depending on dates, border timing, permit sector, and lodge availability. We compare it honestly against Entebbe or Kampala access."],
        ["Can I fly into Bwindi instead of driving?", "Some premium itineraries can use domestic flight connections to reduce road time. Availability, luggage limits, sector choice, and transfer timing need to be checked before the route is confirmed."],
        ["Can this be private?", "Yes. Transfers, planning, lodge selection, and pacing can be private for your group."],
        ["Can I add other parks?", "Yes. Queen Elizabeth, Lake Bunyonyi, and Rwenzori extensions can turn the trek into a richer Uganda safari experience."],
      ]}
    />
  );
}
