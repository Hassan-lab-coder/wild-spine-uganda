import { seoMetadata } from "@/lib/seo";
import SeoLandingPage from "../components/SeoLandingPage";

export const metadata = seoMetadata({
  title: "Uganda Luxury Safari | Private Gorilla & Rwenzori Travel",
  description:
    "Design a private luxury Uganda safari with gorilla trekking, premium lodges, Rwenzori landscapes, private transfers, and careful local planning.",
  path: "/uganda-luxury-safari",
  image: "/images/field/murchison-sunset-vehicle.webp",
  keywords: ["Uganda luxury safari", "private Uganda safari", "gorilla trekking Uganda", "luxury Africa travel"],
});

export default function UgandaLuxurySafariPage() {
  return (
    <SeoLandingPage
      kicker="Uganda luxury safari"
      title="A private Uganda safari for travelers who want depth, not crowds."
      description="Build a premium Uganda safari experience around gorillas, Rwenzori landscapes, private transfers, carefully selected lodges, and clear planning before you commit."
      image="/images/field/murchison-sunset-vehicle.webp"
      imageAlt="Safari vehicle beside water at sunset in Uganda"
      route="The Summit Trail"
      cta="Start Your Luxury Uganda Plan"
      bullets={["Private itinerary design around your pace", "Premium lodge planning with route logic", "Gorilla and mountain combinations", "Clear communication before booking"]}
      videoFeature={{
        title: "Wildlife and water between big days",
        description: "A short preview of the park rhythm that can sit between gorilla forests, lodge recovery, and mountain routes.",
        src: "/video/field/murchison-wildlife-water.mp4",
        poster: "/images/field/murchison-wildlife-water-poster.webp",
        label: "Silent preview video of wildlife and water scenes in a Uganda national park",
      }}
      mediaGallery={[
        {
          title: "Safari vehicle access",
          image: "/images/field/enttiko-safari-vehicle.webp",
          imageAlt: "Safari vehicle on open Uganda plains",
          caption: "Premium planning starts with how the route moves, not only where the nights are booked.",
        },
        {
          title: "Suite comfort",
          image: "/images/organic/suite-view-bed.webp",
          imageAlt: "Comfortable Uganda lodge suite with mosquito net and balcony view",
          caption: "Room quality matters most after long transfers, early starts, and mountain or forest days.",
        },
        {
          title: "Dining with a view",
          image: "/images/organic/safari-dining-view.webp",
          imageAlt: "Outdoor safari dining chairs and table looking across a Uganda landscape",
          caption: "The premium feeling comes from quiet details, not only headline wildlife moments.",
        },
        {
          title: "Murchison Falls context",
          image: "/images/field/murchison-falls-river.webp",
          imageAlt: "Water rushing through Murchison Falls National Park in Uganda",
          caption: "Safari extensions work best when water, wildlife, lodge location, and road timing are planned together.",
        },
      ]}
      faqs={[
        ["Is this a group safari?", "Wild Spine focuses on private and tailored travel, not fixed mass-market departures."],
        ["Can comfort level be customized?", "Yes. Lodge style, pacing, transfer rhythm, and support level are planned around your preferences."],
        ["Can permits be handled?", "We guide permit timing and availability before finalizing the route."],
        ["How long should I travel?", "Most premium routes work best from 5 to 14 days depending on the depth of the experience you want."],
      ]}
    />
  );
}
