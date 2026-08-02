import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Refund and Cancellation Policy",
  description:
    "Review Wild Spine Uganda refund and cancellation guidance for deposits, permits, supplier costs, bank-transfer bookings, no-shows, and force majeure.",
  path: "/refund-policy",
});

export default function RefundPolicy() {
  return (
    <main className="bg-black px-6 py-24 text-white md:px-24">
      <div className="max-w-4xl">
        <p className="section-kicker">Booking protection</p>
        <h1 className="mb-8 mt-4 text-4xl font-black md:text-6xl">Refund & Cancellation Policy</h1>

        <p className="mb-6 leading-8 text-gray-400">
          Uganda safari refunds depend on permits, lodges, transport, domestic flights, guide
          commitments, bank charges, and supplier terms. Your final booking pack and invoice state
          the trip-specific cancellation schedule.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Deposits and non-refundable items</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Deposits may become non-refundable once Wild Spine commits funds to permits, suppliers,
          lodges, transport, or other reservations. Gorilla permits, chimpanzee permits, domestic
          flights, and some high-season lodge commitments may be non-refundable or difficult to amend.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Cancellations</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Cancellations must be made in writing and are effective only when received by Wild Spine.
          Any refund is calculated after deducting non-refundable supplier costs, bank charges,
          administrative costs, and cancellation fees stated in the booking documents.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Refund method</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Approved refunds are returned through a controlled finance process to a verified account.
          Refunds require authorised review and audit notes; they are not handled through informal
          personal accounts or social-media instructions.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">No-shows and unused services</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Failure to attend a booked trip, late arrival, missing travel documents, illness, or choosing
          not to use confirmed services may reduce or remove refund eligibility.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Force majeure</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Weather, road closures, park decisions, disease outbreaks, security restrictions, supplier
          disruption, government action, or other events outside Wild Spine&apos;s reasonable control may
          require itinerary changes, postponement, or supplier-led remedies.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Insurance</h2>
        <p className="text-gray-400">
          Travellers should arrange suitable travel insurance, including medical, evacuation,
          cancellation, curtailment, delay, and baggage cover.
        </p>
      </div>
    </main>
  );
}
