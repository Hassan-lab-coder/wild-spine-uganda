import Image from "next/image";

const teamProfiles = [
  {
    name: "Mr. Nsubuga K. Peters",
    role: "Founder / Managing Director",
    focus: "Company leadership and booking accountability",
    image: "/images/profiles/nsubuga-k-peters.webp",
    imageAlt: "Portrait of Mr. Nsubuga K. Peters, Founder and Managing Director of Wild Spine Uganda",
    summary:
      "Mr. Nsubuga K. Peters provides leadership across Wild Spine Uganda's guest experience, journey planning, operational standards, partnerships, and booking accountability. He oversees private and tailor-made travel so each journey is planned with clear communication, responsible coordination, and attention to international traveller expectations.",
    details: [
      ["Company", "Wild Spine Uganda"],
      ["Base", "Uganda"],
      ["Languages", "To be confirmed for public display"],
      ["Parks / regions handled", "Uganda travel operations and supplier coordination"],
      ["Tourism experience", "Executive leadership, travel operations, and guest experience"],
      ["Qualifications / licences", "To be confirmed for public display"],
    ],
    responsibilities: [
      "Company strategy and executive oversight",
      "Guest experience and service standards",
      "Safari and journey-planning accountability",
      "Lodge, guide, and supplier coordination standards",
      "International traveller confidence",
      "Booking transparency and operational integrity",
    ],
  },
  {
    name: "Ms. Ankunda Joy",
    role: "Senior Journey Planner",
    focus: "Itinerary design, permits, lodges, and guest communication",
    image: "/images/profiles/ankunda-joy.webp",
    imageAlt: "Portrait of Ms. Ankunda Joy, Senior Journey Planner at Wild Spine Uganda",
    summary:
      "Ms. Ankunda Joy supports guests from their first inquiry through the final stages of safari preparation. She coordinates tailor-made itineraries, accommodation planning, permit requirements, route preparation, and pre-arrival communication so each journey is clear, organised, and suited to the traveller's expectations.",
    details: [
      ["Company", "Wild Spine Uganda"],
      ["Base", "Uganda"],
      ["Languages", "To be confirmed for public display"],
      ["Parks / regions handled", "Permit, lodge, and route preparation for Uganda safari itineraries"],
      ["Tourism experience", "Tailor-made safari planning and guest communication"],
      ["Qualifications / licences", "To be confirmed for public display"],
    ],
    responsibilities: [
      "Tailor-made safari planning",
      "Permit and lodge coordination",
      "Guest communication",
      "Route and itinerary preparation",
      "Pre-arrival planning support",
      "Clear next steps before booking commitment",
    ],
  },
  {
    name: "Mr. Mugumya John",
    role: "Lead Guide / Field Operations",
    focus: "Park expertise, field safety, and ground coordination",
    image: "/images/profiles/mugumya-john.webp",
    imageAlt: "Portrait of Mr. Mugumya John, Lead Guide and Field Operations at Wild Spine Uganda",
    summary:
      "Mr. Mugumya John brings 15 years of experience in tourism and safari operations. He supports guests on the ground through professional guiding, park coordination, route management, field safety, and day-to-day safari operations, helping each journey feel informative, well organised, comfortable, and safe.",
    details: [
      ["Company", "Wild Spine Uganda"],
      ["Base", "Uganda"],
      ["Languages", "To be confirmed for public display"],
      ["Parks / regions handled", "National park operations and Uganda safari ground logistics"],
      ["Tourism experience", "15 years in tourism and safari operations"],
      ["Qualifications / licences", "To be confirmed for public display"],
    ],
    responsibilities: [
      "Safari guiding and guest support",
      "National park operations",
      "Field safety and coordination",
      "Wildlife and destination knowledge",
      "Route and ground logistics",
      "Day-to-day safari operations",
    ],
  },
];

const profileStandards = [
  "Real portrait and full public name",
  "Clear role and guest responsibility",
  "Experience stated without exaggeration",
  "Languages and licences marked as pending unless verified",
  "Booking and field responsibilities explained plainly",
  "Easy future updates when more credentials are confirmed",
];

export default function VerifiedTeamProfiles() {
  return (
    <section className="border-y border-[#d8cda9] bg-[#f8f4e8] px-6 py-24 md:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="section-kicker">Team and guide profiles</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              People trust identifiable people.
            </h2>
          </div>
          <div className="rounded-3xl border border-[#d8cda9] bg-white/78 p-6 shadow-sm">
            <p className="text-lg leading-8 text-[#4c5f51]">
              These profiles show who leads Wild Spine Uganda&apos;s planning and field support.
              Details that still need document confirmation, such as languages or licences, are marked
              clearly instead of being guessed.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {teamProfiles.map((profile) => (
            <article
              key={profile.name}
              className="group overflow-hidden rounded-[2rem] border border-[#d8cda9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416]/70 hover:shadow-xl"
            >
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={profile.image}
                  alt={profile.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/92 via-[#123a2a]/25 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white backdrop-blur">
                  Public profile
                </div>
                <div className="absolute bottom-0 p-6 text-white">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b416]">
                    {profile.focus}
                  </p>
                  <h3 className="mt-3 text-3xl font-black leading-tight">{profile.name}</h3>
                  <p className="mt-2 text-lg font-bold text-white/82">{profile.role}</p>
                </div>
              </div>

              <div className="p-6">
                <p className="leading-7 text-[#4c5f51]">{profile.summary}</p>

                <dl className="mt-6 space-y-3">
                  {profile.details.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-[#d8cda9] bg-[#fff9ea] px-4 py-3">
                      <dt className="text-xs font-black uppercase tracking-[0.2em] text-[#b8860b]">{label}</dt>
                      <dd className="mt-1 text-sm font-bold leading-6 text-[#365143]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b8860b]">
                    Handles for guests
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4c5f51]">
                    {profile.responsibilities.map((item) => (
                      <li key={item} className="rounded-full bg-[#123a2a]/7 px-4 py-2 font-bold">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded-[2rem] border border-[#d8cda9] bg-[#123a2a] p-6 text-white shadow-2xl lg:grid-cols-[0.72fr_1.28fr] lg:p-8">
          <div>
            <p className="section-kicker">Profile standard</p>
            <h3 className="mt-3 text-3xl font-black leading-tight">
              Real profiles, careful claims.
            </h3>
            <p className="mt-5 leading-7 text-white/70">
              Wild Spine can strengthen these cards further when confirmed languages, licences,
              professional qualifications, park specialisms, and credential expiry dates are ready
              for public display.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profileStandards.map((standard) => (
              <div key={standard} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                <p className="text-sm font-bold leading-6 text-white/82">{standard}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#d8cda9] bg-white/78 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black">Guests still receive a named planning contact before payment.</h3>
            <p className="mt-2 leading-7 text-[#68746a]">
              Your written proposal names the planning contact for that booking and explains the next
              steps before any company-bank transfer is requested.
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
