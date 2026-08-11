"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import TurnstileField from "./components/TurnstileField";
import { submitItineraryLead } from "@/lib/lead-capture";
import ConversionTrustStrip from "./components/ConversionTrustStrip";
import CtaNextStepNote from "./components/CtaNextStepNote";
import TrustSafetyBlock from "./components/TrustSafetyBlock";
import BookingConfidencePanel from "./components/BookingConfidencePanel";
import PlanWithConfidence from "./components/PlanWithConfidence";
import OrganicVideoCard from "./components/OrganicVideoCard";
import PrivateRouteIdeas from "./components/PrivateRouteIdeas";

const tours = [
  {
    title: "The Spine Explorer",
    days: "4-5 Days",
    price: "From $1,500",
    desc: "A private Bwindi forest experience built around permit timing, calm transfers, and the rare hour you stand near mountain gorillas.",
    link: "/tours/spine-explorer",
    image: "/images/travel/bwindi-private-gorilla-viewing.webp",
    imageAlt: "Traveler seated near a mountain gorilla family in Bwindi forest",
    inclusions: ["Permit timing checked", "Private guide support", "Lodge planning by sector"],
  },
  {
    title: "The Summit Trail",
    days: "10-12 Days",
    price: "From $3,200",
    desc: "Gorilla trekking Uganda meets Rwenzori mountains hiking: forest silence, alpine valleys, and a route paced with care.",
    link: "/tours/summit-trail",
    image: "/images/travel/forest-trek.jpg",
    imageAlt: "Hikers following a forest trail toward the Rwenzori Mountains",
    inclusions: ["Gorillas + Rwenzori", "Paced route planning", "Pre-trip briefing"],
  },
  {
    title: "Margherita Expedition",
    days: "12-14 Days",
    price: "From $6,000",
    desc: "A serious, high-touch expedition to Uganda's highest peak with private logistics, mountain preparation, and clear support.",
    link: "/tours/margherita-expedition",
    image: "/images/travel/margherita-peak.png",
    imageAlt: "Snow-covered Margherita Peak above the Rwenzori valleys",
    inclusions: ["Summit planning", "Private logistics", "Premium expedition support"],
  },
];

const whyCards = [
  ["Local safari specialists", "Uganda-based planning shaped by permits, roads, weather, trail conditions, and park timing.", "/expertise"],
  ["Thoughtful private planning", "Clear route choices, written inclusions, and practical next steps before any deposit is requested.", "/planning"],
  ["Rare Uganda combinations", "Gorilla trekking, Rwenzori hiking, lakes, and savannah arranged as one well-paced journey.", "/rare-experience"],
  ["Tailor-made travel", "Your dates, pace, comfort level, fitness, and interests shape the itinerary from the start.", "/private-travel"],
];

const safariCards = [
  {
    title: "Gorilla Encounters",
    img: "/images/travel/bwindi-close-gorilla-encounter.webp",
    imageAlt: "Mountain gorilla resting in dense Bwindi forest vegetation",
    desc: "Step into Bwindi forest and feel the hush before a gorilla family appears through the leaves.",
  },
  {
    title: "Rwenzori Trails",
    img: "/images/travel/boardwalk-trek.jpg",
    imageAlt: "Hikers crossing a wooden boardwalk on a Rwenzori trail",
    desc: "Follow boardwalks, moss, giant lobelia, and high valleys toward the glacier country of the Rwenzori.",
  },
  {
    title: "Savannah Wildlife",
    img: "/images/travel/zebra-giraffe.jpg",
    imageAlt: "Zebras and giraffes together on open Uganda savanna",
    desc: "Slow the journey between forests and mountains with open plains, boat water, and warm Ugandan hospitality.",
  },
];

const journeyMoments = [
  {
    title: "Forest approach",
    img: "/images/travel/bwindi-trek-ranger-guests.jpg",
    imageAlt: "Rangers leading guests into Bwindi forest for a gorilla trek",
    caption: "Quiet Bwindi mornings, permit timing, and a guided approach that lets the forest set the pace.",
  },
  {
    title: "Gorilla viewing",
    img: "/images/travel/bwindi-private-gorilla-viewing.webp",
    imageAlt: "Traveler seated quietly near a gorilla family in Bwindi forest",
    caption: "A carefully guided encounter that gives the gorilla family space while keeping the moment calm and respectful.",
  },
  {
    title: "Rwenzori trail",
    img: "/images/travel/boardwalk-trek.jpg",
    imageAlt: "Hikers moving along a wet boardwalk in the Rwenzori Mountains",
    caption: "Wet valleys, alpine plants, and a mountain pace planned honestly around fitness and weather.",
  },
  {
    title: "Lake recovery",
    img: "/images/travel/lake-boat.webp",
    imageAlt: "Travelers crossing a calm Uganda lake by wooden boat",
    caption: "Soft recovery days on Uganda's lakes help the whole route breathe after the big moments.",
  },
];

const premiumVentures = [
  {
    label: "Private Expeditions",
    title: "Enter Uganda privately.",
    desc: "Gorilla trekking, Rwenzori routes, safari extensions, and premium logistics shaped around your dates, pace, comfort level, and appetite for wild places.",
    href: "/tours",
    image: "/images/travel/forest-guide.jpg",
    imageAlt: "Uganda forest guide leading travelers along a shaded trail",
    cta: "Explore Private Routes",
  },
  {
    label: "Executive Retreats",
    title: "Leadership built in the wild.",
    desc: "Private Uganda offsites for founders, boards, executives, NGOs, and senior teams who want silence, perspective, and a shared experience with real strategic value.",
    href: "/corporate-retreats",
    image: "/images/travel/corporate-retreat.jpg",
    imageAlt: "Leadership retreat group gathered on Uganda savanna",
    cta: "Explore Retreats",
  },
  {
    label: "Conservation Membership",
    title: "Support that continues after the journey.",
    desc: "Membership circles for travelers and supporters who want field stories, impact updates, and a lasting connection to Uganda's wild places after the journey ends.",
    href: "/conservation-membership",
    image: "/images/travel/traveler-trust-gorilla.jpg",
    imageAlt: "Young mountain gorilla resting among green forest plants",
    cta: "Become a Guardian",
  },
];

