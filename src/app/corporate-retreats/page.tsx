import { seoMetadata } from "@/lib/seo";
import Image from "next/image";
import PremiumLeadForm from "../components/PremiumLeadForm";

export const metadata = seoMetadata({
  title: "Corporate Retreats in Uganda",
  description:
    "Premium executive wilderness retreats in Uganda combining gorilla trekking, leadership sessions, private logistics, and conservation impact.",
  path: "/corporate-retreats",
  image: "/images/travel/corporate-retreat.jpg",
  keywords: ["corporate retreats Uganda", "executive retreat Uganda", "leadership retreat Africa"],
});

const retreatFormats = [
  {
    title: "Gorilla Leadership Retreat",
    length: "3-4 days",
    price: "From $3,000 per person",
    desc: "A focused executive retreat built around Bwindi, private facilitation, conservation context, and deep team reflection.",
  },
  {
    title: "Founder Wilderness Reset",
    length: "5-6 days",
    price: "Custom proposal",
    desc: "Private wilderness time for founders and senior teams who need clarity, recovery, and rare shared experience away from boardrooms.",
  },
  {
    title: "Conservation Strategy Offsite",
    length: "4-7 days",
    price: "Custom proposal",
    desc: "Designed for NGOs, boards, impact funds, and leadership groups connecting strategy with Uganda's real wild landscapes.",
  },
];

const retreatFlow = [
  ["01", "Executive brief", "We understand the team, goals, dates, privacy needs, facilitation style, and comfort level."],
  ["02", "Route design", "We shape the retreat around gorilla permits, lodge fit, transfer time, working sessions, and recovery space."],
  ["03", "Private delivery", "On the ground, Wild Spine coordinates logistics, guides, schedule rhythm, and local conservation experiences."],
];

export default function CorporateRetreatsPage() {
  return (
    <main className="min-h-screen bg-[#f8f4e8] text-[#123a2a]">
      <section className="relative min-h-screen overflow-hidden px-6 py-32 text-white md:px-24">
        <Image
          src="/images/travel/corporate-retreat.jpg"
          alt="Corporate retreat group on a Uganda safari plain"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-[#123a2a]/35 to-black/20" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="hero-copy">
            <p className="section-kicker">Executive Wilderness Retreats</p>
            <h1 className="mb-8 text-5xl font-black leading-[0.95] md:text-8xl">
              Take leadership out of the boardroom.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/82 md:text-xl">
              Wild Spine designs private Uganda retreats for leadership teams who want
              sharper thinking, stronger trust, and a rare shared experience in the wild.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="#retreat-request" className="rounded-full bg-[#f5b416] px-8 py-4 text-center font-black text-black transition hover:bg-[#ffd766]">
                Request Retreat Proposal
              </a>
              <a href="#formats" className="rounded-full border border-white/30 px-8 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
                View Formats
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md md:p-7">
            {[
              ["Best for", "CEOs, founders, boards, NGOs, senior teams"],
              ["Group size", "6-16 leaders"],
              ["Positioning", "Private, premium, confidential"],
              ["Core value", "Leadership work shaped by wilderness, not hotel walls"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-[#f5b416]">{label}</p>
                <p className="mt-2 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="formats" className="px-6 py-28 md:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="section-kicker">Premium Formats</p>
            <h2 className="text-4xl font-black md:text-6xl">Retreats with real commercial weight.</h2>
            <p className="mt-6 text-lg leading-8 text-[#68746a]">
              These are not generic hotel offsites. Each retreat combines private logistics,
              executive rhythm, wilderness immersion, and conservation context.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {retreatFormats.map((format) => (
              <article key={format.title} className="premium-card">
                <p className="mb-4 text-sm font-black uppercase tracking-widest text-[#b8860b]">{format.length}</p>
                <h3 className="mb-4 text-3xl font-black">{format.title}</h3>
                <p className="mb-5 font-bold text-[#123a2a]">{format.price}</p>
                <p className="leading-7 text-[#68746a]">{format.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-28 text-white md:px-24">
        <Image
          src="/images/travel/corporate-retreat.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-[#123a2a]/82" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">How It Works</p>
            <h2 className="text-4xl font-black md:text-6xl">Built with the discipline executives expect.</h2>
          </div>
          <div className="grid gap-5">
            {retreatFlow.map(([step, title, text]) => (
              <div key={step} className="grid gap-5 rounded-3xl border border-white/12 bg-white/10 p-6 backdrop-blur-sm md:grid-cols-[80px_1fr]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5b416] font-black text-black">{step}</div>
                <div>
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-white/72">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="retreat-request" className="px-6 py-28 md:px-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="section-kicker">Start the Conversation</p>
            <h2 className="text-4xl font-black md:text-6xl">A serious retreat starts with a serious brief.</h2>
            <p className="mt-6 text-lg leading-8 text-[#68746a]">
              Share the team size, desired dates, seniority level, and outcomes. Wild Spine will respond with a realistic proposal path.
            </p>
          </div>
          <PremiumLeadForm
            leadSource="corporate_retreats_page"
            type="corporate retreat inquiry"
            title="Request a retreat proposal"
            subtitle="For executive teams, founders, boards, NGOs, and leadership groups."
            routeLabel="Retreat format"
            routePlaceholder="Select retreat format"
            routeOptions={["Gorilla Leadership Retreat", "Founder Wilderness Reset", "Conservation Strategy Offsite", "Custom Executive Retreat"]}
            cta="Request Retreat Proposal"
            successType="corporate-retreat"
            budgetOptions={["$10,000 - $25,000", "$25,000 - $50,000", "$50,000+", "Not sure yet"]}
          />
        </div>
      </section>
    </main>
  );
}
