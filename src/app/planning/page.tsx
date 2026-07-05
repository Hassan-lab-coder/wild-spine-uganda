import Image from "next/image";
import { seoMetadata } from "@/lib/seo";
import CtaNextStepNote from "../components/CtaNextStepNote";
import TrustSafetyBlock from "../components/TrustSafetyBlock";

export const metadata = seoMetadata({
  title: "Uganda Safari Planning | Private Gorilla & Rwenzori Itinerary Help",
  description:
    "Plan a private Uganda journey with Wild Spine: gorilla permits, Rwenzori routes, lodges, transfers, safety, pacing, and clear next steps before booking.",
  path: "/planning",
  image: "/images/travel/ranger-briefing.jpg",
  keywords: ["Uganda safari planning", "gorilla trekking planning", "private Uganda itinerary", "Rwenzori expedition planning"],
});

const steps = [
  {
    title: "Discovery",
    desc: "We learn your travel month, budget range, fitness level, comfort expectations, group size, and what would make Uganda worth the journey.",
  },
  {
    title: "Route design",
    desc: "We shape a realistic journey around gorilla permits, Rwenzori conditions, lodge access, transfer distances, and pacing.",
  },
  {
    title: "Availability check",
    desc: "Before you commit, we check the practical pieces: permits, guide capacity, vehicle timing, lodges, and route flow.",
  },
  {
    title: "Clear proposal",
    desc: "You receive inclusions, exclusions, payment steps, safety notes, and the next decision needed to move forward.",
  },
  {
    title: "Pre-trip briefing",
    desc: "We prepare you for packing, park procedures, fitness expectations, road timing, and how each major day should feel.",
  },
];

const planningCovers = [
  "Gorilla permit timing and sector logic",
  "Route pacing and transfer days",
  "Lodge and comfort matching",
  "Driver and guide coordination",
  "Packing and fitness expectations",
  "Safari, lake, or Rwenzori add-ons",
];

export default function PlanningPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-[86vh] items-center overflow-hidden px-6 py-28 md:px-24">
        <Image
          src="/images/travel/ranger-briefing.jpg"
          alt="Uganda ranger briefing travelers before a guided forest trek"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-sm font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400">
            Back Home
          </a>

          <p className="section-kicker mt-16">Premium Planning</p>

          <h1 className="mb-8 text-5xl font-black leading-[0.95] md:text-8xl">
            Every rare journey needs precision.
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">
            Premium travel is not just beautiful places. It is timing, comfort, safety, communication, pacing, and the confidence that every detail has been thought through before you arrive.
          </p>

          <a
            href="/#book"
            className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black transition hover:bg-yellow-400"
          >
            Start Your Private Uganda Journey
          </a>
          <CtaNextStepNote />
        </div>
      </section>

      <section className="bg-black px-6 py-28 md:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="section-kicker">Our process</p>
          <h2 className="mb-14 text-4xl font-black md:text-6xl">
            From first message to final trail day.
          </h2>

          <div className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.title} className="package-card">
                <p className="mb-4 font-black text-yellow-500">0{index + 1}</p>
                <h3 className="mb-3 text-xl font-black">{step.title}</h3>
                <p className="leading-7 text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustSafetyBlock />

      <section className="bg-[#050605] px-6 py-28 md:px-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <p className="section-kicker">What careful travelers avoid</p>
            <h2 className="mb-8 text-4xl font-black md:text-6xl">
              No fragmented bookings. No guesswork.
            </h2>
            <p className="text-lg leading-8 text-gray-400">
              Many travelers lose time trying to coordinate permits, transfers, lodges, trail details, and park requirements separately. Our planning turns scattered information into one clear route.
            </p>
          </div>

          <div className="package-card">
            <h3 className="mb-6 text-2xl font-black">Planning Covers</h3>
            <ul className="space-y-4 text-gray-300">
              {planningCovers.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
