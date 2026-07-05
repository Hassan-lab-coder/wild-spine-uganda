import Image from "next/image";
import { seoMetadata } from "@/lib/seo";

const proofPoints = [
  {
    value: "12+",
    label: "Years route experience",
    text: "Wild Spine planning is shaped by years of Uganda field movement across gorilla, safari, and mountain travel realities.",
  },
  {
    value: "Local",
    label: "Uganda based planning",
    text: "Your journey is shaped by people who understand the roads, seasons, park procedures, and on-the-ground realities before you arrive.",
  },
  {
    value: "Permit",
    label: "Gorilla trek support",
    text: "We help you plan around Bwindi and Mgahinga permit availability, trek timing, transfer routes, and the right lodge base.",
  },
  {
    value: "Private",
    label: "Tailored expedition design",
    text: "No mass-market departures. Your pace, comfort level, fitness, dates, and travel style guide the itinerary.",
  },
];

const planningSteps = [
  {
    title: "Permits and park timing",
    text: "We align gorilla permits, ranger briefings, trailhead logistics, and realistic transfer windows so the rare moments are not left to chance.",
  },
  {
    title: "Lodges and route comfort",
    text: "We match each night to the journey: forest access near Bwindi, recovery stops after long drives, and comfort that protects the quality of the trip.",
  },
  {
    title: "Pacing and safety",
    text: "We plan with terrain, altitude, weather, road conditions, and traveler confidence in mind, then keep communication clear from first inquiry to return.",
  },
];

const specialties = [
  {
    title: "Gorilla Trekking",
    image: "/images/travel/traveler-trust-gorilla.jpg",
    alt: "Traveler observing Uganda gorilla trekking conditions",
    text: "Private Bwindi forest experiences shaped around permits, lodge access, ranger guidance, and the emotional weight of meeting mountain gorillas properly.",
  },
  {
    title: "Rwenzori Expeditions",
    image: "/images/travel/margherita-peak.png",
    alt: "Rwenzori mountain expedition route",
    text: "High-altitude routes through valleys, giant lobelia, technical weather, and summit ambitions handled with serious preparation.",
  },
  {
    title: "Safari Extensions",
    image: "/images/travel/safari-elephants.jpg",
    alt: "Uganda safari elephants on a private extension",
    text: "Queen Elizabeth, Murchison Falls, lake days, and cultural stops added with intention, never as filler between the main experiences.",
  },
];

