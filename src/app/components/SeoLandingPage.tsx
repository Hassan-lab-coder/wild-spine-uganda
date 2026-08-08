import Image from "next/image";
import JsonLd from "./JsonLd";
import CtaNextStepNote from "./CtaNextStepNote";
import TrustSafetyBlock from "./TrustSafetyBlock";
import BookingConfidencePanel from "./BookingConfidencePanel";
import OrganicVideoCard from "./OrganicVideoCard";

type SeoLandingPageProps = {
  title: string;
  kicker: string;
  description: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  faqs: Array<[string, string]>;
  cta: string;
  route?: string;
  timeline?: Array<[string, string]>;
  mediaGallery?: Array<{
    title: string;
    image: string;
    imageAlt: string;
    caption: string;
  }>;
  videoFeature?: {
    title: string;
    eyebrow: string;
    description: string;
    src: string;
    poster: string;
    label: string;
  };
};

export default function SeoLandingPage({
  title,
  kicker,
  description,
  image,
  imageAlt,
  bullets,
  faqs,
  cta,
  route,
  mediaGallery,
  videoFeature,
  timeline = [
    ["Step 1", "Share your travel month, group size, comfort level, and must-see experiences."],
    ["Step 2", "We check route logic, permit timing, lodge fit, and transfer reality before quoting."],
    ["Step 3", "You receive clear next steps with inclusions, exclusions, payment guidance, and official invoice controls."],
  ],
}: SeoLandingPageProps) {
  const href = `/?source=${encodeURIComponent(kicker.toLowerCase().replaceAll(" ", "_"))}${route ? `&route=${encodeURIComponent(route)}` : ""}#book`;

  return (
    <main className="min-h-screen bg-black text-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {
              "@type": "Answer",
              text: answer,
            },
          })),
        }}
      />
      <section className="relative flex min-h-[82vh] items-center overflow-hidden px-6 py-32 md:px-24">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-5xl">
          <p className="section-kicker">{kicker}</p>
          <h1 className="mb-8 text-5xl font-black leading-tight md:text-7xl">{title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-gray-300">{description}</p>
          <div className="mt-8 max-w-2xl">
            <BookingConfidencePanel tone="dark" compact />
          </div>
          <a href={href} className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400">
            {cta}
          </a>
          <CtaNextStepNote />
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Why plan with Wild Spine</p>
            <h2 className="text-4xl font-black">Local guidance for travelers who want wonder without guesswork.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bullets.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-300">
                {item}
              </div>
            ))}
          </div>
          <BookingConfidencePanel tone="dark" />
        </div>
      </section>

      {(mediaGallery?.length || videoFeature) && (
        <section className="border-t border-white/10 px-6 py-24 md:px-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-3xl">
              <p className="section-kicker">Field media</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                Real textures from the route, not generic brochure filler.
              </h2>
              <p className="mt-5 leading-8 text-gray-400">
                Photos and clips are used to show terrain, comfort, pacing, and route feeling before a traveler commits.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              {videoFeature && <OrganicVideoCard {...videoFeature} dark />}
              {mediaGallery?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {mediaGallery.map((item) => (
                    <figure key={item.image} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
                      <div className="relative h-72 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                      <figcaption className="p-5">
                        <h3 className="font-black">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{item.caption}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">How booking works</p>
            <h2 className="text-4xl font-black">A clear path before you commit.</h2>
            <p className="mt-5 leading-8 text-gray-400">
              Premium travel should not feel vague. We turn inquiry details into practical route decisions before asking you to move forward.
            </p>
          </div>
          <div className="grid gap-4">
            {timeline.map(([label, text]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-black uppercase tracking-widest text-[#f5b416]">{label}</p>
                <p className="mt-3 leading-7 text-gray-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustSafetyBlock />

      <section className="border-t border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="section-kicker">Questions before you commit</p>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <summary className="cursor-pointer font-black">{question}</summary>
                <p className="mt-4 leading-7 text-gray-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
