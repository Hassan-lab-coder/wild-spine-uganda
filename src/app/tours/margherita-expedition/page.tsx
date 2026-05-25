import TourConversionSections from "../TourConversionSections";

export default function MargheritaExpeditionPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/rwenzori.jpg"
          alt="Rwenzori Mountains and Margherita expedition"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/tours" className="text-yellow-500 hover:text-yellow-400">
            ← Back to Tours
          </a>

          <p className="section-kicker mt-16">
            12–14 Days • Ultra Premium Summit Expedition
          </p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            Margherita Expedition
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            The elite Wild Spine route: private logistics, luxury lodge planning,
            glacier crossing, and the highest point in Uganda.
          </p>

          <a
            href="/?route=Margherita%20Expedition&source=margherita_expedition_page#book"
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
              ["Days 1–2", "Arrival, private briefing, gear review, and comfort preparation."],
              ["Day 3", "Gorilla trekking extension or direct expedition transfer."],
              ["Days 4–6", "Rwenzori ascent through forest, bamboo, and alpine zones."],
              ["Days 7–10", "High-altitude push toward glacier country and summit preparation."],
              ["Day 11", "Margherita Peak summit attempt."],
              ["Days 12–14", "Descent, recovery, private transfer, and departure."],
            ].map(([day, text]) => (
              <div key={day} className="border-l border-yellow-500 pl-6 mb-8">
                <h3 className="text-yellow-500 font-black text-xl">{day}</h3>
                <p className="text-gray-400 mt-2 leading-7">{text}</p>
              </div>
            ))}
          </div>

          <aside className="package-card h-fit sticky top-28">
            <h3 className="text-2xl font-black mb-6">Journey Details</h3>
            <p className="text-gray-400 mb-3">Duration: 12–14 Days</p>
            <p className="text-gray-400 mb-3">Focus: Summit + Luxury</p>
            <p className="text-gray-400 mb-3">Style: Ultra Premium Expedition</p>
            <p className="text-yellow-500 text-3xl font-black mt-8">From $6,000</p>

            <a
              href="/?route=Margherita%20Expedition&source=margherita_expedition_page#book"
              className="block mt-8 text-center bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Start Planning
            </a>
          
<p className="text-xs text-gray-500 mt-4 text-center">
  Summit logistics require early preparation — limited spaces available.
</p>

<a
  href="https://wa.me/256751828241"
  target="_blank"
  className="block mt-4 text-center border border-white/20 py-3 rounded-full text-sm hover:bg-white hover:text-black transition"
>
  Chat on WhatsApp
</a>
</aside>
        </div>
      </section>

      <TourConversionSections
        tourName="Margherita Expedition"
        proof="Margherita Peak requires serious preparation, clear logistics, and honest guidance about altitude, weather, gear, and summit conditions. This route is planned carefully before any commitment is made."
        inclusions={["Summit logistics planning", "Guide and porter coordination", "Gear review support", "Private transfers and recovery planning"]}
        exclusions={["International flights", "Travel insurance", "Technical personal gear", "Emergency evacuation cover"]}
        faqs={[
          ["Is Margherita Peak technical?", "It can involve glacier conditions, altitude, and demanding terrain. We review suitability before confirming."],
          ["How early should I plan?", "Earlier is better because guides, gear, weather windows, and comfort logistics need careful coordination."],
          ["Can gorillas be added?", "Yes. Many travelers combine the summit with gorilla trekking before or after the mountain."],
          ["What if weather changes?", "Mountain weather is part of the planning. We discuss contingency time and realistic expectations before booking."],
        ]}
      />
    </main>
  );
}
