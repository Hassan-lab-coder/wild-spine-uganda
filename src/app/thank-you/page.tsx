"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function ThankYouPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white" />}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "request";
  const route = searchParams.get("route");
  const program = searchParams.get("program");

  useEffect(() => {
    trackEvent("thank_you_viewed", {
      type,
      route,
      program,
      source: searchParams.get("source"),
    });
  }, [program, route, searchParams, type]);

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white md:px-24">
      <section className="mx-auto max-w-5xl">
        <p className="section-kicker">Request received</p>
        <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
          We have your details.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-gray-300">
          Thank you for reaching out to Wild Spine Uganda. We will review your timing,
          route interests, and contact details before replying with realistic next steps.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["1", "We check availability", route || program || "Your request is reviewed against real route, permit, and logistics availability."],
            ["2", "We reply clearly", "You receive guidance on timing, comfort level, pricing, and practical next steps."],
            ["3", "You choose the pace", "Continue by email, WhatsApp, or a private planning call."],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                {step}
              </div>
              <h2 className="mb-3 text-xl font-black">{title}</h2>
              <p className="leading-7 text-gray-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a href="https://wa.me/256751821745" target="_blank" rel="noopener noreferrer" className="rounded-full bg-yellow-500 px-8 py-4 text-center font-black text-black hover:bg-yellow-400">
            Continue on WhatsApp
          </a>
          <a href="/tours" className="rounded-full border border-white/20 px-8 py-4 text-center font-black hover:bg-white hover:text-black">
            Explore Tours
          </a>
          <a href="/guide" className="rounded-full border border-white/20 px-8 py-4 text-center font-black hover:bg-white hover:text-black">
            Get Travel Guide
          </a>
        </div>
      </section>
    </main>
  );
}
