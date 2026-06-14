import Image from "next/image";
import JsonLd from "../components/JsonLd";

type InsightArticleProps = {
  kicker: string;
  title: string;
  description: string;
  image: string;
  route: string;
  path: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  faqs: Array<[string, string]>;
};

export default function InsightArticle({ kicker, title, description, image, route, path, sections, faqs }: InsightArticleProps) {
  const href = `/?source=${encodeURIComponent(kicker.toLowerCase().replaceAll(" ", "_"))}&route=${encodeURIComponent(route)}#book`;

  return (
    <main className="bg-[#f8f4e8] text-[#123a2a]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          image: `${siteOrigin()}${image}`,
          author: {
            "@type": "Organization",
            name: "Wild Spine Uganda",
          },
          publisher: {
            "@type": "Organization",
            name: "Wild Spine Uganda",
          },
          mainEntityOfPage: `${siteOrigin()}${path}`,
        }}
      />
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
      <section className="relative flex min-h-[72vh] items-center overflow-hidden px-6 py-32 text-white md:px-24">
        <Image src={image} alt={title} fill priority sizes="100vw" className="absolute inset-0 object-cover" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 moving-mist" />
        <div className="relative z-10 max-w-4xl">
          <p className="section-kicker">{kicker}</p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">{title}</h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-white/80">{description}</p>
          <a href={href} className="mt-10 inline-block rounded-full bg-[#f5b416] px-8 py-4 font-black text-black hover:bg-[#ffd766]">
            Start a Private Uganda Plan
          </a>
        </div>
      </section>

      <article className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:px-24 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-12">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-3xl font-black md:text-4xl">{section.heading}</h2>
              <div className="mt-5 grid gap-5 text-lg leading-8 text-[#4d5b51]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-[#d8cda9] pt-12">
            <p className="section-kicker">Traveler Questions</p>
            <div className="grid gap-4">
              {faqs.map(([question, answer]) => (
                <details key={question} className="rounded-2xl border border-[#d8cda9] bg-white/70 p-5">
                  <summary className="cursor-pointer text-lg font-black">{question}</summary>
                  <p className="mt-4 leading-7 text-[#68746a]">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-[#d8cda9] bg-[#fff9ea] p-6 shadow-sm lg:sticky lg:top-24">
          <p className="section-kicker">Private Planning</p>
          <h2 className="text-2xl font-black">Need a route you can trust?</h2>
          <p className="mt-4 leading-7 text-[#68746a]">
            Send your month, group size, comfort level, and must-see experiences. We check permits, routing, lodge fit, and next steps before you pay.
          </p>
          <a href={href} className="mt-6 block rounded-full bg-[#f5b416] px-6 py-4 text-center font-black text-black hover:bg-[#ffd766]">
            Request Private Guidance
          </a>
          <a href="https://wa.me/256751828241" target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-full border border-[#123a2a]/20 px-6 py-4 text-center font-black hover:bg-[#123a2a] hover:text-white">
            Ask on WhatsApp
          </a>
        </aside>
      </article>
    </main>
  );
}

function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.wildspineuganda.com";
}
