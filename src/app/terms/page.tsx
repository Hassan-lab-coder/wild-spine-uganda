import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Booking Terms and Conditions",
  description:
    "Review Wild Spine Uganda booking terms covering availability, payments, traveler responsibilities, park rules, and itinerary changes.",
  path: "/terms",
});

export default function Terms() {
  return (
    <main className="bg-black text-white px-6 md:px-24 py-24">
      <div className="max-w-4xl">

        <h1 className="text-4xl md:text-6xl font-black mb-8">
          Terms & Conditions
        </h1>

        <p className="text-gray-400 mb-6">
          By booking with Wild Spine Uganda, you agree to the following terms.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Bookings</h2>
        <p className="text-gray-400 mb-6">
          All bookings are subject to availability, especially gorilla permits issued by Uganda Wildlife Authority.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Payments</h2>
        <p className="text-gray-400 mb-6">
          A deposit may be required to confirm your booking. Full payment must be completed before travel.
          When online payment is appropriate, Wild Spine Uganda may issue a secure provider link through
          Tazapay, Stripe, Flutterwave, or another approved payment partner. Always confirm the invoice number,
          itinerary scope, amount, currency, and booking terms before paying.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Travel Responsibility</h2>
        <p className="text-gray-400 mb-6">
          Clients are responsible for visas, vaccinations, and travel insurance.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Gorilla Trekking Rules</h2>
        <p className="text-gray-400 mb-6">
          Visitors must follow Uganda Wildlife Authority guidelines, including maintaining distance from gorillas and respecting park rules.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Changes</h2>
        <p className="text-gray-400">
          Itineraries may change due to weather, safety, or park regulations.
        </p>

      </div>
    </main>
  );
}
