import Image from "next/image";
import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Why Trust Wild Spine Uganda?",
  description:
    "Wild Spine Uganda trust architecture covering legal identity, licensing, team profiles, permit handling, supplier selection, financial safeguards, emergency support, reviews, sustainability, and complaints.",
  path: "/why-wild-spine",
});

const proofSections = [
  ["Legal business identity", "Verified legal entity, registration number, and registered address will be displayed here once confirmed from official company documents. Until then, Wild Spine avoids publishing unverified claims."],
  ["Licensing status", "Tourism licence, guide credentials, memberships, and verification links will be added only after the documents are checked and current."],
  ["Permit handling", "Gorilla and chimpanzee permit planning is handled through official channels. Permit dates, sectors, and non-refundable conditions are explained before payment."],
  ["Supplier selection", "Lodges, transport providers, guides, porters, and specialist suppliers are selected around safety, location logic, reliability, guest fit, and written supplier terms."],
  ["Financial safeguards", "Every payment request is tied to an approved itinerary, itemised quotation, numbered invoice, official company-bank instructions, and authorised bank reconciliation."],
  ["Emergency support", "Travellers receive arrival, transfer, park, guide, and operations contacts in their confirmed booking pack. Emergency support procedures are documented before travel."],
  ["Insurance guidance", "Travellers are advised to arrange appropriate travel, medical, evacuation, cancellation, curtailment, and baggage insurance before departure."],
  ["Sustainability", "Wild Spine plans routes that respect park rules, local communities, guide professionalism, conservation priorities, and realistic pressure on sensitive ecosystems."],
  ["Reviews and references", "Public third-party review links and references will be added only when verified. Internal private feedback is never presented as a public-platform review."],
  ["Complaints process", "Complaints must be submitted in writing with booking references. Wild Spine logs the issue, acknowledges receipt, investigates, and responds with next steps."],
];

const teamPlaceholders = [
  ["Founder / Managing Director", "Full name, portrait, tourism experience, languages, specialist regions, and verified qualifications pending confirmation."],
  ["Senior Journey Planner", "Assigned planner profiles will show real names, portraits, languages, parks handled, and planning experience once approved."],
  ["Lead Guide / Field Operations", "Guide credentials, park specialisms, languages, first-aid or mountain qualifications, and licence details pending verification."],
];

const bookingControls = [
  "No booking is confirmed solely through WhatsApp or social media.",
  "No public user can mark an invoice paid.",
  "A transfer screenshot is recorded only as supporting advice, never proof of receipt.",
  "Finance must match bank transaction reference, sender, amount, currency, value date, and invoice reference.",
  "Corrections, refunds, and disputed statuses require admin-level review.",
  "Payment status changes create audit events for later review.",
];

export default function WhyWildSpinePage() {
  return (
    <main className="min-h-screen bg-[#fff9ea] text-[#123a2a]">
      <section className="relative isolate overflow-hidden bg-[#123a2a] px-6 py-32 text-white md:px-24">
        <Image
          src="/images/travel/bwindi-trek-ranger-guests.jpg"
          alt="Rangers and travelers preparing for a Bwindi forest trek"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#123a2a]/78" />
        <div className="mx-auto max-w-5xl">
          <p className="section-kicker">Why trust Wild Spine?</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
            Real trust is built from real people, precise documents, and verifiable controls.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/78">
            Wild Spine Uganda is moving beyond beautiful design into evidence-based trust:
            confirmed company identity, named team members, formal invoices, bank reconciliation,
            clear terms, and documented traveller support.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {proofSections.map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-[#d8cda9] bg-white/78 p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b8860b]">Trust evidence</p>
              <h2 className="mt-3 text-2xl font-black">{title}</h2>
              <p className="mt-4 leading-7 text-[#4c5f51]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d8cda9] bg-[#f8f4e8] px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Team and guide profiles</p>
            <h2 className="mt-3 text-4xl font-black">People trust identifiable people.</h2>
            <p className="mt-5 leading-8 text-[#68746a]">
              This section is intentionally placeholder-only until real portraits, names, experience,
              languages, regions, and qualifications are verified by Wild Spine management.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {teamPlaceholders.map(([role, text]) => (
              <article key={role} className="rounded-3xl border border-[#d8cda9] bg-white p-6">
                <div className="mb-5 flex h-28 items-center justify-center rounded-2xl border border-dashed border-[#d8cda9] bg-[#fff9ea] text-center text-xs font-black uppercase tracking-widest text-[#b8860b]">
                  Real portrait pending
                </div>
                <h3 className="text-xl font-black">{role}</h3>
                <p className="mt-3 text-sm leading-6 text-[#68746a]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-[#123a2a] p-8 text-white shadow-2xl">
            <p className="section-kicker">Client money controls</p>
            <h2 className="mt-3 text-4xl font-black">Company-bank transfer only, matched by finance.</h2>
            <p className="mt-5 text-lg leading-8 text-white/78">
              Wild Spine Uganda accepts payments only into the official company bank account stated on an
              authorised invoice. Transfer advice is not treated as proof of payment; receipts are issued
              only after authorised bank reconciliation.
            </p>
            <a href="/payment-information" className="mt-8 inline-flex rounded-full bg-[#f5b416] px-7 py-4 font-black text-black hover:bg-[#ffd766]">
              Read payment information
            </a>
          </div>

          <div className="grid gap-4">
            {bookingControls.map((item) => (
              <div key={item} className="rounded-2xl border border-[#d8cda9] bg-white/78 p-5">
                <p className="font-bold leading-7 text-[#365143]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#d8cda9] bg-[#f8f4e8] px-6 py-20 md:px-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="section-kicker">Booking confidence</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Start with a verified proposal, not a rushed payment.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#68746a]">
            You receive a written itinerary, itemised quotation, numbered invoice, cancellation terms,
            and assigned journey planner. Payments are accepted only by transfer to the official company
            bank account stated on your invoice.
          </p>
          <a href="/#book" className="mt-8 inline-flex rounded-full bg-[#f5b416] px-8 py-4 font-black text-black hover:bg-[#ffd766]">
            Request a verified safari proposal
          </a>
        </div>
      </section>
    </main>
  );
}
