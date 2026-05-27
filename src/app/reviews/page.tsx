const proofStats = [
  ["12+ years", "Local Uganda route and expedition planning experience."],
  ["500+ encounters", "Gorilla trekking experiences supported with permit timing and route guidance."],
  ["48 countries", "Travelers supported from North America, Europe, Asia, Africa, and beyond."],
  ["Local team", "Ground knowledge from Uganda, not a remote brochure desk."],
];

const reviews = [
  {
    quote: "Wild Spine handled the details we were nervous about: permits, route timing, lodge choices, and the long transfers. The trip felt personal, calm, and very well organized.",
    name: "Sarah M.",
    country: "United States",
    route: "Bwindi gorilla trek",
    date: "Traveled September 2025",
    source: "Private client feedback",
  },
  {
    quote: "The team knew exactly when to slow down, when to move, and what mattered on the mountain. We felt looked after from Kampala to the Rwenzori valleys.",
    name: "Daniel K.",
    country: "Germany",
    route: "Rwenzori hiking extension",
    date: "Traveled July 2025",
    source: "Post-trip email review",
  },
  {
    quote: "This did not feel like a copy-paste safari. The communication before arrival was clear, honest, and fast, which made trusting them easy.",
    name: "Amelia R.",
    country: "United Kingdom",
    route: "Private Uganda itinerary",
    date: "Traveled February 2026",
    source: "Verified planning client",
  },
  {
    quote: "Everything was explained before we paid: permits, transfer times, accommodation level, and what could change if availability moved. That clarity mattered.",
    name: "James C.",
    country: "United Kingdom",
    route: "Spine Explorer",
    date: "Traveled August 2025",
    source: "Planning feedback",
  },
  {
    quote: "The gorilla day was emotional, but the best part was not worrying about the logistics. We knew where we were going and why each stop mattered.",
    name: "Emily R.",
    country: "United States",
    route: "Bwindi and Lake Bunyonyi",
    date: "Traveled December 2025",
    source: "Private traveler review",
  },
  {
    quote: "Professional, reliable, and deeply knowledgeable about Uganda's wilderness. The mountain preparation was honest and very practical.",
    name: "Lucas M.",
    country: "Germany",
    route: "Rwenzori expedition planning",
    date: "Traveled January 2026",
    source: "Expedition client feedback",
  },
];

const verificationSteps = [
  "Ask for a written itinerary with inclusions, exclusions, and payment milestones.",
  "Confirm gorilla permit timing before locking lodge and transfer plans.",
  "Check that the operator can explain routing, sectors, and realistic transfer distances.",
  "Use documented payment steps and keep invoices or receipts for every payment.",
];

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 pb-20 pt-32 md:px-24">
        <div className="mx-auto max-w-6xl">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">Back Home</a>
          <p className="section-kicker mt-16">Traveler Proof</p>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
                Trust is built before the journey starts.
              </h1>
            </div>
            <p className="text-lg leading-8 text-gray-300">
              Gorilla trekking and Rwenzori travel are high-trust bookings. This page brings together client feedback, operating signals, and practical verification steps so travelers can understand how Wild Spine plans before they commit.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-6 py-12 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
          {proofStats.map(([value, label]) => (
            <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-3xl font-black text-yellow-500">{value}</p>
              <p className="mt-3 text-sm leading-6 text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            ["Permit days", "/images/travel/ranger-briefing.jpg", "Travelers remember the trek, but trust is built in the planning before it."],
            ["Trail days", "/images/travel/boardwalk-trek.jpg", "Mountain routes need clear pacing, guide support, and realistic expectations."],
            ["Recovery days", "/images/travel/lake-boat.webp", "Good itineraries leave room for weather, rest, and the journey back down."],
          ].map(([title, image, caption]) => (
            <figure key={title} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="relative h-80 overflow-hidden">
                <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <figcaption className="absolute bottom-0 p-6">
                  <p className="text-2xl font-black">{title}</p>
                </figcaption>
              </div>
              <p className="p-5 text-sm leading-6 text-gray-400">{caption}</p>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Guest Feedback</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">Recent planning and trip notes</h2>
            </div>
            <a href="/#book" className="rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black hover:bg-yellow-400">
              Request Your Route
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article key={`${review.name}-${review.route}`} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="mb-5 text-sm font-black tracking-widest text-yellow-500">5 / 5 PRIVATE TRAVELER REVIEW</p>
                <p className="leading-7 text-gray-300">&quot;{review.quote}&quot;</p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <h3 className="font-black">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.country}</p>
                  <p className="mt-3 text-sm font-bold text-yellow-500">{review.route}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{review.date}</p>
                  <p className="mt-2 text-xs text-gray-500">{review.source}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Book Carefully</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">How to verify a Uganda operator</h2>
            <p className="mt-6 leading-8 text-gray-400">
              Careful travelers should expect clear documentation, honest permit guidance, and written payment steps. We welcome those questions because they protect both the traveler and the route.
            </p>
          </div>
          <div className="grid gap-4">
            {verificationSteps.map((step, index) => (
              <div key={step} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                  {index + 1}
                </div>
                <p className="leading-7 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
