export default function RareExperiencePage() {
  const experiences = [
    {
      title: "Mountain Gorilla Encounter",
      desc: "A quiet, emotional hour with one of the rarest great apes on earth.",
    },
    {
      title: "Equatorial Glacier Country",
      desc: "Rwenzori landscapes that shift from rainforest to alpine valleys and ice.",
    },
    {
      title: "Forest-to-Summit Contrast",
      desc: "Few African journeys move from jungle floor to frozen peak in one route.",
    },
    {
      title: "Uganda Beyond the Ordinary",
      desc: "A rare travel story that feels different from the standard safari circuit.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/gorilla.jpg"
          alt="Mountain gorilla encounter"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Rare Experience</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            Most travelers never find this Uganda.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Wild Spine connects two worlds few people experience together:
            mountain gorilla forests and the glacier landscapes of the Rwenzori.
            It is not ordinary tourism — it is a rare crossing.
          </p>

          <a
            href="/tours"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Explore Signature Journeys
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="section-kicker">What makes it rare</p>
          <h2 className="text-4xl md:text-6xl font-black mb-14">
            A journey built on contrast.
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {experiences.map((item, index) => (
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
          <div className="h-[420px] rounded-3xl overflow-hidden">
            <img
              src="/images/rwenzori.jpg"
              alt="Rwenzori Mountains"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <p className="section-kicker">For serious travelers</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Not another safari checklist.
            </h2>
            <p className="text-gray-400 text-lg leading-8">
              This is for travelers who want a story worth carrying home:
              gorilla eye contact, misty valleys, high-altitude trails,
              and a Uganda most people never see.
            </p>

            <a
              href="/#book"
              className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Request Private Planning
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}