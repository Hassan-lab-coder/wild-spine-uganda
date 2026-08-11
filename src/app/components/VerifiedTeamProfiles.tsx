import Image from "next/image";

const profileSlots = [
  {
    role: "Founder / Managing Director",
    focus: "Company leadership and booking accountability",
    image: "/images/field/guide-ranger-station.webp",
    imageAlt: "Field team outside a Uganda ranger station during trek preparation",
    summary:
      "The founder profile will publish the approved public name, leadership role, Uganda tourism background, languages, and verified business responsibility.",
    checks: ["Public name", "Approved portrait", "Company role", "Tourism background"],
  },
  {
    role: "Senior Journey Planner",
    focus: "Itinerary design, permits, lodges, and guest communication",
    image: "/images/field/forest-guide-moment.webp",
    imageAlt: "Guide capturing a forest trail moment in Uganda",
    summary:
      "Journey planner profiles will show who handles your route, which parks they know well, languages spoken, and how they support you before arrival.",
    checks: ["Assigned planner", "Route regions", "Languages", "Planning experience"],
  },
  {
    role: "Lead Guide / Field Operations",
    focus: "Park rhythm, field safety, and ground coordination",
    image: "/images/field/rwenzori-boardwalk-valley.webp",
    imageAlt: "Rwenzori boardwalk trail showing real mountain terrain",
    summary:
      "Guide profiles will include verified park specialisms, guiding experience, relevant first-aid or mountain credentials, and language support.",
    checks: ["Park specialisms", "Guide credentials", "First-aid status", "Licence details"],
  },
];

const publicationStandards = [
  "Full name exactly as approved for public use",
  "Real portrait with permission to publish",
  "Professional role and booking responsibility",
  "Tourism experience stated without exaggeration",
  "Languages spoken and guest-support coverage",
  "Regions, parks, or routes personally handled",
  "Qualifications, licences, and expiry dates where applicable",
  "Emergency or traveller-support responsibility",
];

export default function VerifiedTeamProfiles() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#f8f4e8] px-6 py-24 md:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="section-kicker">Team and guide profiles</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Real people, published only when verified.
            </h2>
          </div>
          <div className="rounded-3xl border border-[#d8cda9] bg-white/78 p-6 shadow-sm">
            <p className="text-lg leading-8 text-[#4c5f51]">
              Named profiles are part of Wild Spine&apos;s trust standard. We do not publish staff
              names, portraits, licences, languages, or qualifications until management has confirmed
              the details and permission to show them publicly.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {profileSlots.map((profile) => (
            <article
              key={profile.role}
              className="group overflow-hidden rounded-[2rem] border border-[#d8cda9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416]/70 hover:shadow-xl"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={profile.image}
                  alt={profile.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/90 via-[#123a2a]/35 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white backdrop-blur">
                  Profile verification
                </div>
                <div className="absolute bottom-0 p-6 text-white">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b416]">
                    To be named after approval
                  </p>
                  <h3 className="mt-3 text-3xl font-black leading-tight">{profile.role}</h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b8860b]">
                  {profile.focus}
                </p>
                <p className="mt-4 leading-7 text-[#4c5f51]">{profile.summary}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {profile.checks.map((check) => (
                    <span
                      key={check}
                      className="rounded-full border border-[#d8cda9] bg-[#fff9ea] px-3 py-1 text-xs font-bold text-[#365143]"
                    >
                      {check}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded-[2rem] border border-[#d8cda9] bg-[#123a2a] p-6 text-white shadow-2xl lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
          <div>
            <p className="section-kicker">Before a profile goes live</p>
            <h3 className="mt-3 text-3xl font-black leading-tight">
              The public profile must be useful, not decorative.
            </h3>
            <p className="mt-5 leading-7 text-white/70">
              Once verified, each card should help a traveller understand who is responsible for
              their route, what that person knows well, and how to reach the right support channel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {publicationStandards.map((standard) => (
              <div key={standard} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                <p className="text-sm font-bold leading-6 text-white/82">{standard}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#d8cda9] bg-white/78 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black">Guests still get an assigned planner before payment.</h3>
            <p className="mt-2 leading-7 text-[#68746a]">
              Your written proposal names the planning contact for that booking; public website profiles
              follow only after the full verification standard is met.
            </p>
          </div>
          <a
            href="/#book"
            className="inline-flex shrink-0 justify-center rounded-full bg-[#f5b416] px-7 py-4 text-center font-black text-black transition hover:bg-[#ffd766]"
          >
            Request a named planner
          </a>
        </div>
      </div>
    </section>
  );
}
