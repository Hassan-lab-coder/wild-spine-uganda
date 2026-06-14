const assurances = [
  "Licensed and experienced local guides",
  "Permit handling through official channels",
  "Structured itineraries with full support",
  "Designed for international travelers",
];

export default function TrustSafetyBlock() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#123a2a] px-6 py-16 text-white md:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="section-kicker">Trust and safety</p>
          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            Reassurance built into the route, not added at the end.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {assurances.map((item) => (
            <div key={item} className="rounded-lg border border-white/12 bg-white/8 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-[#f5b416]">Verified</p>
              <p className="mt-2 font-bold leading-7 text-white/82">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
