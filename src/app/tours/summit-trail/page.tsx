import { seoMetadata } from "@/lib/seo";
import Image from "next/image";
import TourConversionSections from "../TourConversionSections";
import OrganicVideoCard from "../../components/OrganicVideoCard";

export const metadata = seoMetadata({
  title: "The Summit Trail | Gorillas & Rwenzori Hiking Uganda",
  description:
    "A private Uganda journey combining Bwindi gorilla trekking, Rwenzori mountains hiking, alpine valleys, route planning, and premium logistics.",
  path: "/tours/summit-trail",
  image: "/images/field/rwenzori-boardwalk-valley.webp",
  keywords: ["Rwenzori mountains hiking", "gorilla trekking Uganda", "Uganda hiking tour", "private Uganda safari"],
});

export default function SummitTrailPage() {
  const routeMedia = [
    {
      title: "Boardwalk valleys",
      image: "/images/field/rwenzori-boardwalk-valley.webp",
      alt: "Hiker crossing a Rwenzori boardwalk through high mountain valley vegetation",
      caption: "The early route is green, wet, and slow enough to reward good pacing.",
    },
    {
      title: "Forest ladder sections",
      image: "/images/field/rwenzori-forest-ladder.webp",
      alt: "A ladder bridge section through dense Rwenzori forest",
      caption: "A private expedition still depends on practical route expectations and support clarity.",
    },
    {
      title: "Lake valley days",
      image: "/images/organic/rwenzori-lake-valley-hiker.webp",
      alt: "Hiker standing near a Rwenzori alpine lake valley",
      caption: "The reward is not just the summit; it is the shift from forest to high valley.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <Image
          src="/images/field/rwenzori-boardwalk-valley.webp"
          alt="Hiker crossing a Rwenzori boardwalk through high mountain valley vegetation"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/tours" className="text-yellow-500 hover:text-yellow-400">
            ← Back to Tours
          </a>

          <p className="section-kicker mt-16">
            10–12 Days • Gorillas + Rwenzori
          </p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            The Summit Trail
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            The signature Wild Spine journey — mountain gorillas, deep forest,
            Rwenzori valleys, alpine trails, and the emotional crossing from jungle
            floor to glacier country.
          </p>

          <a
            href="/?route=The%20Summit%20Trail&source=summit_trail_page#book"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Request This Journey
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <p className="section-kicker">Day-by-day</p>
            <h2 className="text-4xl md:text-6xl font-black mb-10">
              Itinerary
            </h2>

            {[
              ["Days 1–2", "Arrival, private route briefing, and transfer toward western Uganda."],
              ["Day 3", "Mountain gorilla trekking in Bwindi Impenetrable Forest."],
              ["Days 4–5", "Transfer toward Kasese with preparation for the Rwenzori trail."],
              ["Days 6–10", "Rwenzori central circuit through valleys, alpine zones, and giant lobelia forests."],
              ["Days 11–12", "Descent, recovery, private transfer, and departure planning."],
            ].map(([day, text]) => (
              <div key={day} className="border-l border-yellow-500 pl-6 mb-8">
                <h3 className="text-yellow-500 font-black text-xl">{day}</h3>
                <p className="text-gray-400 mt-2 leading-7">{text}</p>
              </div>
            ))}
          </div>

          <aside className="package-card h-fit sticky top-28">
            <h3 className="text-2xl font-black mb-6">Journey Details</h3>
            <p className="text-gray-400 mb-3">Duration: 10–12 Days</p>
            <p className="text-gray-400 mb-3">Focus: Gorillas + Rwenzori</p>
            <p className="text-gray-400 mb-3">Style: Signature Expedition</p>
            <p className="text-yellow-500 text-3xl font-black mt-8">From $3,200</p>

            <a
              href="/?route=The%20Summit%20Trail&source=summit_trail_page#book"
              className="block mt-8 text-center bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Start Planning
            </a>
          
<p className="text-xs text-gray-500 mt-4 text-center">
  Limited expedition spaces available — early planning recommended.
</p>

<a
  href="https://wa.me/256751828241"
  target="_blank"
  rel="noopener noreferrer"
  className="block mt-4 text-center border border-white/20 py-3 rounded-full text-sm hover:bg-white hover:text-black transition"
>
  Chat on WhatsApp
</a>
</aside>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#050605] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="section-kicker">Route media</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                The Summit Trail should feel real before it feels easy.
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-gray-400">
              These are the details that help a traveler understand the route: bridges, wet vegetation,
              mountain teams, and high valleys.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <OrganicVideoCard
              dark
              title="Waterfall trail in the Rwenzori"
              description="A short route preview shows why the journey needs practical preparation, not vague adventure language."
              src="/video/field/rwenzori-waterfall-trail.mp4"
              poster="/images/field/rwenzori-waterfall-trail-poster.webp"
              label="Silent preview video of a Rwenzori waterfall and mountain trail"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {routeMedia.map((item) => (
                <figure key={item.image} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
                  <div className="relative h-72 overflow-hidden">
                    <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 22vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <figcaption className="p-5">
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{item.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TourConversionSections
        tourName="The Summit Trail"
        proof="This signature route joins two complex Uganda experiences: gorilla permits and Rwenzori trail logistics. We coordinate pacing, transfer timing, lodge comfort, and expedition preparation as one coherent journey."
        inclusions={["Gorilla permit planning", "Rwenzori route guidance", "Private transfer coordination", "Pre-expedition briefing", "Guide and porter coordination guidance", "Recovery and departure planning"]}
        exclusions={["International flights", "Uganda visa fees", "Travel insurance", "Personal mountain gear", "Tips and gratuities", "Optional luxury upgrades"]}
        lodgeExamples={["Before trek: western Uganda lodges near Bwindi or Queen Elizabeth routing", "Mountain section: route-appropriate huts or expedition accommodation", "After trek: recovery lodge options around Kasese, Fort Portal, or Entebbe depending on routing"]}
        priceNotes={["Rates shift with gorilla permit sector, mountain route length, lodge level, and group size.", "Mountain weather and trail conditions can require route adjustments.", "A final quote confirms permits, transfers, accommodation class, and support level in writing."]}
        faqs={[
          ["Who is this route for?", "Travelers who want both rare wildlife and a serious mountain experience in one private Uganda journey."],
          ["Do I need mountain experience?", "Good hiking fitness is important. We help you choose the right route based on ability and comfort."],
          ["When is the best season?", "Drier months are usually preferred, but mountain weather can still shift quickly."],
          ["Can I skip the mountain section?", "Yes. We can shorten the itinerary or build a softer western Uganda route."],
        ]}
      />
    </main>
  );
}
