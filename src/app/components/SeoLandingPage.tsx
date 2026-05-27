import Image from "next/image";

type SeoLandingPageProps = {
  title: string;
  kicker: string;
  description: string;
  image: string;
  bullets: string[];
  faqs: Array<[string, string]>;
  cta: string;
  route?: string;
};

export default function SeoLandingPage({
  title,
  kicker,
  description,
  image,
  bullets,
  faqs,
  cta,
  route,
}: SeoLandingPageProps) {
  const href = `/?source=${encodeURIComponent(kicker.toLowerCase().replaceAll(" ", "_"))}${route ? `&route=${encodeURIComponent(route)}` : ""}#book`;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-[82vh] items-center overflow-hidden px-6 py-32 md:px-24">
        <Image
          src={image}
          alt={title}
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
          <a href={href} className="mt-10 inline-block rounded-full bg-yellow-500 px-8 py-4 font-black text-black hover:bg-yellow-400">
            {cta}
          </a>
        </div>
      </section>

      <section className="px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Why plan with Wild Spine</p>
            <h2 className="text-4xl font-black">Local planning for serious Uganda travel.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bullets.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="section-kicker">Common questions</p>
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
