export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/travel/terraced-mountains.jpg"
          alt="Rwenzori Mountains"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-5xl">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">About Wild Spine Uganda</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            We are not a brochure. <br />
            We are Uganda.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Built from real ground experience — from gorilla forests to glacier peaks —
            Wild Spine exists to take you deeper into Uganda than most ever go.
          </p>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-kicker">Our Philosophy</p>

            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Designed for depth, not tourism.
            </h2>

            <p className="text-gray-400 leading-8 text-lg">
              We do not sell trips — we design journeys. Every expedition is built
              with intention: pacing, terrain, emotional experience, and real access.
            </p>
          </div>

          <div className="h-[400px] rounded-3xl overflow-hidden">
            <img
              src="/images/travel/forest-trek.jpg"
              alt="Uganda forest"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="group relative h-[320px] rounded-3xl overflow-hidden">
            <img
              src="/images/travel/forest-guide.jpg"
              alt="Mountain gorilla"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
              <h3 className="text-2xl font-black">Gorilla Encounters</h3>
              <p className="text-gray-300 text-sm mt-2">
                Face-to-face moments in Bwindi forest.
              </p>
            </div>
          </div>

          <div className="group relative h-[320px] rounded-3xl overflow-hidden">
            <img
              src="/images/travel/boardwalk-trek.jpg"
              alt="Hiking in Uganda"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
              <h3 className="text-2xl font-black">Rwenzori Trails</h3>
              <p className="text-gray-300 text-sm mt-2">
                Alpine landscapes on the equator.
              </p>
            </div>
          </div>

          <div className="group relative h-[320px] rounded-3xl overflow-hidden">
            <img
              src="/images/travel/safari-elephants.jpg"
              alt="Uganda safari elephants"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-6 flex flex-col justify-end h-full">
              <h3 className="text-2xl font-black">Safari Extensions</h3>
              <p className="text-gray-300 text-sm mt-2">
                Open plains and wildlife days beyond the forest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
