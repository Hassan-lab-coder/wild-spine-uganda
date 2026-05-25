type TourConversionSectionsProps = {
  tourName: string;
  proof: string;
  inclusions: string[];
  exclusions: string[];
  faqs: Array<[string, string]>;
};

export default function TourConversionSections({
  tourName,
  proof,
  inclusions,
  exclusions,
  faqs,
}: TourConversionSectionsProps) {
  const inquiryHref = `/?route=${encodeURIComponent(tourName)}&source=${encodeURIComponent(tourName.toLowerCase().replaceAll(" ", "_"))}_detail#book`;

  return (
    <section className="px-6 md:px-24 pb-28">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="section-kicker">Why travelers book this route</p>
          <h2 className="text-3xl md:text-4xl font-black mb-5">{tourName} confidence</h2>
          <p className="text-gray-400 leading-8">{proof}</p>
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
            <h3 className="text-2xl font-black mb-5">Included</h3>
            <ul className="space-y-3 text-gray-300">
              {inclusions.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-black mb-5">Not Included</h3>
            <ul className="space-y-3 text-gray-300">
              {exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 rounded-3xl border border-white/10 bg-white/5 p-8">
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
