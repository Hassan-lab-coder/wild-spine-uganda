import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Uganda Tours | Gorilla Trekking & Rwenzori Expeditions",
  description:
    "Explore private Uganda tours with gorilla trekking in Bwindi, Rwenzori hiking, Margherita expeditions, luxury safari extensions, and permit planning.",
  path: "/tours",
  image: "/images/travel/forest-guide.jpg",
  keywords: ["Uganda tours", "gorilla trekking Uganda", "Rwenzori expeditions", "private Uganda safari"],
});

const tours = [
  {
    title: "The Spine Explorer",
    days: "4-5 Days",
    price: "From $1,400",
    desc: "Premium gorilla trekking through Bwindi with private guidance, permit support, and curated lodge planning.",
    link: "/tours/spine-explorer",
    bestFor: "Short private gorilla journeys",
    image: "/images/travel/forest-guide.jpg",
  },
  {
    title: "The Summit Trail",
    days: "10-12 Days",
    price: "From $3,200",
    desc: "The signature Wild Spine journey combining gorilla forests, Rwenzori valleys, alpine trails, and glacier country.",
    link: "/tours/summit-trail",
    bestFor: "Gorillas plus serious hiking",
    image: "/images/travel/forest-trek.jpg",
  },
  {
    title: "Margherita Expedition",
    days: "12-14 Days",
    price: "From $6,000",
    desc: "Ultra-premium summit expedition to Uganda's highest peak with private logistics and serious expedition support.",
    link: "/tours/margherita-expedition",
    bestFor: "High-altitude expedition travelers",
    image: "/images/travel/margherita-peak.png",
  },
];

export default function ToursPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative px-6 py-28 md:px-24">
        <div className="absolute inset-0 luxury-bg opacity-70" />
        <div className="absolute inset-0 mist-layer opacity-40" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">Back Home</a>
          <p className="section-kicker mt-16">Signature Expeditions</p>
          <h1 className="mb-8 text-5xl font-black leading-tight md:text-7xl">Choose your Uganda crossing.</h1>
          <p className="max-w-3xl text-lg leading-8 text-gray-300">
            From mountain gorillas in Bwindi to glacier trails in the Rwenzori, these journeys are built for travelers who want rare, premium, and unforgettable Uganda.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {tours.map((tour, index) => (
            <a key={tour.title} href={tour.link} className={`group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-yellow-500/40 ${index === 1 ? "ring-1 ring-yellow-500/30" : ""}`}>
              <div className="relative h-64 overflow-hidden">
                <img src={tour.image} alt={tour.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <p className="absolute left-5 top-5 rounded-full bg-black/60 px-4 py-2 text-sm font-black text-yellow-500">
                  0{index + 1} / {tour.days}
                </p>
              </div>
              <div className="p-7">
                <h2 className="mb-4 text-3xl font-black transition group-hover:text-yellow-500">{tour.title}</h2>
                <p className="mb-5 font-semibold text-white">{tour.price}</p>
                <p className="mb-6 leading-7 text-gray-400">{tour.desc}</p>
                <p className="mb-8 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-gray-300">
                  Best for: {tour.bestFor}
                </p>
                <p className="font-black text-yellow-500">View Full Itinerary</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <p className="font-black text-yellow-500">Pricing note</p>
          <p className="mt-2 leading-7 text-gray-300">
            Published prices are starting guidance. Final quotes depend on travel dates, group size, lodge level, permit sector, route conditions, and availability.
          </p>
        </div>
      </section>
    </main>
  );
}
