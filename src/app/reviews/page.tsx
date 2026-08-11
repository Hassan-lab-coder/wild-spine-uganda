import Image from "next/image";
import { seoMetadata } from "@/lib/seo";
import OrganicVideoCard from "../components/OrganicVideoCard";

export const metadata = seoMetadata({
  title: "Reviews & References | Wild Spine Uganda",
  description:
    "Understand how Wild Spine Uganda verifies traveler reviews, references, field proof, and trust signals for gorilla trekking, Rwenzori, and private safari planning.",
  path: "/reviews",
  image: "/images/field/guide-ranger-station.webp",
  keywords: ["Wild Spine Uganda reviews", "Uganda tour operator reviews", "gorilla trekking reviews"],
});

const proofStats = [
  ["Permit-first", "Gorilla trekking plans shaped around timing, sectors, and route guidance."],
  ["Private routes", "Itineraries shaped around the traveler, not a fixed departure template."],
  ["Long-haul ready", "Support designed for travelers flying in from North America, Europe, Asia, Africa, and beyond."],
  ["Uganda based", "Ground knowledge from Uganda, not a remote brochure desk."],
];

const reviewEvidencePlan = [
  {
    title: "Verified public review links",
    status: "Pending verification",
    note:
      "Public review profiles will be linked here only after Wild Spine confirms the account ownership and source authenticity.",
  },
  {
    title: "Client references",
    status: "Shared privately when available",
    note:
      "Some travelers prefer privacy. References should be shared only with consent and never published as anonymous proof.",
  },
  {
    title: "Field proof",
    status: "Visible on site",
    note:
      "Real route photos and short clips are used to show terrain, lodge rhythm, guides, vehicles, and park context without overstating credentials.",
  },
  {
    title: "Written booking trail",
    status: "Required before payment",
    note:
      "Itineraries, itemised quotes, numbered invoices, receipts, and payment status are the primary trust record for serious bookings.",
  },
];

const verificationSteps = [
  "Ask for a written itinerary with inclusions, exclusions, and payment milestones.",
  "Confirm gorilla permit timing before locking lodge and transfer plans.",
  "Check that the operator can explain routing, sectors, and realistic transfer distances.",
  "Use documented payment steps and keep invoices or receipts for every payment.",
];

const proofMoments = [
  ["Permit days", "/images/field/guide-ranger-station.webp", "Guide outside a ranger station with trekking staff nearby", "Travelers remember the trek, but trust is built in the planning before it."],
  ["Trail days", "/images/field/rwenzori-boardwalk-valley.webp", "Hiker crossing a Rwenzori boardwalk through high mountain valley vegetation", "Mountain routes need clear pacing, guide support, and realistic expectations."],
  ["Recovery days", "/images/field/enttiko-safari-vehicle.webp", "Safari vehicle outside a Uganda lodge setting", "Good itineraries leave room for weather, rest, and the journey back down."],
];

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 pb-20 pt-32 md:px-24">
        <div className="mx-auto max-w-6xl">
          <a href="/" className="text-yellow-500 hover:text-yellow-400">Back Home</a>
          <p className="section-kicker mt-16">Reviews and references</p>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
                Confidence is built before the journey starts.
              </h1>
            </div>
            <p className="text-lg leading-8 text-gray-300">
              Gorilla trekking and Rwenzori travel are serious bookings. This page shows how Wild Spine handles review evidence, field proof, and practical verification questions without publishing unverified claims.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 px-6 py-12 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
          {proofStats.map(([value, label]) => (
            <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-3xl font-black text-yellow-500">{value}</p>
              <p className="mt-3 text-sm leading-6 text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {proofMoments.map(([title, image, imageAlt, caption]) => (
            <figure key={title} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="relative h-80 overflow-hidden">
                <Image src={image} alt={imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <figcaption className="absolute bottom-0 p-6">
                  <p className="text-2xl font-black">{title}</p>
                </figcaption>
              </div>
              <p className="p-5 text-sm leading-6 text-gray-400">{caption}</p>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#050605] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="section-kicker">Behind the notes</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Field scenes make the feedback feel less abstract.
            </h2>
            <p className="mt-5 leading-8 text-gray-400">
              These clips show the kind of terrain, pacing, and calm practical support that travelers often remember after the trip.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <OrganicVideoCard
              dark
              title="Wildlife and water"
              description="A natural park moment that supports the feeling behind traveler notes."
              src="/video/field/murchison-wildlife-water.mp4"
              poster="/images/field/murchison-wildlife-water-poster.webp"
              label="Silent preview video of wildlife and water scenes in a Uganda national park"
            />
            <OrganicVideoCard
              dark
              title="Gorilla forest encounter"
              description="A quiet forest clip helps visitors understand the care behind the most emotional day."
              src="/video/field/gorilla-forest-encounter.mp4"
              poster="/images/field/gorilla-forest-encounter-poster.webp"
              label="Silent preview video of a gorilla encounter in Uganda forest"
            />
            <OrganicVideoCard
              dark
              title="Rwenzori trail texture"
              description="A short trail clip gives mountain feedback more grounding and specificity."
              src="/video/field/rwenzori-waterfall-trail.mp4"
              poster="/images/field/rwenzori-waterfall-trail-poster.webp"
              label="Silent preview video of a Rwenzori waterfall and mountain trail"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Evidence standard</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">Reviews are published only when they can be verified.</h2>
            </div>
            <a href="/#book" className="rounded-full bg-yellow-500 px-7 py-4 text-center font-black text-black hover:bg-yellow-400">
              Request Your Route
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {reviewEvidencePlan.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="mb-5 text-sm font-black tracking-widest text-yellow-500">{item.status}</p>
                <h3 className="text-2xl font-black">{item.title}</h3>
                <p className="mt-4 leading-7 text-gray-300">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Book Carefully</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">How to verify a Uganda operator</h2>
            <p className="mt-6 leading-8 text-gray-400">
              Careful travelers should expect clear documentation, honest permit guidance, and written payment steps. We welcome those questions because they protect both the traveler and the route.
            </p>
          </div>
          <div className="grid gap-4">
            {verificationSteps.map((step, index) => (
              <div key={step} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                  {index + 1}
                </div>
                <p className="leading-7 text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
