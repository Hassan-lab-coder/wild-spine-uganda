export default function ExpertisePage() {
  const points = [
    {
      title: "Permit Intelligence",
      desc: "We help travelers understand gorilla permit timing, availability, route planning, and realistic booking windows.",
    },
    {
      title: "Route Knowledge",
      desc: "From Bwindi access roads to Rwenzori trail stages, we plan around terrain, distance, weather, and traveler comfort.",
    },
    {
      title: "Local Coordination",
      desc: "We coordinate with guides, drivers, lodges, and local partners so travelers do not have to manage fragmented logistics alone.",
    },
    {
      title: "Safety Awareness",
      desc: "We brief travelers on altitude, trail difficulty, packing, transport, cultural etiquette, and practical movement across Uganda.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/forest.jpg"
          alt="Uganda forest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Local Expertise</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            Uganda is not guessed. <br /> It is known.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Wild Spine is built on practical ground knowledge: permits, roads,
            lodges, trail pacing, weather windows, guides, and the hidden details
            that make a journey feel safe, smooth, and premium.
          </p>

          <a
            href="/#book"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Plan With Local Experts
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="section-kicker">Why it matters</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              The difference between a tour and a well-run expedition.
            </h2>
            <p className="text-gray-400 text-lg leading-8">
              Tourists often underestimate Uganda’s logistics: permit dates, long
              transfers, road conditions, altitude changes, lodge locations, park
              rules, and timing. We simplify that complexity and help travelers
              move with confidence.
            </p>
          </div>

          <div className="grid gap-6">
            {points.map((item) => (
              <div key={item.title} className="package-card">
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#050605]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-yellow-500 text-3xl font-black">Before</h3>
            <p className="text-gray-400 mt-3">Route planning, permits, lodge advice, packing guidance.</p>
          </div>
          <div>
            <h3 className="text-yellow-500 text-3xl font-black">During</h3>
            <p className="text-gray-400 mt-3">Local coordination, guide support, realistic movement.</p>
          </div>
          <div>
            <h3 className="text-yellow-500 text-3xl font-black">After</h3>
            <p className="text-gray-400 mt-3">Extensions, recovery days, onward travel support.</p>
          </div>
        </div>
      </section>
    </main>
  );
}