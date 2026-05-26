const permitFacts = [
  ["Limited daily spaces", "Permit availability can shape your exact travel date, Bwindi sector, lodge options, and transfer route."],
  ["Payment matters", "A permit is only secure after the proper booking and payment process is completed through the authorized system."],
  ["Sector affects logistics", "Buhoma, Ruhija, Rushaga, and Nkuringo each change lodge choice, drive times, and extension options."],
  ["Refund rules are strict", "Gorilla permits are usually difficult or impossible to transfer or refund once secured."],
];

const sectorNotes = [
  ["Buhoma", "Classic northern Bwindi access, strong lodge options, and useful routing toward Queen Elizabeth."],
  ["Ruhija", "Higher, cooler sector with scenic routing and good access for some western Uganda combinations."],
  ["Rushaga", "Flexible southern access, often useful for Lake Bunyonyi and Rwanda-side extensions."],
  ["Nkuringo", "Dramatic terrain and premium lodge possibilities, but transfer planning needs care."],
];

const planningSteps = [
  ["Share dates", "Send your travel month, group size, preferred comfort level, and whether dates are flexible."],
  ["Check options", "We review realistic permit sectors, lodge availability, transfer timing, and route fit."],
  ["Confirm in writing", "You receive a clear plan with inclusions, exclusions, payment steps, and booking conditions."],
  ["Secure properly", "Once you approve, permit and travel services are secured in the right order."],
];

const permitInquiryHref = "/?route=Gorilla%20Permit%20Help&source=permit_help#book";

export default function UgandaGorillaPermitHelpPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-[82vh] items-center overflow-hidden px-6 py-32 md:px-24">
        <img src="/images/forest.jpg" alt="Bwindi forest gorilla permit planning" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">Back Home</a>
          <p className="section-kicker mt-16">Uganda Gorilla Permit Help</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            Secure the right permit before the rest of the trip locks you in.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-300">
            Gorilla permits are not just tickets. They determine your date, sector, lodge area, transfer route, and sometimes the whole shape of a Uganda itinerary.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={permitInquiryHref} className="rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400">Request Permit Help</a>
            <a href="https://wa.me/256751828241" className="rounded-full border border-white/20 px-8 py-4 font-black hover:bg-white hover:text-black">Ask on WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="section-kicker">What Travelers Need To Know</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">Permit clarity prevents expensive mistakes.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {permitFacts.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Bwindi Sectors</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">The sector matters as much as the date.</h2>
            <p className="mt-6 leading-8 text-gray-400">
              We help match permit availability to lodge style, transfer reality, route pacing, and what you want to do before or after the trek.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sectorNotes.map(([sector, note]) => (
              <div key={sector} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-2xl font-black text-yellow-500">{sector}</h3>
                <p className="mt-4 leading-7 text-gray-400">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-kicker">Planning Process</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">How Wild Spine handles permit requests</h2>
            <div className="mt-8 grid gap-4">
              {planningSteps.map(([title, text], index) => (
                <div key={title} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className="mt-2 leading-7 text-gray-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8">
            <h3 className="text-3xl font-black">Before you pay for a permit</h3>
            <ul className="mt-6 space-y-4 leading-7 text-gray-300">
              <li>Confirm the trekking date and sector in writing.</li>
              <li>Understand whether your quote includes transport, lodging, meals, park fees, and guide support.</li>
              <li>Ask how changes are handled if permits, lodges, or road conditions shift.</li>
              <li>Keep invoices and receipts for every payment.</li>
            </ul>
            <a href={permitInquiryHref} className="mt-8 inline-block rounded-full bg-yellow-500 px-7 py-4 font-black text-black hover:bg-yellow-400">
              Check Permit Options
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
