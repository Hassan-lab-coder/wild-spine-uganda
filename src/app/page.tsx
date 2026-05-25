"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

const tours = [
  {
    title: "The Spine Explorer",
    days: "4–5 Days",
    price: "From $1,400",
    desc: "Premium gorilla trekking through Bwindi with private guidance and lodge support.",
    link: "/tours/spine-explorer",
    inclusions: ["Gorilla permit support", "Private guide", "Premium lodge planning"],
  },
  {
    title: "The Summit Trail",
    days: "10–12 Days",
    price: "From $3,200",
    desc: "The signature journey: gorillas, Rwenzori valleys, alpine trails, and glacier country.",
    link: "/tours/summit-trail",
    inclusions: ["Gorillas + Rwenzori", "Route planning", "Expedition briefing"],
  },
  {
    title: "Margherita Expedition",
    days: "12–14 Days",
    price: "From $6,000",
    desc: "Ultra-premium summit expedition to Uganda’s highest peak with private logistics.",
    link: "/tours/margherita-expedition",
    inclusions: ["Summit planning", "Private logistics", "Luxury support"],
  },
];

const whyCards = [
  ["Local Expertise", "Real route, permit, weather, and lodge knowledge.", "/expertise"],
  ["Premium Planning", "Clear communication and structured itineraries.", "/planning"],
  ["Rare Experience", "Gorillas + Rwenzori in one seamless journey.", "/rare-experience"],
  ["Private Travel", "No mass tourism — every trip is tailored.", "/private-travel"],
];

const safariCards = [
  {
    title: "Gorilla Encounters",
    img: "/images/gorilla.jpg",
    desc: "Rare moments inside Uganda’s ancient forests.",
  },
  {
    title: "Rwenzori Trails",
    img: "/images/hiking.jpg",
    desc: "Alpine routes, misty valleys, and serious adventure.",
  },
  {
    title: "Mountain Wilderness",
    img: "/images/forest.jpg",
    desc: "Deep green landscapes built for slow discovery.",
  },
];

const travelerReviews = [
  {
    text: "Wild Spine handled the details we were nervous about: permits, route timing, lodge choices, and the long transfers. The trip felt personal, calm, and very well organized.",
    name: "Sarah M.",
    country: "United States",
    trip: "Bwindi gorilla trek",
    date: "Traveled September 2025",
    source: "Private client feedback",
  },
  {
    text: "The team knew exactly when to slow down, when to move, and what mattered on the mountain. We felt looked after from Kampala to the Rwenzori valleys.",
    name: "Daniel K.",
    country: "Germany",
    trip: "Rwenzori hiking extension",
    date: "Traveled July 2025",
    source: "Post-trip email review",
  },
  {
    text: "This did not feel like a copy-paste safari. The communication before arrival was clear, honest, and fast, which made trusting them easy.",
    name: "Amelia R.",
    country: "United Kingdom",
    trip: "Private Uganda itinerary",
    date: "Traveled February 2026",
    source: "Verified planning client",
  },
];

const trustSignals = [
  ["12+ years", "Local expedition planning experience across Uganda's gorilla and mountain routes."],
  ["500+ encounters", "Gorilla trekking experiences planned with permit timing and route support."],
  ["48 countries", "Travelers supported from the US, UK, Europe, Asia, Africa, and beyond."],
  ["Local team", "Ground knowledge from Uganda, not generic third-party brochure planning."],
];

const assuranceSteps = [
  ["1", "You send your preferred month, route, group size, and comfort level."],
  ["2", "We check realistic permit, lodge, guide, and route availability before quoting."],
  ["3", "You receive a clear plan with next steps, inclusions, and payment guidance."],
];

const bookingFaqs = [
  ["Is Uganda safe for this kind of trip?", "Yes, with the right routing, local support, and realistic planning. We guide travelers through arrival, transfers, trekking logistics, and park procedures."],
  ["When should I book gorilla permits?", "Earlier is better, especially for peak months. Permit availability can shape your exact travel dates and lodge options."],
  ["What fitness level do I need?", "Gorilla trekking can range from moderate to demanding depending on the gorilla family location. Rwenzori routes require stronger hiking fitness and preparation."],
  ["What is included in the quote?", "We clarify permits, guiding, transport, accommodation level, park logistics, and optional extensions before you commit."],
  ["Can the itinerary be private?", "Yes. Wild Spine focuses on private and tailored Uganda journeys rather than fixed mass-market departures."],
  ["How do payments work?", "We confirm availability and scope first, then share clear payment steps, booking terms, and cancellation guidance."],
];

