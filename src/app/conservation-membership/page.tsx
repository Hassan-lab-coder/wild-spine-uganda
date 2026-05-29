import type { Metadata } from "next";
import PremiumLeadForm from "../components/PremiumLeadForm";

export const metadata: Metadata = {
  title: "Conservation Membership",
  description:
    "Become a Wild Spine conservation member and support long-term protection, local impact, and Uganda wilderness storytelling.",
  alternates: {
    canonical: "/conservation-membership",
  },
};

const tiers = [
  {
    name: "Explorer Member",
    price: "$50-100 / year",
    desc: "A simple way for past and future travelers to stay connected to Uganda's wild places.",
    benefits: ["Quarterly field notes", "Wildlife stories", "Exclusive videos", "Digital membership card"],
  },
  {
    name: "Conservation Partner",
    price: "$250-500 / year",
    desc: "For supporters who want visible conservation updates and a closer connection to impact.",
    benefits: ["Everything in Explorer", "Tree planting record", "Impact reports", "Private webinars", "Tour savings"],
  },
  {
    name: "Legacy Guardian",
    price: "$1,000+ / year",
    desc: "A premium circle for supporters funding named conservation and community initiatives.",
    benefits: ["VIP expedition invitations", "Project recognition", "Annual impact report", "Private planning access"],
  },
];

const principles = [
  ["Proof over promises", "Members should receive clear updates, photos, locations, and project context."],
  ["Local benefit", "Impact must support conservation work and community participation around real landscapes."],
  ["Travel connection", "Membership deepens the relationship before, during, and long after the journey."],
];

export default function ConservationMembershipPage() {
  return (
    <main className="min-h-screen bg-[#f8f4e8] text-[#123a2a]">
      <section className="relative min-h-screen overflow-hidden px-6 py-32 text-white md:px-24">
        <img
          src="/images/travel/traveler-trust-gorilla.jpg"
          alt="Young mountain gorilla in Uganda forest"
          className="absolute inset-0 h-full w-full object-cover object-[28%_center]"
        />
        <div className="absolute inset-0 bg-black/68" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123a2a]/80 via-black/38 to-black/10" />

        <div className="relative z-10 mx-auto max-w-7xl pt-20">
          <div className="max-w-5xl hero-copy">
            <p className="section-kicker">Conservation Membership</p>
            <h1 className="mb-8 text-5xl font-black leading-[0.95] md:text-8xl">
              Become a guardian of Uganda&apos;s wild places.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/82 md:text-xl">
              Wild Spine membership gives travelers and supporters a way to stay connected,
              fund visible impact, and help protect the landscapes they came to love.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="#membership-request" className="rounded-full bg-[#f5b416] px-8 py-4 text-center font-black text-black transition hover:bg-[#ffd766]">
                Become a Member
              </a>
              <a href="#tiers" className="rounded-full border border-white/30 px-8 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
                View Memberships
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="tiers" className="px-6 py-28 md:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="section-kicker">Member Circles</p>
            <h2 className="text-4xl font-black md:text-6xl">Support that continues after the trip.</h2>
            <p className="mt-6 text-lg leading-8 text-[#68746a]">
              Membership turns a one-time safari customer into a long-term supporter. The key is transparency, quality storytelling, and visible conservation progress.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <article key={tier.name} className={`premium-card ${index === 1 ? "featured-card" : ""}`}>
                <p className="mb-4 text-sm font-black uppercase tracking-widest text-[#b8860b]">0{index + 1}</p>
                <h3 className="mb-3 text-3xl font-black">{tier.name}</h3>
                <p className="mb-5 font-bold text-[#123a2a]">{tier.price}</p>
                <p className="mb-7 leading-7 text-[#68746a]">{tier.desc}</p>
                <ul className="space-y-3 text-sm font-semibold text-[#3d4a41]">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit}>- {benefit}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#123a2a] px-6 py-28 text-white md:px-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">Credibility Rules</p>
            <h2 className="text-4xl font-black md:text-6xl">Impact must be documented.</h2>
            <p className="mt-6 text-lg leading-8 text-white/70">
              A premium conservation brand earns trust by showing exactly what support makes possible.
            </p>
          </div>
          <div className="grid gap-5">
            {principles.map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/12 bg-white/8 p-6">
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="membership-request" className="px-6 py-28 md:px-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="section-kicker">Join the Circle</p>
            <h2 className="text-4xl font-black md:text-6xl">Start with interest, then confirm the right level.</h2>
            <p className="mt-6 text-lg leading-8 text-[#68746a]">
              Membership can begin as a conversation. Wild Spine can confirm the level, payment path, reporting rhythm, and project focus before taking support.
            </p>
          </div>
          <PremiumLeadForm
            leadSource="conservation_membership_page"
            type="conservation membership inquiry"
            title="Register membership interest"
            subtitle="For travelers, families, companies, and supporters who want a lasting connection to Uganda."
            routeLabel="Membership level"
            routePlaceholder="Select membership level"
            routeOptions={["Explorer Member", "Conservation Partner", "Legacy Guardian", "Corporate Conservation Partner"]}
            cta="Register Interest"
            successType="conservation-membership"
            budgetOptions={["$50 - $100 / year", "$250 - $500 / year", "$1,000+ / year", "Corporate support", "Not sure yet"]}
          />
        </div>
      </section>
    </main>
  );
}
