import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Refund and Cancellation Policy",
  description:
    "Review Wild Spine Uganda refund and cancellation guidance for deposits, permits, cancellations, no-shows, and force majeure.",
  path: "/refund-policy",
});

export default function RefundPolicy() {
  return (
    <main className="bg-black text-white px-6 md:px-24 py-24">
      <div className="max-w-4xl">

        <h1 className="text-4xl md:text-6xl font-black mb-8">
          Refund Policy
        </h1>

        <p className="text-gray-400 mb-6">
          Due to the nature of gorilla trekking permits and travel logistics, refunds are limited.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Deposits</h2>
        <p className="text-gray-400 mb-6">
          Deposits are generally non-refundable once permits are secured.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Cancellations</h2>
        <p className="text-gray-400 mb-6">
          Cancellations made 30+ days before travel may be partially refunded depending on expenses incurred.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">No Shows</h2>
        <p className="text-gray-400 mb-6">
          Failure to attend a booked trip without notice will not be refunded.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Force Majeure</h2>
        <p className="text-gray-400">
          Wild Spine Uganda is not liable for disruptions caused by weather, political events, or natural disasters.
        </p>

      </div>
    </main>
  );
}