const ecosystemLogos = [
  { name: "Uganda Wildlife Authority", initials: "UWA", note: "Park permits & conservation guidelines" },
  { name: "Uganda Tourism Board", initials: "UTB", note: "Destination Uganda standards" },
  { name: "Bwindi Impenetrable National Park", initials: "BINP", note: "Gorilla trekking ecosystem" },
  { name: "Rwenzori Mountains National Park", initials: "RMNP", note: "Mountain route ecosystem" },
  { name: "Uganda Civil Aviation Authority", initials: "CAA", note: "Arrival & airport travel context" },
  { name: "Association of Uganda Tour Operators", initials: "AUTO", note: "Tour operator network" },
];

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preferredRoute, setPreferredRoute] = useState(searchParams.get("route") || "Choose preferred route");

  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 40);

    const sections = document.querySelectorAll(".reveal-section");

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight - 100) {
        section.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const route = String(form.get("route") || "");
    const leadSource = searchParams.get("source") || "homepage";
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
      country: String(form.get("country") || "").trim() || null,
      travel_month: String(form.get("travel_month") || "").trim() || null,
      route: route === "Choose preferred route" ? null : route,
      message: String(form.get("message") || "").trim() || null,
      lead_source: leadSource,
    };

    if (!isSupabaseConfigured) {
      setSubmitting(false);
      setError("Database is not configured on this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
      return;
    }

    const { error: insertError } = await supabase.from("itinerary_requests").insert(payload);

    setSubmitting(false);

    if (insertError) {
      console.error("Itinerary request save failed:", insertError);

      const isSchemaIssue =
        insertError.message.includes("schema cache") ||
        insertError.message.includes("Could not find the table") ||
        insertError.message.includes("column");

      setError(
        isSchemaIssue
          ? `Database setup issue: ${insertError.message}`
          : "We could not save your request. Please try again or contact us on WhatsApp."
      );
      return;
    }

    setSent(true);
    trackEvent("itinerary_request_submitted", { route: payload.route, country: payload.country, source: leadSource });
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "itinerary request",
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        route: payload.route,
        travelMonth: payload.travel_month,
        source: leadSource,
        message: payload.message,
      }),
    });
    router.push(`/thank-you?type=itinerary&source=${encodeURIComponent(leadSource)}${payload.route ? `&route=${encodeURIComponent(payload.route)}` : ""}`);
  }

  return (
    <main className="bg-black text-white overflow-hidden">
      <div className="scroll-progress" />

      <nav
        className={`fixed top-0 left-0 z-50 w-full flex justify-between items-center px-6 md:px-10 py-5 transition-all duration-500 ${
          scrolled ? "bg-black/95 border-b border-white/10" : "bg-transparent"
        }`}
      >
        <a href="#home">
          <h1 className="text-lg md:text-xl font-black tracking-[0.3em]">WILD SPINE</h1>
          <p className="text-xs text-yellow-500 tracking-[0.35em]">UGANDA</p>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
          <a href="#experience" className="nav-link">Experience</a>
          <a href="/volunteer" className="nav-link">Volunteer</a>
<a href="/guide" className="nav-link">Guide</a>
<a href="/tours" className="nav-link">Tours</a>
          <a href="/about" className="nav-link">About</a>
          <a href="#why" className="nav-link">Why Us</a>
          <a href="#book" className="bg-yellow-500 text-black px-5 py-3 rounded-full font-black hover:bg-yellow-400 transition">
            Book
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-home-menu"
        >
          Menu
        </button>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-home-menu" className="fixed left-4 right-4 top-20 z-50 rounded-3xl border border-white/10 bg-black/95 p-5 shadow-2xl md:hidden">
          <div className="grid gap-3 text-sm font-bold uppercase tracking-widest text-gray-200">
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-white/5 px-4 py-3">Experience</a>
            <a href="/tours" className="rounded-2xl bg-white/5 px-4 py-3">Tours</a>
            <a href="/guide" className="rounded-2xl bg-white/5 px-4 py-3">Guide</a>
            <a href="/volunteer" className="rounded-2xl bg-white/5 px-4 py-3">Volunteer</a>
            <a href="/about" className="rounded-2xl bg-white/5 px-4 py-3">About</a>
            <a href="#book" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-yellow-500 px-4 py-3 text-black">Book</a>
          </div>
        </div>
      )}

      <section id="home" className="relative min-h-screen flex items-center px-6 md:px-24 pt-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/gorilla.jpg"
            alt="Mountain gorilla in Uganda"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover hero-video"
          />
        </div>

        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 moving-mist" />

        <div className="relative z-10 max-w-4xl hero-copy">
          <p className="text-yellow-500 uppercase tracking-[0.35em] text-sm mb-5">
            Gorilla Forests • Rwenzori Glaciers • Private Expeditions
          </p>

          <h2 className="text-5xl md:text-8xl font-black leading-[0.95] mb-8">
            Trek the <br /> Backbone of Africa
          </h2>

          <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 leading-8">
            From Uganda’s ancient gorilla forests to the glacier crown of the Rwenzori,
            Wild Spine crafts rare journeys for travelers who want more than an ordinary safari.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/tours" className="bg-yellow-500 text-black px-8 py-4 rounded-full font-black hover:bg-yellow-400 transition text-center">
              Start Your Journey
            </a>
            <a href="#book" className="border border-white/30 px-8 py-4 rounded-full font-black hover:bg-white hover:text-black transition text-center">
              Request Private Itinerary
            </a>
          </div>
        </div>
      </section>

     <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">

  <img
    src="/images/rwenzori.jpg"
    alt="Rwenzori mountain landscape in Uganda"
    className="absolute inset-0 w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-black/60" />

  <div className="relative z-10 max-w-3xl px-6">

    <h3 className="text-5xl md:text-6xl font-black mb-6">
      This is not a safari.
    </h3>

    <p className="text-xl text-gray-300 leading-8">
      It’s a moment your world slows down.
    </p>

    <p className="text-lg text-gray-400 mt-4 leading-8">
      Deep in the mist of Uganda’s ancient forests, you don’t just see gorillas —
      you feel their presence. You hear the silence. You breathe something raw,
      something real.
    </p>

    <p className="text-lg text-gray-400 mt-4 leading-8">
      This is not about ticking destinations off a list.
      It’s about stepping into a world untouched by time —
      and leaving with a story that will stay with you forever.
    </p>

    <p className="text-yellow-500 mt-6 font-semibold tracking-wide">
      Limited journeys. Private experiences. Crafted for those who seek more.
    </p>

  </div>

