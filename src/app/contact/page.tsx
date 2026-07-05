import type { Metadata } from "next";
import PremiumLeadForm from "../components/PremiumLeadForm";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata({
  title: "Contact Wild Spine Uganda",
  description:
    "Contact Wild Spine Uganda for private gorilla trekking, Rwenzori expeditions, permit planning, corporate retreats, and custom Uganda journeys.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#123a2a] px-6 py-28 text-white md:px-16">
      <section className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="section-kicker">Contact Wild Spine</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">Begin with a calm conversation.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/75">
            Tell us where Uganda fits into your plans. Our local team will respond with realistic timing,
            route questions, and the safest next step before you commit money.
          </p>
          <address className="mt-10 not-italic leading-8 text-white/80">
            <strong className="text-white">Wild Spine Uganda</strong><br />
            Planning office: Victoria Mall, Entebbe<br />
            Kampala meetings: Kingdom Kampala, Kampala<br />
            P.O. Box 25543 Kampala, Uganda<br />
            <a className="text-[#f5b416] hover:underline" href="mailto:reservations@wildspineuganda.com">reservations@wildspineuganda.com</a><br />
            <a className="text-[#f5b416] hover:underline" href="https://wa.me/256751828241">WhatsApp: +256 751 828 241</a>
          </address>
        </div>
        <PremiumLeadForm
          leadSource="contact_page"
          type="contact inquiry"
          title="How can we help?"
          subtitle="Share your dates, interests, and the question you want answered first."
          routeOptions={[
            "Custom Uganda Safari",
            "Bwindi Gorilla Trekking",
            "Gorilla Permit Help",
            "Rwenzori Hiking Tour",
            "Corporate Retreat",
            "Conservation Membership",
          ]}
          routeLabel="What are you planning?"
          routePlaceholder="Choose an inquiry type"
          cta="Send My Inquiry"
          successType="contact"
        />
      </section>
    </main>
  );
}
