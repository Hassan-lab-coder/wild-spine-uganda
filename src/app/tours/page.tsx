const tours = [
  {
    title: "The Spine Explorer",
    days: "4–5 Days",
    price: "From $1,400",
    desc: "Premium gorilla trekking through Bwindi with private guidance, permit support, and curated lodge planning.",
    link: "/tours/spine-explorer",
  },
  {
    title: "The Summit Trail",
    days: "10–12 Days",
    price: "From $3,200",
    desc: "The signature Wild Spine journey combining gorilla forests, Rwenzori valleys, alpine trails, and glacier country.",
    link: "/tours/summit-trail",
  },
  {
    title: "Margherita Expedition",
    days: "12–14 Days",
    price: "From $6,000",
    desc: "Ultra-premium summit expedition to Uganda’s highest peak with private logistics and serious expedition support.",
    link: "/tours/margherita-expedition",
  },
];

export default function ToursPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative px-6 md:px-24 py-28">
        <div className="absolute inset-0 luxury-bg opacity-70" />
        <div className="absolute inset-0 mist-layer opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Signature Expeditions</p>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
            Choose your Uganda crossing.
          </h1>

          <p className="text-gray-300 text-lg leading-8 max-w-3xl">
            From mountain gorillas in Bwindi to glacier trails in the Rwenzori,
            these journeys are built for travelers who want rare, premium, and unforgettable Uganda.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-24 pb-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <a
              key={tour.title}
              href={tour.link}
              className={`package-card group ${
                index === 1 ? "featured-card" : ""
              }`}
            >
              <p className="text-yellow-500 text-sm mb-3">
                0{index + 1} / {tour.days}
              </p>

              <h2 className="text-3xl font-black mb-4 group-hover:text-yellow-500 transition">
                {tour.title}
              </h2>

              <p className="text-white font-semibold mb-5">{tour.price}</p>

              <p className="text-gray-400 leading-7 mb-8">{tour.desc}</p>

              <p className="text-yellow-500 font-black">View Full Itinerary →</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}