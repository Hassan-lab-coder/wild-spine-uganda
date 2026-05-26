type TourConversionSectionsProps = {
  tourName: string;
  proof: string;
  inclusions: string[];
  exclusions: string[];
  lodgeExamples?: string[];
  priceNotes?: string[];
  faqs: Array<[string, string]>;
};

export default function TourConversionSections({
  tourName,
  proof,
  inclusions,
  exclusions,
  lodgeExamples = [],
  priceNotes = [],
  faqs,
}: TourConversionSectionsProps) {
  const inquiryHref = `/?route=${encodeURIComponent(tourName)}&source=${encodeURIComponent(tourName.toLowerCase().replaceAll(" ", "_"))}_detail#book`;

  return (
    <section className="px-6 pb-28 md:px-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="section-kicker">Why travelers book this route</p>
          <h2 className="mb-5 mt-3 text-3xl font-black md:text-4xl">{tourName} confidence</h2>
          <p className="leading-8 text-gray-400">{proof}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Private planning", "Permit guidance", "Local support"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold text-yellow-500">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="mb-5 text-2xl font-black">Included</h3>
            <ul className="space-y-3 text-gray-300">
              {inclusions.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="mb-5 text-2xl font-black">Not Included</h3>
            <ul className="space-y-3 text-gray-300">
              {exclusions.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {(lodgeExamples.length > 0 || priceNotes.length > 0) && (
        <div className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-2">
          {lodgeExamples.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="section-kicker">Sample Lodge Style</p>
              <h3 className="mb-5 mt-3 text-3xl font-black">Where you might stay</h3>
              <p className="mb-5 leading-7 text-gray-400">
                Final accommodation depends on permit sector, budget, season, and availability. These are style examples, not fixed promises.
              </p>
              <ul className="space-y-3 text-gray-300">
                {lodgeExamples.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          )}

          {priceNotes.length > 0 && (
            <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8">
              <p className="section-kicker">Price Clarity</p>
              <h3 className="mb-5 mt-3 text-3xl font-black">Before you confirm</h3>
              <ul className="space-y-3 text-gray-200">
                {priceNotes.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="section-kicker">Route FAQ</p>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <summary className="cursor-pointer font-black">{question}</summary>
              <p className="mt-4 leading-7 text-gray-400">{answer}</p>
            </details>
          ))}
        </div>
        <a
          href={inquiryHref}
          className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400"
        >
          Request This Route
        </a>
      </div>
    </section>
  );
}
