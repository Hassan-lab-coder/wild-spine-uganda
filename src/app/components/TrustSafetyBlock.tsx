const assurances = [
  "Business and guide details are published only after verification",
  "Permit planning follows official park channels",
  "Numbered invoices before any company-bank transfer",
  "No personal-account or social-media payments",
  "Receipts are issued only after bank reconciliation",
];

export default function TrustSafetyBlock() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#123a2a] px-6 py-16 text-white md:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="section-kicker">Safe booking habits</p>
          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            Clear safeguards, written in plain language.
          </h2>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
          {assurances.map((item) => (
            <div key={item} className="flex min-h-24 items-center rounded-2xl border border-white/12 bg-white/8 p-5">
              <p className="font-bold leading-7 text-white/82">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
