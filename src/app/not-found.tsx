import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The Wild Spine Uganda page you requested could not be found. Explore private Uganda tours, gorilla permit help, or travel planning.",
  robots: {
    index: false,
    follow: true,
  },
};

const usefulRoutes = [
  {
    href: "/tours",
    title: "Explore private tours",
    description: "Compare gorilla trekking, Rwenzori hiking, and summit journeys.",
  },
  {
    href: "/uganda-gorilla-permit-help",
    title: "Get gorilla permit help",
    description: "Understand permit timing, Bwindi sectors, and practical route choices.",
  },
  {
    href: "/planning",
    title: "Plan a Uganda journey",
    description: "Start with dates, comfort level, pacing, and the experiences that matter.",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#07110c] px-6 py-32 text-white md:px-24">
      <div className="mx-auto max-w-6xl">
        <p className="section-kicker">404 / Trail not found</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] md:text-8xl">
              This path ends here. Your Uganda journey does not have to.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70">
              The address may be old, incomplete, or mistyped. Return home or choose a useful route below.
            </p>
            <a
              href="/"
              className="mt-10 inline-flex rounded-full bg-[#f5b416] px-8 py-4 font-black text-[#123a2a] transition hover:bg-[#ffd766]"
            >
              Return to Wild Spine Uganda
            </a>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b416]">
              Useful next steps
            </p>
            <div className="mt-6 grid gap-4">
              {usefulRoutes.map((route) => (
                <a
                  key={route.href}
                  href={route.href}
                  className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-[#f5b416]/60 hover:bg-[#f5b416]/10"
                >
                  <h2 className="text-xl font-black">{route.title}</h2>
                  <p className="mt-2 leading-7 text-white/60">{route.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
