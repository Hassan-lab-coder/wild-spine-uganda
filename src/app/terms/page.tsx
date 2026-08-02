import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Booking Terms and Conditions",
  description:
    "Review Wild Spine Uganda booking terms covering availability, company-bank transfer payments, traveler responsibilities, park rules, and itinerary changes.",
  path: "/terms",
});

export default function Terms() {
  return (
    <main className="bg-black px-6 py-24 text-white md:px-24">
      <div className="max-w-4xl">
        <p className="section-kicker">Wild Spine Uganda</p>
        <h1 className="mb-8 mt-4 text-4xl font-black md:text-6xl">Terms & Conditions</h1>

        <p className="mb-6 leading-8 text-gray-400">
          These public terms summarise Wild Spine Uganda&apos;s booking approach. Final trip-specific
          terms, cancellation rules, non-refundable supplier costs, and due dates are stated in your
          written itinerary, quotation, and numbered invoice.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Bookings</h2>
        <p className="mb-6 leading-8 text-gray-400">
          All bookings are subject to availability, including gorilla permits, chimpanzee permits,
          lodges, transport, specialist guides, and park procedures. No booking is confirmed solely
          through WhatsApp, social media, or a verbal message.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Company-bank transfer payments</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Wild Spine Uganda accepts booking payments only by transfer to the official company bank
          account stated on your authorised invoice. Full bank instructions are not published on
          public pages. A transfer screenshot, remittance slip, or transfer advice does not prove
          receipt; payment is confirmed only after authorised bank reconciliation.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Deposits, permits, and balances</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Your invoice may require a deposit plus full payment of non-refundable items such as
          permits, domestic flights, or supplier commitments. The balance due date is stated on
          the invoice and booking confirmation. Supplier deadlines may require earlier payment.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Bank charges</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Originating, intermediary, correspondent, and receiving-bank charges are the traveller&apos;s
          responsibility unless agreed otherwise in writing. The full invoiced amount must arrive
          in the Wild Spine Uganda company account.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Travel responsibility</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Travellers are responsible for passports, visas, health requirements, vaccinations,
          personal fitness, and appropriate travel, medical, evacuation, cancellation, and baggage
          insurance.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Gorilla trekking and park rules</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Visitors must follow Uganda Wildlife Authority and park guidance, including ranger
          instructions, health restrictions, viewing distance, time limits, and conservation rules.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Changes and complaints</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Itineraries may change due to weather, road conditions, safety, supplier availability,
          park regulation, or force majeure. Complaints should be submitted in writing with the
          invoice or booking reference so Wild Spine can investigate and respond formally.
        </p>

        <a href="/payment-information" className="mt-6 inline-flex rounded-full bg-yellow-500 px-7 py-4 font-black text-black hover:bg-yellow-400">
          Read payment information
        </a>
      </div>
    </main>
  );
}
