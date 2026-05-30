import { seoMetadata } from "@/lib/seo";
import TourConversionSections from "../TourConversionSections";

export const metadata = seoMetadata({
  title: "The Spine Explorer | Private Bwindi Gorilla Trekking",
  description:
    "A 4-5 day private Bwindi gorilla trekking journey with Uganda permit help, sector planning, private guide support, and premium lodge coordination.",
  path: "/tours/spine-explorer",
  image: "/images/travel/forest-guide.jpg",
  keywords: ["Bwindi gorilla trekking", "gorilla trekking Uganda", "private Uganda tour", "Uganda gorilla permit"],
});

export default function SpineExplorerPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/travel/forest-guide.jpg"
          alt="Mountain gorilla in Bwindi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/tours" className="text-yellow-500 hover:text-yellow-400">
            ← Back to Tours
          </a>

          <p className="section-kicker mt-16">4–5 Days • Gorilla Trekking</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            The Spine Explorer
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            A premium short Uganda journey built around one unforgettable moment:
            standing face-to-face with mountain gorillas in Bwindi.
          </p>

          <a
            href="/?route=The%20Spine%20Explorer&source=spine_explorer_page#book"
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
             <p className="text-gray-400 mb-10 leading-8 text-lg">
  This journey is designed for travelers who want a short but powerful
  Uganda experience — centered on one of the rarest wildlife encounters on Earth.
</p>
 Itinerary
            </h2>

            {[
              ["Day 1", "Arrival in Entebbe or Kampala, private transfer, welcome briefing."],
              ["Day 2", "Scenic journey toward Bwindi region with curated stopovers."],
              ["Day 3", "Mountain gorilla trekking inside Bwindi Impenetrable Forest."],
              ["Day 4", "Slow recovery morning, cultural encounter, return journey begins."],
              ["Day 5", "Optional extension, domestic connection, or departure."],
            ].map(([day, text]) => (
              <div key={day} className="border-l border-yellow-500 pl-6 mb-8">
                <h3 className="text-yellow-500 font-black text-xl">{day}</h3>
                <p className="text-gray-400 mt-2 leading-7">{text}</p>
              </div>
            ))}
          </div>

          <aside className="package-card h-fit sticky top-28">
           <div className="mt-8">
  <h4 className="font-bold mb-4 text-yellow-500">What’s Included</h4>

  <ul className="space-y-2 text-gray-300 text-sm">
    <li>✓ Gorilla permits assistance</li>
    <li>✓ Private guide & driver</li>
    <li>✓ Lodge & accommodation planning</li>
    <li>✓ Transport coordination</li>
    <li>✓ Park entry logistics</li>
  </ul>
</div> 
<h3 className="text-2xl font-black mb-6">Journey Details</h3>
            <p className="text-gray-400 mb-3">Duration: 4–5 Days</p>
            <p className="text-gray-400 mb-3">Focus: Gorilla Trekking</p>
            <p className="text-gray-400 mb-3">Style: Premium Short Escape</p>
            <p className="text-yellow-500 text-3xl font-black mt-8">From $1,400</p>

            <a
              href="/?route=The%20Spine%20Explorer&source=spine_explorer_page#book"
              className="block mt-8 text-center bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Start Planning
            </a>
          
<p className="text-xs text-gray-500 mt-4 text-center">
  Limited permits available each month — early planning recommended.
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

      <TourConversionSections
        tourName="The Spine Explorer"
        proof="This route is built for travelers who want one powerful gorilla trekking experience without losing comfort, clarity, or local support. We help shape dates around permit availability and realistic transfer timing."
        inclusions={["Gorilla permit planning support", "Private guide and driver coordination", "Lodge selection guidance", "Airport or city transfer planning", "Park entry and trek-day logistics", "Pre-trip briefing by WhatsApp or email"]}
        exclusions={["International flights", "Uganda visa fees", "Travel insurance", "Premium drinks and personal expenses", "Tips and gratuities", "Optional upgrades or extensions"]}
        lodgeExamples={["Comfort: clean local lodges near Bwindi sector access", "Premium: boutique forest lodges with strong service and views", "Luxury: high-touch Bwindi lodges where sector and availability allow"]}
        priceNotes={["Published prices are starting guidance and depend on season, group size, lodge level, and permit sector.", "Gorilla permits are subject to availability and are normally secured only after payment.", "A written quote confirms what is included before you commit."]}
        faqs={[
          ["How hard is gorilla trekking?", "It can be moderate or demanding depending on where the gorilla family is located that day. We brief you honestly before the trek."],
          ["How early should I book?", "Book as early as possible for peak months because gorilla permits are limited."],
          ["Can this be extended?", "Yes. You can add Queen Elizabeth, Lake Bunyonyi, or a Rwenzori extension."],
          ["Is this private?", "Yes. The planning, transfers, and support are tailored around your travel group."],
        ]}
      />
    </main>
  );
}