const storyCards = [
  {
    label: "Watch",
    title: "Gorilla trekking in Bwindi",
    desc: "A visual starting point for travelers who want to understand the Bwindi forest experience before choosing dates.",
    image: "/images/travel/bwindi-trek-ranger-guests.jpg",
    imageAlt: "Rangers guiding guests during a Bwindi gorilla trek",
    href: "https://utb.go.ug/",
    cta: "Explore Visit Uganda",
    external: true,
  },
  {
    label: "Read",
    title: "Gorilla Trekking Guide 2026",
    desc: "Permit timing, trek expectations, route choices, and preparation for a serious Uganda safari experience.",
    image: "/images/travel/bwindi-young-gorilla-guest.jpg",
    imageAlt: "Traveler photographing a young gorilla in Bwindi forest",
    href: "/guide",
    cta: "Read Our Guide",
    external: false,
  },
  {
    label: "Official",
    title: "Bwindi World Heritage context",
    desc: "UNESCO background on the biodiversity and conservation value of Bwindi Impenetrable National Park.",
    image: "/images/travel/terraced-mountains.jpg",
    imageAlt: "Terraced green hills beneath mountain ridges in western Uganda",
    href: "https://whc.unesco.org/en/list/682",
    cta: "Open UNESCO Source",
    external: true,
  },
  {
    label: "Official",
    title: "Permit and tracking rules",
    desc: "Uganda Wildlife Authority guidance for gorilla and chimpanzee tracking procedures.",
    image: "/images/travel/ranger-briefing.jpg",
    imageAlt: "Uganda ranger briefing travelers before a forest trek",
    href: "https://ugandawildlife.org/wp-content/uploads/2024/07/Guidelines-for-the-management-of-gorilla-and-chimpanzee-tracking-JULY-2024.pdf",
    cta: "View UWA Guidance",
    external: true,
  },
  {
    label: "Plan",
    title: "Rwenzori trail preparation",
    desc: "Weather, pacing, gear expectations, and recovery days for Rwenzori mountains hiking.",
    image: "/images/travel/boardwalk-trek.jpg",
    imageAlt: "Hikers crossing a wooden boardwalk in the Rwenzori Mountains",
    href: "/rwenzori-hiking-tours",
    cta: "Explore Rwenzori",
    external: false,
  },
  {
    label: "Private",
    title: "Build your Uganda story",
    desc: "Turn the inspiration into a real itinerary with permits, lodges, guiding, and private logistics checked before you commit.",
    image: "/images/travel/bwindi-private-gorilla-viewing.webp",
    imageAlt: "Traveler observing a gorilla family from a respectful distance in Bwindi",
    href: "/#book",
    cta: "Start Private Planning",
    external: false,
  },
];

const travelerQuestions = [
  {
    title: "Will the route feel rushed?",
    answer:
      "We build in realistic drive times, early starts only where they make sense, and recovery space after intense forest or mountain days.",
    detail: "Pacing and comfort",
  },
  {
    title: "What happens before I pay?",
    answer:
      "You receive a written itinerary, itemised quotation, cancellation terms, and a numbered invoice before any company-bank transfer is requested.",
    detail: "Clear paperwork",
  },
  {
    title: "Can I compare route options?",
    answer:
      "Yes. We can compare Bwindi sectors, fly-in versus drive-in access, lodge styles, and extensions before you choose the route.",
    detail: "Decision support",
  },
];

const trustSignals = [
  ["Permit-first", "Gorilla trekking plans shaped around availability, sector logic, and the best lodge base."],
  ["Private by design", "Each route is shaped around your dates, pace, comfort level, and reason for coming to Uganda."],
  ["Long-haul ready", "Planning language, pacing, and support designed for travelers flying in from abroad."],
  ["Uganda based", "Ground knowledge from Uganda, not generic third-party brochure planning."],
];

const assuranceSteps = [
  ["1", "You share your month, route interests, group size, comfort level, and what would make the trip feel unforgettable."],
  ["2", "We check realistic permit, lodge, guide, transfer, and route availability before quoting."],
  ["3", "You receive a written itinerary, itemised quote, numbered invoice, and a calm next step."],
];

const entryPointPlans = [
  {
    title: "Start from Entebbe or Kampala",
    detail:
      "Best for Uganda-first itineraries with Bwindi, Queen Elizabeth, Lake Bunyonyi, or Rwenzori extensions built into one calm route.",
    cta: "Plan from Uganda",
    href: "/?source=entry_point_uganda&route=Custom%20Uganda%20Safari#book",
  },
  {
    title: "Start from Kigali",
    detail:
      "Useful when dates are tight and southwest Uganda access makes sense. We explain border timing, permit logic, and route tradeoffs clearly.",
    cta: "Compare Kigali Access",
    href: "/?source=entry_point_kigali&route=Gorilla%20Permit%20Help#book",
  },
  {
    title: "Fly-in or drive-in",
    detail:
      "For premium travelers, we compare road transfers with domestic flight options so comfort, timing, and budget match the journey.",
    cta: "Ask About Fly-in Options",
    href: "/?source=fly_in_options&route=The%20Spine%20Explorer#book",
  },
];

const confidencePoints = [
  "Permit availability checked before final route design",
  "Date-change options discussed before confirmation",
  "Official invoice before any deposit is requested",
  "Private 4x4 and fly-in options compared when useful",
];

const bookingFaqs = [
  ["Is Uganda safe for this kind of trip?", "Uganda rewards travelers who plan carefully. We guide arrival, transfers, trekking logistics, park procedures, and pacing so the journey feels clear before you land."],
  ["When should I book gorilla permits?", "Earlier is better, especially for peak months. Permit availability can shape your exact travel dates, Bwindi sector, lodge options, and transfer route."],
  ["What fitness level do I need?", "Gorilla trekking can range from moderate to demanding depending on the gorilla family location. Rwenzori routes require stronger hiking fitness and preparation."],
  ["What is included in the quote?", "We clarify permits, guiding, transport, accommodation level, park logistics, and optional extensions before you commit."],
  ["Can the itinerary be private?", "Yes. Wild Spine focuses on private and tailored Uganda journeys rather than fixed mass-market departures."],
  ["How do payments work?", "We confirm availability and scope first, then issue a written itinerary, itemised quotation, numbered invoice, and official company-bank transfer instructions. No payment is confirmed from a screenshot or social-media message."],
];