</section>

<section className="py-32 px-6 md:px-24 bg-black">

  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="mb-16">
      <h3 className="text-4xl md:text-6xl font-black mb-6">
        Stories from the Wild
      </h3>
      <p className="text-gray-400 max-w-2xl">
        Real journeys. Real moments. Discover what it feels like to trek deep into Uganda’s untouched wilderness.
      </p>
    </div>

    {/* GRID */}
    <div className="grid md:grid-cols-3 gap-8">

      {/* VIDEO 1 */}
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-xl">
          <img src="/images/gorilla.jpg" alt="Mountain gorilla in Bwindi forest" className="w-full h-[300px] object-cover group-hover:scale-110 transition duration-700" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-lg font-bold">▶ Watch</span>
          </div>
        </div>
        <h4 className="mt-4 font-bold text-lg">
          First Time Seeing Gorillas
        </h4>
        <p className="text-gray-400 text-sm">
          A life-changing encounter deep in Bwindi forest.
        </p>
      </div>

      {/* BLOG 1 */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
        <h4 className="font-bold text-lg mb-3">
          Gorilla Trekking Guide 2026
        </h4>
        <p className="text-gray-400 text-sm mb-4">
          Everything you need to know before visiting Uganda — permits, costs, preparation.
        </p>
        <a href="/guide" className="text-yellow-500 text-sm font-bold">
          Read More →
        </a>
      </div>

      {/* BLOG 2 */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition">
        <h4 className="font-bold text-lg mb-3">
          How Safe is Uganda?
        </h4>
        <p className="text-gray-400 text-sm mb-4">
          What travelers need to know about safety, guides, and local experience.
        </p>
        <a href="/guide" className="text-yellow-500 text-sm font-bold">
          Read More →
        </a>
      </div>

    </div>

  </div>

</section>

<section className="px-6 md:px-24 py-12 bg-black border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-black text-yellow-500">500+</h3>
            <p className="text-gray-400">Gorilla encounters</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-yellow-500">48</h3>
            <p className="text-gray-400">Countries served</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-yellow-500">12+</h3>
            <p className="text-gray-400">Years expertise</p>
          </div>
        </div>
      </section>

      <section id="experience" className="reveal-section py-32 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Two Worlds. One Uganda.</p>
            <h3 className="text-4xl md:text-6xl font-black leading-tight">
              Where gorillas roam and glaciers glow.
            </h3>
          </div>
          <p className="text-gray-400 text-lg leading-8">
            Jungle silence, gorilla eye contact, alpine valleys, giant lobelia forests,
            and snow-crowned peaks on the equator — designed as one unforgettable crossing.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {safariCards.map((item) => (
            <div
              key={item.title}
              className="group relative h-[360px] rounded-3xl overflow-hidden border border-white/10"
            >
              <img
                src={item.img}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <h3 className="text-2xl font-black mb-2 group-hover:text-yellow-500 transition">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 md:px-24 bg-black">
  <div className="max-w-4xl">
    <h3 className="text-4xl md:text-5xl font-black mb-8">
      Where the world goes silent
    </h3>

    <p className="text-gray-400 text-lg leading-8">
      Deep inside Uganda’s forests, something changes. The noise fades.
      The pace slows. And for a moment, you’re no longer a visitor —
      you’re part of the wilderness.
    </p>
  </div>
</section>

<section id="tours" className="reveal-section py-32 px-6 md:px-24 bg-[#030503]">
        <div className="max-w-6xl mx-auto mb-16">
          <p className="section-kicker">Signature Expeditions</p>
          <h3 className="text-4xl md:text-6xl font-black">Choose your journey.</h3>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <a key={tour.title} href={tour.link} className={`package-card group ${index === 1 ? "featured-card" : ""}`}>
              <p className="text-yellow-500 text-sm mb-3">0{index + 1} / {tour.days}</p>
              <h4 className="text-2xl font-black mb-3 group-hover:text-yellow-500 transition">{tour.title}</h4>
              <p className="text-white font-semibold mb-5">{tour.price}</p>
              <p className="text-gray-400 leading-7 mb-6">{tour.desc}</p>

              <ul className="space-y-2 text-gray-300 text-sm mb-8">
                {tour.inclusions.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>

              <p className="text-yellow-500 font-black">Explore Route →</p>
            </a>
          ))}
        </div>
      </section>

<section className="py-32 px-6 md:px-24 bg-black border-t border-white/10">
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start mb-16">
      <div>
        <p className="section-kicker">Traveler trust</p>
        <h3 className="text-4xl md:text-5xl font-black mb-6">
          Proof before promises.
        </h3>
        <p className="text-gray-400 text-lg leading-8">
          A private Uganda journey asks for real trust. Wild Spine builds that trust through
          clear communication, local route knowledge, careful permit planning, and honest
          guidance before you commit.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {trustSignals.map(([value, label]) => (
          <div key={value} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-3xl font-black text-yellow-500">{value}</p>
            <p className="mt-3 text-sm leading-6 text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {travelerReviews.map((review) => (
        <div key={review.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-5 text-sm font-black tracking-widest text-yellow-500">
            5 / 5 PRIVATE TRAVELER REVIEW
          </p>
          <p className="text-gray-300 leading-7 mb-6">&quot;{review.text}&quot;</p>
          <h4 className="font-black">{review.name}</h4>
          <p className="text-sm text-gray-500">{review.country}</p>
          <p className="mt-3 text-sm font-bold text-yellow-500">{review.trip}</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">{review.date}</p>
          <p className="mt-2 text-xs text-gray-500">{review.source}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-20 px-6 md:px-24 bg-black border-t border-white/10">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
    <div>
      <p className="section-kicker">Booking assurance</p>
      <h3 className="text-3xl md:text-4xl font-black mb-5">
        Know what happens before you pay.
      </h3>
      <p className="text-gray-400 leading-8">
        We do not rush travelers into vague packages. Every inquiry is checked against
        the realities that matter: gorilla permit timing, lodge availability, transfer
        distance, mountain conditions, and the level of support you want.
      </p>
    </div>

    <div className="grid gap-4">
      {assuranceSteps.map(([step, text]) => (
        <div key={step} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
            {step}
          </div>
          <p className="text-gray-300 leading-7">{text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-32 px-6 md:px-24 bg-black border-t border-white/10">

  <div className="max-w-6xl mx-auto text-center mb-16">
    <h3 className="text-4xl md:text-5xl font-black mb-6">
      What Our Travelers Say
    </h3>
    <p className="text-gray-400">
      Real experiences from clients who explored Uganda with us
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8">

    {[
      {
        text: "Best experience in Africa. Everything was seamless, from permits to accommodation.",
        name: "James Carter",
        country: "United Kingdom 🇬🇧"
      },
      {
        text: "Seeing gorillas in Bwindi changed my life. Wild Spine handled everything perfectly.",
        name: "Emily Rodriguez",
        country: "USA 🇺🇸"
      },
      {
        text: "Professional, reliable, and deeply knowledgeable about Uganda’s wilderness.",
        name: "Lucas Meyer",
        country: "Germany 🇩🇪"
      }
    ].map((t, i) => (
      <div key={i} className="border border-white/10 p-6 rounded-xl bg-white/5 backdrop-blur-md">
        <p className="text-gray-300 mb-6 italic">“{t.text}”</p>
        <h4 className="font-bold">{t.name}</h4>
        <p className="text-sm text-yellow-500">{t.country}</p>
      </div>
    ))}

  </div>

</section>

<section className="py-20 px-6 md:px-24 bg-black border-t border-white/10">

  <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 text-center">

    <div className="border border-white/10 p-6 rounded-xl">
      🔒 Secure Booking
      <p className="text-gray-400 text-sm mt-2">
        Protected payments and verified processes
      </p>
    </div>

    <div className="border border-white/10 p-6 rounded-xl">
      🦍 Licensed Operator
      <p className="text-gray-400 text-sm mt-2">
        Working with Uganda Wildlife Authority guidelines
      </p>
    </div>

    <div className="border border-white/10 p-6 rounded-xl">
      🌍 Local Expertise
      <p className="text-gray-400 text-sm mt-2">
        Deep knowledge of Bwindi & Rwenzori ecosystems
      </p>
    </div>

  </div>

</section>

      <section className="px-6 pb-20 md:px-24 bg-black">
        <div className="mx-auto max-w-6xl overflow-hidden border-y border-white/10 py-8">
          <div className="mb-8 flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="section-kicker">Trusted ecosystem</p>
              <h3 className="text-3xl font-black md:text-4xl">
                Connected to Uganda official travel landscape.
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-gray-400">
              We plan trips around recognized tourism, park, conservation, and route authorities.
            </p>
          </div>

          <div className="partner-logo-carousel" aria-label="Uganda tourism and conservation ecosystem">
            <div className="partner-logo-track">
              {[...ecosystemLogos, ...ecosystemLogos].map((logo, index) => (
                <div key={`${logo.initials}-${index}`} className="partner-logo-card">
                  <div className="partner-logo-mark">{logo.initials}</div>
                  <div>
                    <p className="partner-logo-name">{logo.name}</p>
                    <p className="partner-logo-note">{logo.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="reveal-section py-32 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <p className="section-kicker">Why Wild Spine</p>
            <h3 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Built on ground truth, not brochures.
            </h3>
            <p className="text-gray-400 leading-8">
              We are Ugandans who understand these routes from forest trails to alpine passes.
            </p>
          </div>

          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            {whyCards.map(([title, desc, link]) => (
              <a key={title} href={link} className="premium-card">
                <h4 className="text-2xl font-black mb-4">{title}</h4>
                <p className="text-gray-400 leading-7">{desc}</p>
                <p className="text-yellow-500 mt-8 font-black">Explore More →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

<section className="py-32 px-6 md:px-24 bg-black border-t border-white/10">

  <div className="max-w-5xl">

    <h3 className="text-4xl md:text-5xl font-black mb-6">
      Gorilla Permit Assistance
    </h3>

    <p className="text-gray-400 text-lg mb-8">
      Securing a gorilla trekking permit in Uganda can be complex.
      We handle the entire process for you — ensuring availability,
      best dates, and seamless coordination.
    </p>

    <div className="grid md:grid-cols-2 gap-6 mb-10">

      <div className="border border-white/10 p-6 rounded-xl">
        ✔ Guaranteed permit sourcing  
      </div>

      <div className="border border-white/10 p-6 rounded-xl">
        ✔ Best trekking date planning  
      </div>

      <div className="border border-white/10 p-6 rounded-xl">
        ✔ Transport & lodge coordination  
      </div>

      <div className="border border-white/10 p-6 rounded-xl">
        ✔ Emergency last-minute support  
      </div>

    </div>

    <a
      href="#book"
      className="bg-yellow-500 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition"
    >
      Request Permit Assistance
    </a>

  </div>

</section>

<section className="py-28 px-6 md:px-24 bg-black border-t border-white/10">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
    <div>
      <p className="section-kicker">Before you book</p>
      <h3 className="text-4xl md:text-5xl font-black mb-6">
        Questions travelers ask first.
      </h3>
      <p className="text-gray-400 leading-8">
        Clear answers reduce surprises. These are the questions we expect careful travelers to ask before planning a serious Uganda journey.
      </p>
    </div>

    <div className="grid gap-4">
      {bookingFaqs.map(([question, answer]) => (
        <details key={question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <summary className="cursor-pointer text-lg font-black text-white">{question}</summary>
          <p className="mt-4 leading-7 text-gray-400">{answer}</p>
        </details>
      ))}
    </div>
  </div>
</section>

      <section id="book" className="py-32 px-6 md:px-24 bg-[#070907]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Begin the crossing</p>
            <h3 className="text-4xl md:text-6xl font-black mb-8">
              Most people never find this Uganda.
            </h3>
            <p className="text-gray-400 text-lg leading-8">
              Tell us your travel dates, preferred comfort, and dream route.
            </p>
          </div>

          {sent ? (
            <div className="p-10 rounded-[2rem] bg-white/5 border border-yellow-500/40">
              <h4 className="text-3xl font-black text-yellow-500 mb-4">Request received.</h4>
              <p className="text-gray-300">We’ll respond with route guidance, pricing, and permit availability.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="grid sm:grid-cols-2 gap-5">
                <input required name="name" className="form-input" placeholder="Full name" />
                <input required name="email" type="email" className="form-input" placeholder="Email address" />
                <input name="phone" className="form-input" placeholder="WhatsApp / phone" />
                <input name="country" className="form-input" placeholder="Country" />
                <input name="travel_month" className="form-input" placeholder="Travel month" />

                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-bold text-gray-300">Preferred route</span>
                <select name="route" value={preferredRoute} onChange={(e) => setPreferredRoute(e.target.value)} className="form-input">
                  <option>Choose preferred route</option>
                  <option>The Spine Explorer</option>
                  <option>The Summit Trail</option>
                  <option>Margherita Expedition</option>
                </select>
                </label>

                <textarea
                  name="message"
                  className="form-input sm:col-span-2 min-h-32"
                  placeholder="Tell us about your dream Uganda journey..."
                />
              </div>

              {error && (
                <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="mt-6 w-full bg-yellow-500 text-black py-4 rounded-full font-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70 transition">
                {submitting ? "Saving request..." : "Request Private Itinerary"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section id="contact" className="relative py-32 px-6 md:px-24 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Contact Wild Spine</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">Begin with a conversation.</h2>
            <p className="text-gray-400 leading-8">
              Kampala, Uganda<br />
              Email: reservations@wildspineuganda.com<br />
              WhatsApp: +256 751 828 241
            </p>
          </div>
        </div>
      </section>

{/* WHATSAPP BUTTON */}
<a
  href="https://wa.me/256751828241"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-button"
  aria-label="Chat on WhatsApp"
>
  WhatsApp
</a>
    </main>
  );
}
