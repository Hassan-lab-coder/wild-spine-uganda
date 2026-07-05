import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Privacy Policy",
  description:
    "Read how Wild Spine Uganda collects, uses, and protects personal information submitted for travel planning and bookings.",
  path: "/privacy",
});

export default function Privacy() {
  return (
    <main className="bg-black text-white px-6 md:px-24 py-24">
      <div className="max-w-4xl">

        <h1 className="text-4xl md:text-6xl font-black mb-8">
          Privacy Policy
        </h1>

        <p className="text-gray-400 mb-6">
          At Wild Spine Uganda, we respect your privacy and are committed to protecting your personal information.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Information We Collect</h2>
        <p className="text-gray-400 mb-6">
          We collect personal details such as your name, email, travel preferences, and booking information when you submit inquiries or book a trip.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">How We Use Your Information</h2>
        <p className="text-gray-400 mb-6">
          Your data is used to plan your journey, secure permits, arrange accommodations, and communicate with you.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Data Protection</h2>
        <p className="text-gray-400 mb-6">
          We implement secure systems to protect your data and never sell your information to third parties.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Third-Party Services</h2>
        <p className="text-gray-400 mb-6">
          Payments and bookings may be processed through secure third-party providers such as Flutterwave or PayPal.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4">Contact</h2>
        <p className="text-gray-400">
          For privacy concerns, contact us at: reservations@wildspineuganda.com
        </p>

      </div>
    </main>
  );
}