export const metadata = seoMetadata({
  title: "About Our Local Gorilla & Rwenzori Experts",
  description:
    "Meet Wild Spine Uganda, a local premium travel team planning private gorilla trekking, Bwindi permits, Rwenzori expeditions, and high-trust Uganda safari journeys.",
  path: "/about",
  image: "/images/travel/terraced-mountains.jpg",
  keywords: ["Wild Spine Uganda", "Uganda tour operator", "gorilla trekking Uganda", "Rwenzori expeditions"],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#07110c] text-white">
      <section className="relative flex min-h-[92vh] items-end overflow-hidden px-6 pb-20 pt-32 md:px-24 md:pb-28">
        <Image
          src="/images/travel/terraced-mountains.jpg"
          alt="Rwenzori Mountains rising through mist in Uganda"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/62 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07110c] to-transparent" />

        <div className="relative z-10 w-full max-w-5xl">
          <a href="/" className="text-sm font-black uppercase tracking-[0.28em] text-[#f5b416] hover:text-[#ffd766]">
            Back Home
          </a>

          <p className="section-kicker mt-14">About Wild Spine Uganda</p>

          <h1 className="max-w-[21rem] text-5xl font-black leading-[0.95] sm:max-w-4xl md:text-8xl">
            Built for travelers who want Uganda handled with care.
          </h1>

          <p className="mt-8 max-w-[20rem] text-lg leading-8 text-white/82 sm:max-w-3xl md:text-xl">
            Wild Spine Uganda designs private journeys through Bwindi, the Rwenzori Mountains, and Uganda&apos;s wild places
            for travelers who need beauty, precision, and trust in equal measure.
          </p>

          <div className="mt-10 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
            <a
              href="/#book"
              className="inline-flex w-full max-w-[20rem] items-center justify-center rounded-full bg-[#f5b416] px-5 py-4 text-center text-xs font-black uppercase leading-5 tracking-[0.12em] text-[#123a2a] transition hover:bg-[#ffd766] sm:w-auto sm:max-w-none sm:px-7 sm:text-sm sm:tracking-widest"
            >
              <span className="sm:hidden">Start Your Journey</span>
              <span className="hidden sm:inline">Start Your Private Uganda Journey</span>
            </a>
            <a
              href="/uganda-gorilla-permit-help"
              className="inline-flex w-full max-w-[20rem] items-center justify-center rounded-full border border-white/30 px-5 py-4 text-center text-xs font-black uppercase leading-5 tracking-[0.12em] text-white transition hover:border-[#f5b416] hover:text-[#f5b416] sm:w-auto sm:max-w-none sm:px-7 sm:text-sm sm:tracking-widest"
            >
              Request Permit Help
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#07110c] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="section-kicker">Why Travelers Trust Us</p>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              The difference is not louder marketing. It is better preparation.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/68">
              International guests often arrive with real questions: Will my permit be secure? Are the transfers clear?
              Is the team responsive? Will the experience feel personal? Wild Spine exists to answer those questions
              before the journey begins.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {proofPoints.map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/10 bg-white/[0.06] p-7">
                <p className="text-4xl font-black text-[#f5b416]">{item.value}</p>
                <h3 className="mt-5 text-xl font-black">{item.label}</h3>
                <p className="mt-4 text-sm leading-7 text-white/62">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-[#f5b416]/30 bg-[#f5b416]/10 p-7">
            <p className="text-sm font-black uppercase tracking-widest text-[#f5b416]">Real-world reference</p>
            <p className="mt-3 max-w-4xl leading-8 text-white/72">
              Gorilla trekking plans are built around official Uganda Wildlife Authority procedures, permit timing, park briefings, and sector logistics, not generic safari assumptions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f4e8] px-6 py-24 text-[#123a2a] md:px-24">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="section-kicker">How We Plan</p>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Every detail should lower anxiety and raise anticipation.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#4e6257]">
              A premium Uganda journey is not only about where you sleep or what you see. It is the confidence that
              every handoff, permit, drive, briefing, and recovery day has been thought through.
            </p>
          </div>

          <div className="grid gap-5">
            {planningSteps.map((step, index) => (
              <article key={step.title} className="grid gap-5 rounded-[28px] border border-[#d8cda9] bg-white/72 p-6 shadow-sm sm:grid-cols-[64px_1fr]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#123a2a] text-xl font-black text-[#f5b416]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-2xl font-black">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#5d6d62]">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07110c] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="section-kicker">What We Specialize In</p>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Uganda&apos;s rarest experiences, planned with restraint and precision.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {specialties.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05]">
                <div className="relative h-72 overflow-hidden">
                  <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
                </div>
                <div className="p-7">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/62">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black px-6 py-24 md:px-24">
        <Image
          src="/images/travel/ranger-briefing.jpg"
          alt="Uganda ranger briefing before a guided wilderness experience"
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/45" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="section-kicker">Wild Spine Brand Trust Review</p>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Safe enough to inquire. Strong enough to remember.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/74">
              If you are considering Uganda for the first time, we will help you understand the route, permits, comfort
              level, timing, and next best step before you commit. The first conversation should already make the trip
              feel clearer.
            </p>
            <div className="mt-10 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
              <a
                href="/#book"
                className="inline-flex w-full max-w-[20rem] items-center justify-center rounded-full bg-[#f5b416] px-5 py-4 text-center text-xs font-black uppercase leading-5 tracking-[0.12em] text-[#123a2a] transition hover:bg-[#ffd766] sm:w-auto sm:max-w-none sm:px-7 sm:text-sm sm:tracking-widest"
              >
                <span className="sm:hidden">Start Your Journey</span>
                <span className="hidden sm:inline">Start Your Private Uganda Journey</span>
              </a>
              <a
                href="https://wa.me/256751828241"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full max-w-[20rem] items-center justify-center rounded-full border border-white/30 px-5 py-4 text-center text-xs font-black uppercase leading-5 tracking-[0.12em] text-white transition hover:border-[#f5b416] hover:text-[#f5b416] sm:w-auto sm:max-w-none sm:px-7 sm:text-sm sm:tracking-widest"
              >
                Talk on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
