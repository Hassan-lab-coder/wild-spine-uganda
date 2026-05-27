export default function PrivateTravelPage() {
  const pillars = [
    {
      title: "Private Pacing",
      desc: "No fixed group schedules. Your journey moves at your rhythm — whether slower comfort or faster expedition style.",
    },
    {
      title: "Controlled Group Size",
      desc: "We avoid mass tourism. Trips are designed for individuals, couples, families, or small private groups.",
    },
    {
      title: "Curated Stays",
      desc: "Accommodation is selected based on comfort level, location, and overall experience — not just availability.",
    },
    {
      title: "Direct Coordination",
      desc: "Communication is clear and direct. You know what to expect before arrival and throughout your journey.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/travel/lake-boat.webp"
          alt="Private Uganda travel experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Private Travel</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            No crowds. No compromise.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Wild Spine journeys are built around the traveler — not the group.
            From pacing to accommodation to route design, everything is tailored
            to create a controlled, comfortable, and premium Uganda experience.
          </p>

          <a
            href="/#book"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Start a Private Journey
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="section-kicker">How it works</p>
          <h2 className="text-4xl md:text-6xl font-black mb-14">
            Designed around you.
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {pillars.map((item, index) => (
              <div key={item.title} className="package-card">
                <p className="text-yellow-500 font-black mb-4">
                  0{index + 1}
                </p>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-[#050605]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-kicker">Who this is for</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Travelers who value control and comfort.
            </h2>

            <ul className="space-y-4 text-gray-300 text-lg">
              <li>✓ Couples seeking a quiet, exclusive experience</li>
              <li>✓ Families wanting flexibility and safety</li>
              <li>✓ Solo travelers needing structured support</li>
              <li>✓ Professionals who want efficient, well-run trips</li>
            </ul>

            <a
              href="/#book"
              className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Request Private Planning
            </a>
          </div>

          <div className="h-[420px] rounded-3xl overflow-hidden">
            <img
              src="/images/travel/guide-guests.jpg"
              alt="Private hiking experience"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-black text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6">
          Built for people, not crowds.
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          If you want a Uganda journey that feels intentional, controlled, and
          personal — not rushed or crowded — this is where it begins.
        </p>

        <a
          href="/tours"
          className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
        >
          Explore Private Routes
        </a>
      </section>
    </main>
  );
}