const ecosystemLogos = [
  { name: "Uganda Wildlife Authority", initials: "UWA", note: "Park permits & conservation guidelines" },
  { name: "Uganda Tourism Board", initials: "UTB", note: "Destination Uganda standards" },
  { name: "Bwindi Impenetrable National Park", initials: "BINP", note: "Gorilla trekking ecosystem" },
  { name: "Rwenzori Mountains National Park", initials: "RMNP", note: "Mountain route ecosystem" },
  { name: "Uganda Civil Aviation Authority", initials: "CAA", note: "Arrival & airport travel context" },
  { name: "Insurance & evacuation planning", initials: "IE", note: "Traveller preparation context" },
];

const planningPageLinks = [
  {
    title: "Why Wild Spine",
    desc: "Meet the standards behind every private journey: people, permits, routes, support, and accountability.",
    href: "/why-wild-spine",
    cta: "See why travelers choose us",
  },
  {
    title: "Payment information",
    desc: "How deposits are requested after a written proposal, how beneficiary details are checked, and when receipts are issued.",
    href: "/payment-information",
    cta: "Read how payment works",
  },
  {
    title: "Booking terms",
    desc: "What is included, what can change, how cancellations work, and when reservations become confirmed.",
    href: "/terms",
    cta: "Review booking terms",
  },
  {
    title: "Refund policy",
    desc: "How supplier costs, overpayments, written approvals, and refund requests are handled.",
    href: "/refund-policy",
    cta: "Read refund policy",
  },
  {
    title: "Reviews & references",
    desc: "How review links, client references, field proof, and booking evidence are verified before publication.",
    href: "/reviews",
    cta: "Review trust evidence",
  },
  {
    title: "Official contact",
    desc: "Use the website, reservations email, WhatsApp, and Kampala postal address for direct planning questions.",
    href: "/contact",
    cta: "Contact Wild Spine",
  },
];

const fieldProofImages = [
  {
    title: "Guide at Mgahinga",
    image: "/images/field/guide-mgahinga-sign.webp",
    imageAlt: "Wild Spine Uganda guide standing beside the Mgahinga Gorilla National Park sign",
    caption: "A recognizable park setting helps guests picture the day before they arrive.",
  },
  {
    title: "Ranger-station readiness",
    image: "/images/field/guide-ranger-station.webp",
    imageAlt: "Guide standing outside a stone ranger station with trekking staff nearby",
    caption: "Permit timing, arrival rhythm, and ranger briefings make the day feel smoother.",
  },
  {
    title: "Rwenzori terrain",
    image: "/images/field/rwenzori-boardwalk-valley.webp",
    imageAlt: "A hiker crossing a Rwenzori boardwalk through high mountain valley vegetation",
    caption: "Mountain routes are planned around real terrain, weather, and recovery time.",
  },
  {
    title: "Murchison water and wildlife",
    image: "/images/field/murchison-falls-river.webp",
    imageAlt: "Water rushing through Murchison Falls National Park in Uganda",
    caption: "Safari extensions add rhythm between gorilla forests and mountain trails.",
  },
];

