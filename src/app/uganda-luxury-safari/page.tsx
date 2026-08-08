import { seoMetadata } from "@/lib/seo";
import SeoLandingPage from "../components/SeoLandingPage";

export const metadata = seoMetadata({
  title: "Uganda Luxury Safari | Private Gorilla & Rwenzori Travel",
  description:
    "Design a private luxury Uganda safari with gorilla trekking, premium lodges, Rwenzori landscapes, private transfers, and careful local planning.",
  path: "/uganda-luxury-safari",
  image: "/images/organic/lodge-aerial-wilderness.webp",
  keywords: ["Uganda luxury safari", "private Uganda safari", "gorilla trekking Uganda", "luxury Africa travel"],
});

export default function UgandaLuxurySafariPage() {
  return (
    <SeoLandingPage
      kicker="Uganda luxury safari"
      title="A private Uganda safari for travelers who want depth, not crowds."
      description="Build a premium Uganda safari experience around gorillas, Rwenzori landscapes, private transfers, carefully selected lodges, and clear planning before you commit."
      image="/images/organic/lodge-aerial-wilderness.webp"
      imageAlt="Aerial view of a private Uganda wilderness lodge"
      route="The Summit Trail"
      cta="Start Your Luxury Uganda Plan"
      bullets={["Private itinerary design around your pace", "Premium lodge planning with route logic", "Gorilla and mountain combinations", "Clear communication before booking"]}
      videoFeature={{
        title: "Safari road feeling",
        eyebrow: "Park-road clip",
        description: "A short, organic clip helps travelers picture the private safari rhythm between lodges, plains, and wildlife.",
        src: "/video/organic/safari-giraffe-drive.mp4",
        poster: "/images/organic/video-safari-giraffe-poster.webp",
        label: "Uganda safari road video with giraffe and travelers",
      }}
      mediaGallery={[
        {
          title: "Wilderness lodge setting",
          image: "/images/organic/lodge-aerial-wilderness.webp",
          imageAlt: "Aerial view of Uganda wilderness lodge and swimming pool",
          caption: "Premium safari planning connects the wild route with the comfort needed between big days.",
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
          title: "Park-road wildlife",
          image: "/images/organic/elephant-near-lodge.webp",
          imageAlt: "Elephant moving near a Uganda lodge area",
          caption: "Safari extensions work best when lodge location and wildlife movement are planned together.",
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
