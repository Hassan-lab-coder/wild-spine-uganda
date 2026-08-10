import { seoMetadata } from "@/lib/seo";
import Image from "next/image";
import OrganicVideoCard from "../components/OrganicVideoCard";

export const metadata = seoMetadata({
  title: "Private Uganda Travel | Tailored Gorilla & Safari Planning",
  description:
    "Plan private Uganda travel with tailored gorilla trekking, Rwenzori hiking, luxury safari routing, local support, and clear communication.",
  path: "/private-travel",
  image: "/images/organic/lodge-aerial-wilderness.webp",
  keywords: ["private Uganda travel", "private Uganda safari", "gorilla trekking Uganda", "luxury Africa travel"],
});

export default function PrivateTravelPage() {
  const lodgePhotos = [
    {
      title: "Lodge arrival",
      image: "/images/field/enttiko-safari-vehicle.webp",
      alt: "Safari vehicle outside a Uganda lodge setting",
    },
    {
      title: "Pool deck recovery",
      image: "/images/organic/lodge-pool-deck.webp",
      alt: "Uganda lodge pool deck surrounded by green landscape",
    },
    {
      title: "Suite comfort",
      image: "/images/organic/suite-view-bed.webp",
      alt: "Comfortable Uganda lodge room with bed net and balcony view",
    },
    {
      title: "Dining with a view",
      image: "/images/organic/lodge-dining-sunset.webp",
      alt: "Outdoor lodge dining terrace at sunset in Uganda",
    },
  ];

  const pillars = [
    {
      title: "Private Pacing",
      desc: "No fixed group schedules. Your journey moves at your rhythm, whether slower comfort or faster expedition style.",
    },
    {
      title: "Controlled Group Size",
      desc: "We avoid mass tourism. Trips are designed for individuals, couples, families, or small private groups.",
    },
    {
      title: "Curated Stays",
      desc: "Accommodation is selected based on comfort level, location, and overall experience, not just availability.",
    },
    {
      title: "Direct Coordination",
      desc: "Communication is clear and direct. You know what to expect before arrival and throughout your journey.",
    },
  ];

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <Image
          src="/images/organic/lodge-aerial-wilderness.webp"
          alt="Aerial view of a private Uganda lodge in a wilderness setting"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-5xl hero-copy">
          <a href="/#why" className="text-yellow-500 hover:text-yellow-400">
            ← Back Home
          </a>

          <p className="section-kicker mt-16">Private Travel</p>

          <h1 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            No crowds. No compromise.
          </h1>

          <p className="max-w-3xl text-gray-300 text-lg md:text-xl leading-8">
            Wild Spine journeys are built around the traveler — not the group.
            From pacing to accommodation to route design, everything is tailored
            to create a private, comfortable, and carefully paced Uganda experience.
          </p>

          <a
            href="/#book"
            className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Start a Private Journey
          </a>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="section-kicker">How it works</p>
          <h2 className="text-4xl md:text-6xl font-black mb-14">
            Designed around you.
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {pillars.map((item, index) => (
              <div key={item.title} className="package-card">
                <p className="text-yellow-500 font-black mb-4">
                  0{index + 1}
                </p>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#050605] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="section-kicker">Stay experience</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Comfort is part of the route design.
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-gray-400">
              Private travel feels premium when the nights make sense: location, recovery, views,
              and comfort matched to the pace of the journey.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <OrganicVideoCard
              dark
              title="A real look at the stay experience"
              description="A short lodge preview gives travelers a more honest feel for comfort than a single polished room shot."
              src="/video/field/enttiko-lodge-preview.mp4"
              poster="/images/field/enttiko-lodge-preview-poster.webp"
              label="Silent preview video of a Uganda lodge arrival and room setting"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {lodgePhotos.map((photo) => (
                <figure key={photo.image} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={photo.image}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-5">
                    <p className="font-black">{photo.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 md:px-24 bg-[#050605]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-kicker">Who this is for</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Travelers who value privacy and comfort.
            </h2>

            <ul className="space-y-4 text-gray-300 text-lg">
              <li>✓ Couples seeking a quiet, exclusive experience</li>
              <li>✓ Families wanting flexibility and safety</li>
              <li>✓ Solo travelers needing structured support</li>
              <li>✓ Professionals who want efficient, well-run trips</li>
            </ul>

            <a
              href="/#book"
              className="inline-block mt-10 bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
            >
              Request Private Planning
            </a>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-3xl">
            <Image
              src="/images/travel/guide-guests.jpg"
              alt="Private guide accompanying guests on a Uganda forest trail"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-black text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6">
          Built for people, not crowds.
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          If you want a Uganda journey that feels intentional, personal, and
          personal, not rushed or crowded, this is where it begins.
        </p>

        <a
          href="/tours"
          className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition"
        >
          Explore Private Routes
        </a>
      </section>
    </main>
  );
}
