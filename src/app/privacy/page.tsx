import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Privacy Policy",
  description:
    "Read how Wild Spine Uganda collects, uses, and protects personal information submitted for travel planning, invoices, bank-transfer reconciliation, and bookings.",
  path: "/privacy",
});

export default function Privacy() {
  return (
    <main className="bg-black px-6 py-24 text-white md:px-24">
      <div className="max-w-4xl">
        <p className="section-kicker">Wild Spine Uganda</p>
        <h1 className="mb-8 mt-4 text-4xl font-black md:text-6xl">Privacy Policy</h1>

        <p className="mb-6 leading-8 text-gray-400">
          Wild Spine Uganda collects only the information needed to answer inquiries, plan journeys,
          issue proposals and invoices, reconcile authorised bank transfers, provide receipts, and
          support travellers before, during, and after a trip.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Information we collect</h2>
        <p className="mb-6 leading-8 text-gray-400">
          We may collect your name, email, WhatsApp or telephone number, country, travel month,
          route interests, group size, preferences, messages, invoice details, payment references,
          and operational correspondence. Do not send passport data or sensitive medical information
          unless it is specifically requested through an approved booking process.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">How we use information</h2>
        <p className="mb-6 leading-8 text-gray-400">
          We use information to respond to inquiries, design itineraries, check permits and suppliers,
          issue quotations and invoices, reconcile bank transfers, send receipts, manage support,
          prevent fraud, and maintain internal records.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Bank-transfer reconciliation</h2>
        <p className="mb-6 leading-8 text-gray-400">
          Finance may record bank transaction references, sender names, amounts, currencies, value
          dates, invoice references, reconciliation notes, and authorised staff actions. A transfer
          advice is treated as supporting information only, not proof of payment.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Data protection</h2>
        <p className="mb-6 leading-8 text-gray-400">
          We use access controls, server-side validation, audit events, and restricted administrative
          workflows to protect records. Public users cannot mark invoices paid or access full bank
          instructions through public pages.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Third-party services</h2>
        <p className="mb-6 leading-8 text-gray-400">
          We may use infrastructure, email, analytics, database, security, and hosting providers to
          operate the website and booking workflow. Safari payments are currently handled by verified
          company-bank transfer only.
        </p>

        <h2 className="mb-4 mt-10 text-2xl font-bold">Contact</h2>
        <p className="text-gray-400">
          For privacy concerns, contact: <a className="text-yellow-500 hover:underline" href="mailto:reservations@wildspineuganda.com">reservations@wildspineuganda.com</a>
        </p>
      </div>
    </main>
  );
}
