"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

const programs = [
  {
    title: "Community Impact",
    duration: "2–4 Weeks",
    price: "From $450 / week",
    image: "/images/travel/lake-boat.webp",
    desc: "Support schools, youth programs, digital skills, and local community initiatives.",
    includes: [
      "Placement coordination",
      "Local coordinator",
      "Certificate",
      "Airport pickup support",
    ],
  },
  {
    title: "Conservation Experience",
    duration: "2–3 Weeks",
    price: "From $550 / week",
    image: "/images/travel/trail-team.jpg",
    desc: "Join eco-projects, tree planting, conservation education, and responsible nature work.",
    includes: [
      "Eco field projects",
      "Community engagement",
      "Guided support",
      "Impact briefing",
    ],
  },
  {
    title: "Volunteer + Gorilla",
    duration: "2–3 Weeks",
    price: "From $1,800",
    image: "/images/travel/guide-guests.jpg",
    desc: "Combine volunteering with Uganda’s unforgettable gorilla trekking experience.",
    includes: [
      "Volunteer placement",
      "Gorilla trek support",
      "Premium logistics",
      "Safari upgrade",
    ],
  },
];

export default function VolunteerPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const program = String(form.get("program") || "");
    const payload = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
      country: String(form.get("country") || "").trim() || null,
      program: program === "Select Program" ? null : program,
      motivation: String(form.get("motivation") || "").trim() || null,
      lead_source: "volunteer_page",
    };

    const { error: insertError } = await supabase.from("volunteer_applications").insert(payload);

    setSubmitting(false);

    if (insertError) {
      setError("We could not save your application. Please try again or contact us directly.");
      return;
    }

    setSent(true);
    trackEvent("volunteer_application_submitted", { program: payload.program, country: payload.country });
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "volunteer application",
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        program: payload.program,
        source: payload.lead_source,
        message: payload.motivation,
      }),
    });
    router.push(`/thank-you?type=volunteer${payload.program ? `&program=${encodeURIComponent(payload.program)}` : ""}`);
  }

  return (
    <main className="bg-black text-white min-h-screen">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-6 md:px-24 py-28 overflow-hidden">
        <img
          src="/images/travel/trail-team.jpg"
          alt="Volunteer Uganda"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-5xl">
          <a href="/" className="text-yellow-500">← Back Home</a>

          <h1 className="text-5xl md:text-7xl font-black mt-10 mb-6">
            Volunteer with Purpose
          </h1>

          <p className="text-gray-300 max-w-2xl mb-8">
            Join structured volunteer programs in Uganda with the option
            to extend into gorilla trekking and Rwenzori expeditions.
          </p>

          <a
            href="#apply"
            className="bg-yellow-500 text-black px-8 py-4 rounded-full font-bold"
          >
            Apply Now
          </a>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-24 px-6 md:px-24">
        <h2 className="text-4xl font-black mb-10">Programs</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((p) => (
            <div key={p.title} className="border border-white/10 p-6 rounded-2xl">
              <img src={p.image} alt={p.title} className="h-40 w-full object-cover rounded-xl mb-4" />
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="text-yellow-500">{p.duration}</p>
              <p className="text-gray-400 mb-4">{p.desc}</p>
              <p className="font-bold">{p.price}</p>

              <ul className="text-sm mt-4 space-y-1">
                {p.includes.map((i) => (
                  <li key={i}>✓ {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="py-24 px-6 md:px-24 bg-[#050605]">
        <div className="max-w-4xl">
          <h2 className="text-4xl font-black mb-6">
            Purpose first. Safari optional.
          </h2>

          <p className="text-gray-400 mb-8">
            Volunteer, then extend into gorilla trekking or mountain expeditions.
          </p>

          <a
            href="/tours"
            className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold"
          >
            Explore Safari Add-ons
          </a>
        </div>
      </section>

      {/* APPLY */}
      <section id="apply" className="py-24 px-6 md:px-24">
        <h2 className="text-4xl font-black mb-10">
          Apply for Program
        </h2>

        {sent ? (
          <div className="max-w-3xl rounded-3xl border border-yellow-500/40 bg-white/5 p-8">
            <h3 className="text-2xl font-black text-yellow-500 mb-3">Application received.</h3>
            <p className="text-gray-300">
              We will review your details and respond with program availability.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-3xl">
          <input required name="name" className="form-input" placeholder="Full name" />
          <input required name="email" type="email" className="form-input" placeholder="Email" />
          <input name="phone" className="form-input" placeholder="WhatsApp / phone" />
          <input name="country" className="form-input" placeholder="Country" />

          <select name="program" className="form-input">
            <option>Select Program</option>
            <option>Community Impact</option>
            <option>Conservation</option>
            <option>Volunteer + Gorilla</option>
          </select>

          <textarea name="motivation" className="form-input min-h-32" placeholder="Your motivation" />

          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="bg-yellow-500 text-black py-4 rounded-full font-bold disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Saving application..." : "Submit Application"}
          </button>
        </form>
        )}
      </section>

    </main>
  );
}
