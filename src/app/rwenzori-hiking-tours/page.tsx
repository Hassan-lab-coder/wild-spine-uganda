import { seoMetadata } from "@/lib/seo";
import SeoLandingPage from "../components/SeoLandingPage";

export const metadata = seoMetadata({
  title: "Rwenzori Mountains Hiking Tours | Private Uganda Expeditions",
  description:
    "Plan Rwenzori mountains hiking in Uganda with route guidance, logistics, private transfers, fitness preparation, and optional gorilla trekking add-ons.",
  path: "/rwenzori-hiking-tours",
  image: "/images/organic/rwenzori-lake-valley-hiker.webp",
  keywords: ["Rwenzori mountains hiking", "Rwenzori hiking tours", "Uganda trekking", "Rwenzori expedition"],
});

export default function RwenzoriHikingToursPage() {
  return (
    <SeoLandingPage
      kicker="Rwenzori hiking tours"
      title="Hike the Rwenzori Mountains with honest expedition planning."
      description="Explore Uganda's Rwenzori Mountains with route guidance, pacing advice, private transfers, and practical preparation for weather, fitness, altitude, and recovery."
      image="/images/organic/rwenzori-lake-valley-hiker.webp"
      imageAlt="Hiker standing by an alpine lake in the Rwenzori Mountains"
      route="The Summit Trail"
      cta="Plan My Rwenzori Expedition"
      bullets={["Route and duration guidance", "Mountain logistics coordination", "Fitness and gear preparation", "Gorilla trekking add-on options"]}
      videoFeature={{
        title: "Bridge crossings and wet mountain trail",
        eyebrow: "Rwenzori field clip",
        description: "A short route texture clip that shows why realistic pacing and gear planning matter in the Rwenzori.",
        src: "/video/organic/rwenzori-suspension-bridge.mp4",
        poster: "/images/organic/video-rwenzori-bridge-poster.webp",
        label: "Rwenzori suspension bridge crossing field video",
      }}
      mediaGallery={[
        {
          title: "Alpine lake valleys",
          image: "/images/organic/rwenzori-lake-valley-hiker.webp",
          imageAlt: "Hiker standing by an alpine lake in the Rwenzori Mountains",
          caption: "The Rwenzori route is shaped by valley terrain, weather, and recovery pacing.",
        },
        {
          title: "Giant lobelia zones",
          image: "/images/organic/rwenzori-lobelia-valley.webp",
          imageAlt: "Giant lobelia plants in a Rwenzori mountain valley",
          caption: "Specific plant zones help travelers understand that this is a distinct mountain ecosystem.",
        },
        {
          title: "Mist and forest texture",
          image: "/images/organic/rwenzori-misty-peak.webp",
          imageAlt: "Misty Rwenzori mountain peak behind trees",
          caption: "Weather is part of the experience, so route planning has to stay honest.",
        },
        {
          title: "Team trail reality",
          image: "/images/organic/rwenzori-group-trail.webp",
          imageAlt: "Rwenzori hiking team gathered on a forest trail",
          caption: "A serious mountain journey depends on people, preparation, and clear support.",
        },
      ]}
      faqs={[
        ["How fit should I be?", "Good hiking fitness is important, and route choice should match your experience. We would rather be honest than oversell the mountain."],
        ["Can I combine gorillas and Rwenzori?", "Yes. The Summit Trail is built around that combination."],
        ["When is the best season?", "Drier months are preferred, though mountain weather remains variable."],
        ["Do I need technical gear?", "For higher routes and Margherita, gear planning matters. We review that early."],
      ]}
    />
  );
}