const fieldProofVideos = [
  {
    title: "Lodge arrival and recovery",
    description: "A quiet base between long drives, early starts, and forest days helps the journey breathe.",
    src: "/video/field/enttiko-lodge-preview.mp4",
    poster: "/images/field/enttiko-lodge-preview-poster.webp",
    label: "Silent preview video of a Uganda lodge arrival and room setting",
  },
  {
    title: "Wildlife between the forests",
    description: "Savannah and water moments add space and rhythm between gorilla forests and mountain trails.",
    src: "/video/field/murchison-wildlife-water.mp4",
    poster: "/images/field/murchison-wildlife-water-poster.webp",
    label: "Silent preview video of wildlife and water scenes in a Uganda national park",
  },
  {
    title: "Rwenzori waterfall trail",
    description: "Wet forest, moving water, and real footing help travelers understand the mountain before they arrive.",
    src: "/video/field/rwenzori-waterfall-trail.mp4",
    poster: "/images/field/rwenzori-waterfall-trail-poster.webp",
    label: "Silent preview video of a Rwenzori waterfall and mountain trail",
  },
  {
    title: "Gorilla forest encounter",
    description: "The forest experience is quiet, close, and carefully managed around park guidance and respect for the gorillas.",
    src: "/video/field/gorilla-forest-encounter.mp4",
    poster: "/images/field/gorilla-forest-encounter-poster.webp",
    label: "Silent preview video of a gorilla encounter in Uganda forest",
  },
  {
    title: "Trail support on foot",
    description: "The best travel days depend on pace, footing, local support, and calm practical rhythm.",
    src: "/video/field/forest-trail-support.mp4",
    poster: "/images/field/forest-trail-support-poster.webp",
    label: "Silent preview video of local trail support in a Uganda forest",
  },
  {
    title: "Team bridge crossing",
    description: "Bridge crossings and wet boards show why mountain routes need honest pacing and preparation.",
    src: "/video/field/rwenzori-bridge-team.mp4",
    poster: "/images/field/rwenzori-bridge-team-poster.webp",
    label: "Silent preview video of a team crossing a Rwenzori bridge",
  },
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
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const travelMonth = String(form.get("travel_month") || "").trim();

    if (!name) {
      setSubmitting(false);
      setError("Please share your full name so we know who to contact.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitting(false);
      setError("Please enter a valid email address.");
      return;
    }

    if (!travelMonth) {
      setSubmitting(false);
      setError("Please share your ideal travel month, even if it is approximate.");
      return;
    }

    const tripDetails = [
      ["Group size", String(form.get("group_size") || "").trim()],
      ["Budget range", String(form.get("budget_range") || "").trim()],
      ["Comfort level", String(form.get("comfort_level") || "").trim()],
      ["Travel pace", String(form.get("pace") || "").trim()],
      ["Must-see experiences", String(form.get("experiences") || "").trim()],
      ["Message", String(form.get("message") || "").trim()],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");
    const payload = {
      name,
      email,
      phone: String(form.get("phone") || "").trim() || null,
      country: String(form.get("country") || "").trim() || null,
      travel_month: travelMonth,
      route: route === "Choose preferred route" ? null : route,
      message: tripDetails || null,
      lead_source: leadSource,
      website: String(form.get("website") || ""),
      turnstile_token: String(form.get("cf-turnstile-response") || ""),
    };

    const result = await submitItineraryLead({ ...payload, lead_type: "itinerary request" });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.reason || "We could not save your request. Please try again or contact us on WhatsApp.");
      return;
    }

    setSent(true);
    trackEvent("itinerary_request_submitted", { route: payload.route, country: payload.country, source: leadSource });
    router.push(`/thank-you?type=itinerary&source=${encodeURIComponent(leadSource)}${payload.route ? `&route=${encodeURIComponent(payload.route)}` : ""}`);
  }

  return (
    <main className="bg-[#f8f4e8] text-[#123a2a] overflow-hidden">
      <div className="scroll-progress" />

      <nav
        className={`fixed top-0 left-0 z-50 w-full flex justify-between items-center px-6 md:px-10 py-5 transition-all duration-500 ${
          scrolled ? "border-b border-[#d8cda9] bg-[#fff9ea]/95 text-[#123a2a] shadow-sm backdrop-blur" : "bg-transparent text-white"
        }`}
      >
        <a href="#home">
          <h1 className="text-lg md:text-xl font-black tracking-[0.3em]">WILD SPINE</h1>
          <p className="text-xs text-[#b8860b] tracking-[0.35em]">UGANDA</p>
        </a>

        <div className="hidden md:flex items-center gap-5 text-xs uppercase tracking-widest xl:gap-8 xl:text-sm">
          <a href="/uganda-gorilla-permit-help" className="nav-link">Gorilla Permit</a>
          <a href="/volunteer" className="nav-link">Volunteer</a>
<a href="/guide" className="nav-link">Guide</a>
<a href="/tours" className="nav-link">Tours</a>
          <a href="/corporate-retreats" className="nav-link">Retreats</a>
          <a href="/conservation-membership" className="nav-link">Impact</a>
          <a href="/why-wild-spine" className="nav-link">Why us</a>
          <a href="/payment-information" className="nav-link">How to pay</a>
          <a href="/about" className="nav-link">About</a>
          <a href="#book" className="bg-[#f5b416] text-black px-5 py-3 rounded-full font-black hover:bg-[#ffd766] transition">
            Start Planning
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className={`rounded-full border px-4 py-2 text-sm font-black md:hidden ${
            scrolled ? "border-[#d8cda9] text-[#123a2a]" : "border-white/20 text-white"
          }`}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-home-menu"
        >
          Menu
        </button>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-home-menu" className="fixed left-4 right-4 top-20 z-50 rounded-3xl border border-[#d8cda9] bg-[#fff9ea]/98 p-5 text-[#123a2a] shadow-2xl md:hidden">
          <div className="grid gap-3 text-sm font-bold uppercase tracking-widest">
            <a href="/uganda-gorilla-permit-help" className="rounded-2xl bg-white/70 px-4 py-3">Gorilla Permit</a>
            <a href="/tours" className="rounded-2xl bg-white/70 px-4 py-3">Tours</a>
            <a href="/corporate-retreats" className="rounded-2xl bg-white/70 px-4 py-3">Retreats</a>
            <a href="/conservation-membership" className="rounded-2xl bg-white/70 px-4 py-3">Impact</a>
            <a href="/guide" className="rounded-2xl bg-white/70 px-4 py-3">Guide</a>
            <a href="/volunteer" className="rounded-2xl bg-white/70 px-4 py-3">Volunteer</a>
            <a href="/why-wild-spine" className="rounded-2xl bg-white/70 px-4 py-3">Why us</a>
            <a href="/payment-information" className="rounded-2xl bg-white/70 px-4 py-3">How to pay</a>
            <a href="/about" className="rounded-2xl bg-white/70 px-4 py-3">About</a>
            <a href="#book" onClick={() => setMobileMenuOpen(false)} className="rounded-2xl bg-[#f5b416] px-4 py-3 text-black">Start Planning</a>
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
          <p className="text-[#b8860b] uppercase tracking-[0.35em] text-sm mb-5">
            Gorilla Trekking Uganda • Rwenzori Mountains • Private Safari Design
          </p>

          <h2 className="text-5xl md:text-8xl font-black leading-[0.92] mb-8 text-white">
            <span className="block">Trek the </span>
            <span className="block text-[#f5b416]">Backbone </span>
            <span className="block">of Africa</span>
          </h2>

          <p className="max-w-2xl text-lg md:text-xl text-white/85 mb-10 leading-8">
            From Bwindi&apos;s gorilla forests to the Rwenzori Mountains, Wild Spine Uganda designs
            private journeys along Africa&apos;s great highland spine with permits, pacing, lodges,
            and local guidance handled with care.
          </p>

          <p className="mb-6 inline-flex rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#f5b416]">
            Private journeys from $1,500+ / Fully customized expeditions
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#book" className="bg-[#f5b416] text-black px-8 py-4 rounded-full font-black hover:bg-[#ffd766] transition text-center">
              Start Your Private Uganda Journey
            </a>
            <a href="/tours" className="border border-white/30 px-8 py-4 rounded-full font-black text-white hover:bg-white hover:text-black transition text-center">
              Explore Private Routes
            </a>
          </div>
          <CtaNextStepNote />
        </div>
      </section>

      <section className="bg-[#f8f4e8] px-6 py-24 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-kicker">Choose the right entry point</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-[#123a2a] md:text-5xl">
              Start with the route that makes the trip feel calm.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#68746a]">
              Gorilla trekking Uganda can begin from Entebbe, Kampala, Kigali, or a fly-in connection.
              We compare the realistic transfer flow before asking you to commit, so the plan fits your time,
              comfort, and budget.
            </p>
            <div className="mt-8 rounded-lg border border-[#d8cda9] bg-white/70 p-6">
              <h3 className="text-lg font-black text-[#123a2a]">
                Book 2026 and 2027 gorilla travel with confidence.
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {confidencePoints.map((point) => (
                  <p key={point} className="text-sm font-semibold leading-6 text-[#68746a]">
                    <span className="mr-2 text-[#b8860b]">Yes</span>
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {entryPointPlans.map((plan) => (
              <a
                key={plan.title}
                href={plan.href}
                className="group rounded-lg border border-[#d8cda9] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416] hover:shadow-xl"
              >
                <h3 className="text-2xl font-black text-[#123a2a]">{plan.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#68746a]">{plan.detail}</p>
                <p className="mt-5 text-sm font-black uppercase tracking-widest text-[#b8860b] transition group-hover:text-[#123a2a]">
                  {plan.cta} →
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#123a2a] px-6 py-14 text-white md:px-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-kicker">Private route review</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
              Not sure whether Entebbe, Kampala, Kigali, or a fly-in route is right?
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              Send your dates and comfort level. We will compare the practical route before you spend money on permits or lodges.
            </p>
          </div>
          <a href="#book" className="shrink-0 rounded-full bg-[#f5b416] px-8 py-4 text-center font-black text-black transition hover:bg-[#ffd766]">
            Request a Route Review
          </a>
        </div>
      </section>

     <section className="relative h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">

  <Image
    src="/images/travel/bwindi-private-gorilla-viewing.webp"
    alt="Traveler seated quietly near a gorilla family in Bwindi forest"
    fill
    sizes="100vw"
    className="absolute inset-0 object-cover"
  />

  <div className="absolute inset-0 bg-black/60" />

  <div className="relative z-10 max-w-3xl px-6">

    <h3 className="text-5xl md:text-6xl font-black mb-6">
      This is not just a safari.
    </h3>

    <p className="text-xl text-white/90 leading-8">
      It is the moment your world goes quiet.
    </p>

    <p className="text-lg text-white/75 mt-4 leading-8">
      Deep in the mist of Uganda&apos;s ancient forests, you do not simply see gorillas.
      You feel the weight of their presence, hear the forest settle, and realize how rare the moment is.
    </p>

    <p className="text-lg text-white/75 mt-4 leading-8">
      This is not about collecting destinations. It is about entering a living landscape with
      people who know the trails, the timing, the park procedures, and the responsibility that comes with them.
    </p>

    <p className="text-[#f5b416] mt-6 font-semibold tracking-wide">
      Private journeys. Careful planning. Uganda experienced with depth, not rush.
    </p>

  </div>

</section>

<section className="py-32 px-6 md:px-24 bg-[#f8f4e8]">
  <div className="max-w-6xl mx-auto">
    <div className="mb-16">
      <h3 className="text-4xl md:text-6xl font-black mb-6">
        Stories from the Wild
      </h3>
      <p className="text-[#68746a] max-w-2xl">
        Field notes, official context, and planning insight for travelers who want the Uganda safari experience to feel inspiring, safe, and well prepared.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {storyCards.map((story) => (
        <a
          key={story.title}
          href={story.href}
          target={story.external ? "_blank" : undefined}
          rel={story.external ? "noopener noreferrer" : undefined}
          className="group overflow-hidden rounded-3xl border border-[#d8cda9] bg-white/70 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-[#f5b416]/50 hover:bg-white/10"
        >
          <div className="relative h-64 overflow-hidden">
            <Image src={story.image} alt={story.imageAlt} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/85 via-[#123a2a]/20 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full bg-[#f5b416] px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
              {story.label}
            </div>
          </div>
          <div className="p-6">
            <h4 className="text-xl font-black text-[#123a2a]">{story.title}</h4>
            <p className="mt-3 min-h-20 text-sm leading-6 text-[#68746a]">{story.desc}</p>
            <p className="mt-5 text-sm font-black text-[#b8860b]">{story.cta} →</p>
          </div>
        </a>
      ))}
    </div>
  </div>
</section>
<section className="px-6 md:px-24 py-12 bg-[#fff9ea] border-y border-[#d8cda9]">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-black text-[#b8860b]">Permit-first</h3>
            <p className="text-[#68746a]">Gorilla planning</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#b8860b]">Private</h3>
            <p className="text-[#68746a]">Custom routes</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#b8860b]">Local</h3>
            <p className="text-[#68746a]">Uganda team</p>
          </div>
        </div>
      </section>

      <section id="experience" className="reveal-section py-32 px-6 md:px-24 bg-[#f8f4e8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Two Worlds. One Uganda.</p>
            <h3 className="text-4xl md:text-6xl font-black leading-tight">
              From Bwindi forest silence to Rwenzori ice.
            </h3>
          </div>
          <p className="text-[#68746a] text-lg leading-8">
            Feel the stillness of a Bwindi forest experience, then climb toward alpine valleys,
            giant lobelia, and snow-crowned peaks on the equator. We connect the beauty with practical planning.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#f8f4e8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {safariCards.map((item) => (
            <div
              key={item.title}
              className="group relative h-[360px] rounded-3xl overflow-hidden border border-[#d8cda9]"
            >
              <Image
                src={item.img}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="absolute inset-0 object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/90 via-[#123a2a]/35 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-black mb-2 group-hover:text-[#ffd766] transition">
                  {item.title}
                </h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 md:px-24 bg-[#f8f4e8]">
  <div className="max-w-4xl">
    <h3 className="text-4xl md:text-5xl font-black mb-8">
      Where the world goes quiet
    </h3>

    <p className="text-[#68746a] text-lg leading-8">
      Deep inside Uganda&apos;s forests, something changes. The noise fades.
      The pace slows. For a moment, you are no longer chasing a sighting.
      You are present, still, and trusted to move through the wilderness with care.
    </p>
  </div>
</section>

<section className="px-6 pb-24 md:px-24 bg-[#f8f4e8]">
  <div className="max-w-6xl mx-auto">
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="section-kicker">Journey Moments</p>
        <h3 className="text-3xl md:text-5xl font-black">More than a route on paper.</h3>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-[#68746a]">
        A Wild Spine itinerary moves through real places: forest roads, ranger briefings, misty trailheads, mountain valleys, and recovery stops that keep the trip grounded.
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-4">
      {journeyMoments.map((moment, index) => (
        <figure key={moment.title} className={`group overflow-hidden rounded-3xl border border-[#d8cda9] bg-white/70 shadow-sm ${index === 1 ? "md:translate-y-8" : ""}`}>
          <div className="relative h-72 overflow-hidden">
            <Image src={moment.img} alt={moment.imageAlt} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/85 to-transparent" />
            <figcaption className="absolute bottom-0 p-5">
              <p className="font-black text-white">{moment.title}</p>
            </figcaption>
          </div>
          <p className="p-5 text-sm leading-6 text-[#68746a]">{moment.caption}</p>
        </figure>
      ))}
    </div>
  </div>
</section>

<section id="tours" className="reveal-section py-32 px-6 md:px-24 bg-[#fff9ea]">
        <div className="max-w-6xl mx-auto mb-16">
          <p className="section-kicker">Signature Expeditions</p>
          <h3 className="text-4xl md:text-6xl font-black">Choose the route that fits your courage.</h3>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <a key={tour.title} href={tour.link} className={`package-card group ${index === 1 ? "featured-card" : ""}`}>
              <div className="relative mb-6 h-52 overflow-hidden rounded-2xl">
                <Image src={tour.image} alt={tour.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="text-[#b8860b] text-sm mb-3">0{index + 1} / {tour.days}</p>
              <h4 className="text-2xl font-black mb-3 group-hover:text-[#2f7d4e] transition">{tour.title}</h4>
              <p className="text-[#123a2a] font-semibold mb-5">{tour.price}</p>
              <p className="text-[#68746a] leading-7 mb-6">{tour.desc}</p>

              <ul className="space-y-2 text-[#3d4a41] text-sm mb-8">
                {tour.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className="text-[#b8860b] font-black">Explore route</p>
            </a>
          ))}
        </div>
      </section>

      <PrivateRouteIdeas />

<section className="py-32 px-6 md:px-24 bg-[#123a2a] text-white">
  <div className="max-w-6xl mx-auto">
    <div className="mb-14 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
      <div>
        <p className="section-kicker">Beyond Safari</p>
        <h3 className="text-4xl md:text-6xl font-black">
          Choose how Uganda changes you.
        </h3>
      </div>
      <p className="text-lg leading-8 text-white/70">
        Start with a private expedition, bring a leadership team into the wilderness,
        or stay connected through conservation. Each path is planned with clarity before you commit.
      </p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {premiumVentures.map((venture) => (
        <a
          key={venture.title}
          href={venture.href}
          className="group overflow-hidden rounded-3xl border border-white/12 bg-white/8 transition duration-500 hover:-translate-y-1 hover:border-[#f5b416]/55"
        >
          <div className="relative h-80 overflow-hidden">
            <Image src={venture.image} alt={venture.imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <p className="absolute left-6 top-6 rounded-full bg-[#f5b416] px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
              {venture.label}
            </p>
          </div>
          <div className="p-7 md:p-8">
            <h4 className="mb-4 text-3xl font-black transition group-hover:text-[#f5b416]">
              {venture.title}
            </h4>
            <p className="mb-8 leading-7 text-white/70">{venture.desc}</p>
            <p className="font-black text-[#f5b416]">{venture.cta}</p>
          </div>
        </a>
      ))}
    </div>
  </div>
</section>

<section className="relative overflow-hidden py-32 px-6 md:px-24 border-t border-[#d8cda9]">
  <Image
    src="/images/travel/bwindi-young-gorilla-guest.jpg"
    alt="Traveler quietly photographing a young gorilla in Bwindi forest"
    fill
    sizes="100vw"
    className="absolute inset-0 object-cover object-[28%_center]"
  />
  <div className="absolute inset-0 bg-[#fff9ea]/40" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#fff9ea]/82 via-[#fff9ea]/46 to-[#fff9ea]/12" />

  <div className="relative z-10 max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start mb-16">
      <div>
        <p className="section-kicker">Travel with confidence</p>
        <h3 className="text-4xl md:text-5xl font-black mb-6">
          A serious journey should feel clear before you commit.
        </h3>
        <p className="text-[#68746a] text-lg leading-8">
          A private Uganda journey asks for confidence. Wild Spine earns it through clear communication,
          local route knowledge, careful permit planning, and written payment instructions before you send a deposit.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {trustSignals.map(([value, label]) => (
          <div key={value} className="rounded-2xl border border-[#d8cda9] bg-white/85 shadow-lg backdrop-blur-sm p-6">
            <p className="text-3xl font-black text-[#b8860b]">{value}</p>
            <p className="mt-3 text-sm leading-6 text-[#68746a]">{label}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {travelerQuestions.map((item) => (
        <div key={item.title} className="rounded-2xl border border-[#d8cda9] bg-white/85 shadow-lg backdrop-blur-sm p-6">
          <p className="mb-5 text-sm font-black tracking-widest text-[#b8860b]">
            {item.detail}
          </p>
          <h4 className="mb-4 text-2xl font-black text-[#123a2a]">{item.title}</h4>
          <p className="text-[#3d4a41] leading-7">{item.answer}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-20 px-6 md:px-24 bg-[#fff9ea] border-t border-[#d8cda9]">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-12">
    <div>
      <p className="section-kicker">Booking assurance</p>
      <h3 className="text-3xl md:text-4xl font-black mb-5">
        Know exactly what happens before you pay.
      </h3>
      <p className="text-[#68746a] leading-8">
        We do not rush travelers into vague packages. Every inquiry is checked against the realities that matter:
        gorilla permit timing, lodge availability, transfer distance, mountain conditions, and the support level you expect.
      </p>
    </div>

    <div className="grid gap-4">
      {assuranceSteps.map(([step, text]) => (
        <div key={step} className="flex gap-5 rounded-2xl border border-[#d8cda9] bg-white/70 shadow-sm p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5b416] font-black text-black">
            {step}
          </div>
          <p className="text-[#3d4a41] leading-7">{text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<PlanWithConfidence />

<ConversionTrustStrip />

<section className="py-20 px-6 md:px-24 bg-[#fff9ea] border-t border-[#d8cda9]">

  <div className="max-w-5xl mx-auto grid gap-6 text-center md:grid-cols-3">

    <div className="rounded-3xl border border-[#d8cda9] bg-white/75 p-6 shadow-sm">
      <h3 className="font-black text-[#123a2a]">Company-bank transfer only</h3>
      <p className="text-[#68746a] text-sm mt-2">
        Written invoices, official beneficiary checks, and no personal-account payments.
      </p>
    </div>

    <div className="rounded-3xl border border-[#d8cda9] bg-white/75 p-6 shadow-sm">
      <h3 className="font-black text-[#123a2a]">Park procedure guidance</h3>
      <p className="text-[#68746a] text-sm mt-2">
        Trekking plans shaped around official park procedures and realistic route timing.
      </p>
    </div>

    <div className="rounded-3xl border border-[#d8cda9] bg-white/75 p-6 shadow-sm">
      <h3 className="font-black text-[#123a2a]">Local route knowledge</h3>
      <p className="text-[#68746a] text-sm mt-2">
        Ground context for Bwindi forests, Rwenzori trails, lodges, transfers, and recovery days.
      </p>
    </div>

  </div>

</section>

      <section className="px-6 pb-20 md:px-24 bg-[#f8f4e8]">
        <div className="mx-auto max-w-6xl overflow-hidden border-y border-[#d8cda9] py-8">
          <div className="mb-8 flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="section-kicker">Trusted ecosystem</p>
              <h3 className="text-3xl font-black md:text-4xl">
                Planned around Uganda&apos;s official travel landscape.
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[#68746a]">
              We shape trips around recognized tourism, park, conservation, and route authorities so your itinerary is beautiful and practical.
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

      <section id="why" className="reveal-section py-32 px-6 md:px-24 bg-[#f8f4e8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <p className="section-kicker">Why Wild Spine</p>
            <h3 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Built on ground truth, not brochure language.
            </h3>
            <p className="text-[#68746a] leading-8">
              We are Ugandans who understand these routes from forest trails to alpine passes, and we tell you what is realistic before you book.
            </p>
          </div>

          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            {whyCards.map(([title, desc, link]) => (
              <a key={title} href={link} className="premium-card">
                <h4 className="text-2xl font-black mb-4">{title}</h4>
                <p className="text-[#68746a] leading-7">{desc}</p>
                <p className="text-[#b8860b] mt-8 font-black">Explore More →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

<section className="py-32 px-6 md:px-24 bg-[#f8f4e8] border-t border-[#d8cda9]">

  <div className="max-w-5xl">

    <h3 className="text-4xl md:text-5xl font-black mb-6">
      Gorilla Permit Assistance, handled properly
    </h3>

    <p className="text-[#68746a] text-lg mb-8">
      A gorilla permit is more than a ticket. It affects your Bwindi sector, lodge choice,
      transfer route, and the rhythm of the entire journey. We help you secure the right option
      with clear written steps before you pay.
    </p>

    <div className="grid md:grid-cols-2 gap-6 mb-10">

      <div className="border border-[#d8cda9] p-6 rounded-xl">
        Permit availability checked before route design
      </div>

      <div className="border border-[#d8cda9] p-6 rounded-xl">
        Trekking dates matched to sector and lodge logic
      </div>

      <div className="border border-[#d8cda9] p-6 rounded-xl">
        Transport and lodge coordination around the permit
      </div>

      <div className="border border-[#d8cda9] p-6 rounded-xl">
        Last-minute guidance when dates are tight
      </div>

    </div>

    <a
      href="#book"
      className="bg-[#f5b416] text-black px-8 py-4 rounded-full font-bold hover:bg-[#ffd766] transition"
    >
      Secure Your Permit Plan
    </a>

  </div>

</section>

<section className="py-28 px-6 md:px-24 bg-[#f8f4e8] border-t border-[#d8cda9]">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
    <div>
      <p className="section-kicker">Before you book</p>
      <h3 className="text-4xl md:text-5xl font-black mb-6">
        Questions careful travelers ask first.
      </h3>
      <p className="text-[#68746a] leading-8">
        Clear answers reduce worry. These are the questions we expect thoughtful travelers to ask before planning a serious Uganda journey.
      </p>
    </div>

    <div className="grid gap-4">
      {bookingFaqs.map(([question, answer]) => (
        <details key={question} className="rounded-2xl border border-[#d8cda9] bg-white/70 shadow-sm p-5">
          <summary className="cursor-pointer text-lg font-black text-[#123a2a]">{question}</summary>
          <p className="mt-4 leading-7 text-[#68746a]">{answer}</p>
        </details>
      ))}
    </div>
  </div>
</section>

      <TrustSafetyBlock />

      <section className="bg-[#f8f4e8] px-6 py-28 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="section-kicker">Uganda on the ground</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-[#123a2a] md:text-6xl">
                See the places behind the promise.
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-[#68746a]">
              Premium does not mean polished stock images. It means the parks, lodges, trails,
              vehicles, guides, and route texture feel visible before a traveler enquires.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {fieldProofImages.map((item, index) => (
                <figure
                  key={item.title}
                  className={`group overflow-hidden rounded-[2rem] border border-[#d8cda9] bg-white/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416] hover:bg-white hover:shadow-xl ${
                    index === 1 ? "sm:translate-y-6" : ""
                  }`}
                >
                  <div className="relative h-72 overflow-hidden md:h-80">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#123a2a]/80 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-0 p-5 text-white">
                      <h3 className="text-xl font-black">{item.title}</h3>
                    </figcaption>
                  </div>
                  <p className="p-5 text-sm leading-6 text-[#68746a]">{item.caption}</p>
                </figure>
              ))}
            </div>

            <div className="rounded-[2.5rem] border border-[#d8cda9] bg-[#123a2a] p-5 text-white shadow-xl md:p-7">
              <div className="relative overflow-hidden rounded-[2rem] bg-black">
                <video
                  className="aspect-[4/5] h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/images/field/guide-forest-briefing-poster.webp"
                  aria-label="Silent preview of a Wild Spine Uganda forest briefing"
                >
                  <source src="/video/field/guide-forest-briefing.mp4" type="video/mp4" />
                  Your browser does not support embedded video. Contact Wild Spine Uganda for current field clips.
                </video>
              </div>
              <div className="pt-7">
                <h3 className="text-3xl font-black leading-tight">First the route makes sense. Then the quote follows.</h3>
                <p className="mt-4 leading-7 text-white/72">
                  We use field context to explain routes honestly: what the trail feels like, where comfort matters,
                  how permit timing shapes the plan, and why official payment instructions only appear after a written invoice.
                </p>
                <div className="mt-6 grid gap-3 text-sm font-bold text-white/78 sm:grid-cols-2">
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Permit timing explained</p>
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Lodges matched to route</p>
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Official invoice before deposit</p>
                  <p className="rounded-2xl border border-white/10 bg-white/8 p-4">Company-bank transfer only</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fieldProofVideos.map((clip) => (
              <OrganicVideoCard key={clip.src} {...clip} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8cda9] bg-[#fff9ea] px-6 py-24 md:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Before you enquire</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[#123a2a] md:text-5xl">
                Helpful pages before you start planning.
              </h2>
            </div>
            <p className="max-w-2xl leading-7 text-[#68746a]">
              Keep the practical pages close to the booking point: why travel with us, how bank-transfer payments work,
              terms, refunds, review evidence, and official contact details.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {planningPageLinks.map((page) => (
              <a
                key={page.href}
                href={page.href}
                className="group flex min-h-60 flex-col rounded-3xl border border-[#d8cda9] bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f5b416] hover:bg-white hover:shadow-xl"
              >
                <h3 className="text-2xl font-black text-[#123a2a]">{page.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-6 text-[#68746a]">{page.desc}</p>
                <p className="mt-6 text-sm font-black uppercase tracking-widest text-[#b8860b] transition group-hover:text-[#123a2a]">
                  {page.cta} →
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="relative overflow-hidden py-32 px-6 text-white md:px-24">
        <Image
          src="/images/travel/bwindi-trek-ranger-guests.jpg"
          alt="Rangers guiding travelers during a Bwindi gorilla trekking experience"
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-[#123a2a]/58" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-[#123a2a]/15 to-black/10" />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Start Private Planning</p>
            <h3 className="text-4xl md:text-6xl font-black mb-8">
              Let us shape the Uganda you will actually remember.
            </h3>
            <p className="text-white/80 text-lg leading-8">
              Share your travel month, comfort level, route interests, and what would make this journey feel worth crossing the world for.
            </p>
            <div className="mt-7">
              <BookingConfidencePanel tone="dark" />
            </div>
            <CtaNextStepNote />
          </div>

          {sent ? (
            <div className="p-10 rounded-[2rem] bg-white/90 shadow-2xl border border-[#f5b416]/40">
              <h4 className="text-3xl font-black text-[#b8860b] mb-4">Your request is in careful hands.</h4>
              <p className="text-[#3d4a41] leading-7">
                We will review your route, timing, comfort level, and permit needs before replying with realistic next steps. Expect a clear response within 24 hours with the next questions, route logic, and permit considerations.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-[2rem] bg-white/90 shadow-2xl border border-white/45 backdrop-blur-sm">
              <TurnstileField />
              <div className="mb-6 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-5 text-[#123a2a]">
                <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 1 - Your travel details</p>
                <p className="mt-2 text-sm leading-6 text-[#68746a]">Tell us who is traveling and when you hope to visit Uganda.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <input required name="name" aria-label="Full name" className="form-input" placeholder="Full name" />
                <input required name="email" type="email" aria-label="Email address" className="form-input" placeholder="Email address" />
                <input name="phone" aria-label="WhatsApp or phone number" className="form-input" placeholder="WhatsApp / phone" />
                <input name="country" aria-label="Country of residence" className="form-input" placeholder="Country of residence" />
                <input required name="travel_month" aria-label="Ideal travel month" className="form-input" placeholder="Ideal travel month" />
                <input name="group_size" aria-label="Number of travelers" className="form-input" placeholder="Number of travelers" />
              </div>

              <div className="my-6 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-5 text-[#123a2a]">
                <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 2 - Your experience preference</p>
                <p className="mt-2 text-sm leading-6 text-[#68746a]">Choose the route style, comfort level, budget range, and pace that feel right.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">

                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-bold text-[#3d4a41]">Preferred route</span>
                <select name="route" value={preferredRoute} onChange={(e) => setPreferredRoute(e.target.value)} className="form-input">
                  <option>Choose preferred route</option>
                  <option>The Spine Explorer</option>
                  <option>The Summit Trail</option>
                  <option>Margherita Expedition</option>
                  <option>Gorilla Permit Help</option>
                  <option>Corporate Retreat</option>
                  <option>Conservation Membership</option>
                  <option>Custom Uganda Safari</option>
                </select>
                </label>

                <select name="comfort_level" aria-label="Preferred comfort level" className="form-input">
                  <option value="">Comfort level</option>
                  <option>Comfort</option>
                  <option>Premium</option>
                  <option>Luxury</option>
                  <option>Ultra-luxury / expedition support</option>
                </select>

                <select name="budget_range" aria-label="Budget range per person" className="form-input">
                  <option value="">Budget range per person</option>
                  <option>$1,500 - $3,000</option>
                  <option>$3,000 - $6,000</option>
                  <option>$6,000+</option>
                  <option>Not sure yet</option>
                </select>

                <select name="pace" aria-label="Preferred travel pace" className="form-input">
                  <option value="">Travel pace</option>
                  <option>Relaxed</option>
                  <option>Balanced</option>
                  <option>Active</option>
                  <option>Serious expedition</option>
                </select>

                <input name="experiences" aria-label="Must-see experiences" className="form-input" placeholder="Must-see: gorillas, chimps, Rwenzori, safari..." />

                <textarea
                  name="message"
                  aria-label="Travel goals and preferences"
                  className="form-input sm:col-span-2 min-h-32"
                  placeholder="Tell us what you want to feel, see, and avoid. We will turn it into a realistic Uganda plan."
                />
              </div>

              <div className="mt-6 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-5 text-[#123a2a]">
                <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 3 - Send your travel request</p>
                <p className="mt-2 text-sm leading-6 text-[#68746a]">
                  After you send this, we review permit timing, route fit, transfer reality, lodge logic, and documentation before replying.
                </p>
              </div>

              <div className="mt-6">
                <BookingConfidencePanel compact />
              </div>

              {error && (
                <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={submitting} className="mt-6 w-full bg-[#f5b416] text-black py-4 rounded-full font-black hover:bg-[#ffd766] disabled:cursor-not-allowed disabled:opacity-70 transition">
                {submitting ? "Preparing your request..." : "Start Your Private Uganda Journey"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section id="contact" className="relative py-32 px-6 md:px-24 bg-[#123a2a] text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-kicker">Contact Wild Spine</p>
            <h2 className="text-4xl md:text-6xl font-black mb-8">Begin with a calm conversation.</h2>
            <p className="text-white/70 leading-8">
              Planning office: Victoria Mall, Entebbe<br />
              Kampala meetings: Kingdom Kampala, Kampala<br />
              P.O. Box 25543 Kampala, Uganda<br />
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
