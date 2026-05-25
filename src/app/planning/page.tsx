export default function PlanningPage() {
  const steps = [
    {
      title: "Discovery",
      desc: "We understand your travel dates, budget, fitness level, comfort expectations, and dream Uganda experience.",
    },
    {
      title: "Route Design",
      desc: "We shape a realistic journey around gorilla permits, Rwenzori conditions, lodge access, transfers, and pacing.",
    },
    {
      title: "Logistics Coordination",
      desc: "We help align guides, drivers, accommodation, permit timing, and practical movement across Uganda.",
    },
    {
      title: "Journey Support",
      desc: "You receive guidance before arrival so you understand packing, expectations, safety, and route rhythm.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/hiking.jpg"
          alt="Premium Uganda expedition planning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Premium Planning</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            Every rare journey needs precision.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Premium travel is not just beautiful places. It is timing, comfort,
            safety, communication, pacing, and the confidence that every detail has
            been thought through before you arrive.
          </p>

          <a
            href="/#book"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Start Planning
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="section-kicker">Our process</p>
          <h2 className="text-4xl md:text-6xl font-black mb-14">
            From first message to final trail day.
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.title} className="package-card">
                <p className="text-yellow-500 font-black mb-4">
                  0{index + 1}
                </p>
                <h3 className="text-xl font-black mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-7">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-[#050605]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-kicker">What tourists avoid</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              No fragmented bookings. No guesswork.
            </h2>
            <p className="text-gray-400 text-lg leading-8">
              Many travelers lose time trying to coordinate permits, transfers,
              lodges, trail details, and park requirements separately. Our planning
              turns scattered information into one clear route.
            </p>
          </div>

          <div className="package-card">
            <h3 className="text-2xl font-black mb-6">Planning Covers</h3>
            <ul className="space-y-4 text-gray-300">
              <li>✓ Gorilla permit timing</li>
              <li>✓ Route pacing and travel days</li>
              <li>✓ Lodge and comfort matching</li>
              <li>✓ Driver and guide coordination</li>
              <li>✓ Packing and fitness expectations</li>
              <li>✓ Safari or volunteer add-ons</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}