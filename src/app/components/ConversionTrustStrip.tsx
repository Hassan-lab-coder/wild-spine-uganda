const trustItems = [
  {
    label: "For overseas guests",
    detail: "Built for travelers flying in from the UK, US, Europe, and other long-haul markets.",
  },
  {
    label: "Private journeys from $1,500+",
    detail: "Tailor-made routes shaped around permits, comfort, pacing, and lodge fit.",
  },
  {
    label: "Clear reply within 24 hours",
    detail: "Expect practical timing, route questions, and permit guidance before quoting.",
  },
];

const shortQuotes = [
  "The planning felt calm, personal, and very well organized.",
  "We always knew the next step before we arrived in Uganda.",
  "Not a copy-paste safari. The communication made trusting them easy.",
];

export default function ConversionTrustStrip() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#fff9ea] px-6 py-10 md:px-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="section-kicker">Traveler confidence</p>
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Built for travelers who want clarity before they book.
          </h2>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#d8cda9] bg-white/72 p-5 shadow-sm">
              <h3 className="text-lg font-black leading-tight text-[#123a2a]">{item.label}</h3>
              <p className="mt-3 text-sm leading-6 text-[#68746a]">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-3 md:grid-cols-3">
        {shortQuotes.map((quote) => (
          <p key={quote} className="rounded-full border border-[#d8cda9] bg-white/55 px-5 py-3 text-sm font-bold text-[#4e6257]">
            &quot;{quote}&quot;
          </p>
        ))}
      </div>
    </section>
  );
}
