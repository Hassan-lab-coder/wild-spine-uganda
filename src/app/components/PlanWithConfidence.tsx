import { bankTransferTrustPoints } from "@/lib/bank-transfer";

export default function PlanWithConfidence() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#fff9ea] px-6 py-20 text-[#123a2a] md:px-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="section-kicker">Booking confidence</p>
          <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            Plan Uganda with confidence.
          </h2>
          <p className="mt-5 leading-8 text-[#68746a]">
            Your safari is planned before payment is requested. Once your itinerary, availability,
            and quotation are agreed, Wild Spine Uganda issues a numbered invoice with the official
            company-bank instructions for that booking.
          </p>
          <a
            href="/payment-information"
            className="mt-7 inline-flex rounded-full border border-[#d8cda9] px-6 py-3 text-sm font-black uppercase tracking-widest text-[#123a2a] transition hover:border-[#f5b416] hover:bg-[#f5b416]/20"
          >
            Read how payment works
          </a>
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
          {bankTransferTrustPoints.map((point) => (
            <div key={point} className="flex min-h-28 items-center rounded-2xl border border-[#d8cda9] bg-white/78 p-5 shadow-sm">
              <p className="font-bold leading-7 text-[#365143]">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
