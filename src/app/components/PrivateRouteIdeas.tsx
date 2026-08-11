import Image from "next/image";

const routeIdeas = [
  {
    duration: "4-5 days",
    title: "Bwindi gorillas + Lake Bunyonyi",
    summary:
      "A focused private gorilla journey with one carefully planned trek, a calm lodge base, and time to recover beside the lake.",
    bestFor: "Travelers with limited time who still want a polished Uganda experience.",
    image: "/images/field/guide-mgahinga-sign.webp",
    imageAlt: "Wild Spine Uganda guide standing beside a gorilla national park sign",
    href: "/?source=popular_route_bwindi_bunyonyi&route=Bwindi%20Gorillas%20and%20Lake%20Bunyonyi#book",
    checks: ["Permit sector", "Lodge base", "Transfer rhythm"],
  },
  {
    duration: "7-9 days",
    title: "Gorillas, chimps + savannah",
    summary:
      "A classic Uganda wildlife route shaped around primate tracking, game drives, boat time, and private road logistics.",
    bestFor: "Guests who want Uganda's primates and open-country wildlife in one route.",
    image: "/images/organic/video-safari-giraffe-poster.webp",
    imageAlt: "Giraffe safari drive scene in Uganda",
    href: "/?source=popular_route_primates_savannah&route=Gorillas%2C%20Chimps%20and%20Savannah#book",
    checks: ["Trek dates", "Park sequence", "Drive distances"],
  },
  {
    duration: "10-12 days",
    title: "Gorillas + Rwenzori foothills",
    summary:
      "A deeper private Uganda journey linking Bwindi forest, western Uganda scenery, lake recovery, and mountain-edge walking.",
    bestFor: "Travelers who want the country to unfold slowly, not as a checklist.",
    image: "/images/field/rwenzori-boardwalk-valley.webp",
    imageAlt: "Rwenzori boardwalk trail through high mountain valley vegetation",
    href: "/?source=popular_route_gorillas_rwenzori&route=Gorillas%20and%20Rwenzori%20Foothills#book",
    checks: ["Fitness level", "Weather window", "Recovery days"],
  },
  {
    duration: "12-14 days",
    title: "Rwenzori expedition + gorillas",
    summary:
      "A serious highland route for guests combining mountain preparation, private expedition support, and a respectful gorilla trek.",
    bestFor: "Fit travelers who want Uganda's mountains and forests planned as one expedition.",
    image: "/images/organic/rwenzori-suspension-bridge.webp",
    imageAlt: "Rwenzori suspension bridge on a mountain trekking route",
    href: "/?source=popular_route_rwenzori_gorillas&route=Rwenzori%20Expedition%20and%20Gorillas#book",
    checks: ["Gear plan", "Guide support", "Summit pacing"],
  },
];

const proposalStandards = [
  "Day-by-day route outline",
  "Permit and lodge logic",
  "Realistic transfer timing",
  "Itemised quotation",
  "Numbered invoice before payment",
  "Assigned journey planner",
];

type PrivateRouteIdeasProps = {
  theme?: "light" | "dark";
};

export default function PrivateRouteIdeas({ theme = "light" }: PrivateRouteIdeasProps) {
  const isDark = theme === "dark";

  return (
    <section className={isDark ? "border-y border-white/10 bg-black px-6 py-24 text-white md:px-24" : "border-y border-[#d8cda9] bg-[#f8f4e8] px-6 py-24 text-[#123a2a] md:px-24"}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="section-kicker">Private route ideas</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Popular Uganda journeys for 2026 and 2027.
            </h2>
          </div>
          <p className={isDark ? "text-lg leading-8 text-gray-300" : "text-lg leading-8 text-[#68746a]"}>
            Use these as starting points, not fixed packages. We confirm permit space, lodge fit,
            transfer reality, and pacing before a quote is issued.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {routeIdeas.map((route) => (
            <a
              key={route.title}
              href={route.href}
              className={isDark
                ? "group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-yellow-500/45"
                : "group flex h-full flex-col overflow-hidden rounded-3xl border border-[#d8cda9] bg-white/75 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416]/70 hover:shadow-xl"}
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={route.image}
                  alt={route.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
                <p className="absolute left-5 top-5 rounded-full bg-[#f5b416] px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
                  {route.duration}
                </p>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className={isDark ? "text-2xl font-black leading-tight transition group-hover:text-yellow-500" : "text-2xl font-black leading-tight text-[#123a2a] transition group-hover:text-[#2f7d4e]"}>
                  {route.title}
                </h3>
                <p className={isDark ? "mt-4 flex-1 text-sm leading-7 text-gray-400" : "mt-4 flex-1 text-sm leading-7 text-[#68746a]"}>
                  {route.summary}
                </p>
                <p className={isDark ? "mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold leading-6 text-gray-300" : "mt-5 rounded-2xl border border-[#d8cda9] bg-[#fff9ea] p-4 text-sm font-bold leading-6 text-[#3d4a41]"}>
                  {route.bestFor}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {route.checks.map((check) => (
                    <span
                      key={check}
                      className={isDark ? "rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-gray-300" : "rounded-full bg-[#123a2a]/8 px-3 py-1 text-xs font-bold text-[#365143]"}
                    >
                      {check}
                    </span>
                  ))}
                </div>
                <p className={isDark ? "mt-6 font-black text-yellow-500" : "mt-6 font-black text-[#b8860b]"}>
                  Enquire about this route
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className={isDark ? "mt-8 rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-6" : "mt-8 rounded-3xl border border-[#d8cda9] bg-[#fff9ea] p-6 shadow-sm"}>
          <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#b8860b]">
                Every proposal includes
              </p>
              <h3 className="mt-3 text-2xl font-black">A route you can understand before you commit.</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {proposalStandards.map((item) => (
                <div
                  key={item}
                  className={isDark ? "rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-gray-300" : "rounded-2xl border border-[#d8cda9] bg-white/70 px-4 py-3 text-sm font-bold text-[#365143]"}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
