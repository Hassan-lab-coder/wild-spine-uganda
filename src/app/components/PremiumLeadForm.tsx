"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import TurnstileField from "./TurnstileField";
import { submitItineraryLead } from "@/lib/lead-capture";

type PremiumLeadFormProps = {
  leadSource: string;
  type: string;
  title: string;
  subtitle: string;
  routeOptions: string[];
  routeLabel: string;
  routePlaceholder: string;
  cta: string;
  successType: string;
  budgetOptions?: string[];
};

export default function PremiumLeadForm({
  leadSource,
  type,
  title,
  subtitle,
  routeOptions,
  routeLabel,
  routePlaceholder,
  cta,
  successType,
  budgetOptions = ["$1,500 - $3,000", "$3,000 - $6,000", "$6,000+", "Not sure yet"],
}: PremiumLeadFormProps) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const route = String(form.get("route") || "");
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

    const messageParts = [
      ["Organization", String(form.get("organization") || "").trim()],
      ["Group size", String(form.get("group_size") || "").trim()],
      ["Budget range", String(form.get("budget_range") || "").trim()],
      ["Preferred timing", String(form.get("travel_month") || "").trim()],
      ["Primary goal", String(form.get("goal") || "").trim()],
      ["Message", String(form.get("message") || "").trim()],
    ];
    const message = messageParts
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");

    const payload = {
      name,
      email,
      phone: String(form.get("phone") || "").trim() || null,
      country: String(form.get("country") || "").trim() || null,
      travel_month: travelMonth || null,
      route: route === routePlaceholder ? null : route,
      message: message || null,
      lead_source: leadSource,
      website: String(form.get("website") || ""),
      turnstile_token: String(form.get("cf-turnstile-response") || ""),
    };

    const result = await submitItineraryLead({ ...payload, lead_type: type });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.reason || "We could not save your request. Please try again or contact us on WhatsApp.");
      return;
    }

    setSent(true);
    trackEvent("premium_lead_submitted", {
      type,
      route: payload.route,
      country: payload.country,
      source: leadSource,
    });
    router.push(`/thank-you?type=${encodeURIComponent(successType)}&source=${encodeURIComponent(leadSource)}${payload.route ? `&route=${encodeURIComponent(payload.route)}` : ""}`);
  }

  if (sent) {
    return (
      <div className="rounded-[2rem] border border-[#f5b416]/40 bg-white/90 p-8 text-[#123a2a] shadow-2xl">
        <h3 className="mb-3 text-3xl font-black text-[#b8860b]">Your request is in careful hands.</h3>
        <p className="leading-7 text-[#3d4a41]">
          We will review the details and respond with realistic next steps, timing, and a planning path you can trust.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/45 bg-white/92 p-7 text-[#123a2a] shadow-2xl backdrop-blur-sm md:p-8">
      <TurnstileField />
      <div className="mb-7">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="mt-2 leading-7 text-[#68746a]">{subtitle}</p>
      </div>

      <div className="mb-5 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-4">
        <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 1 - Your travel details</p>
        <p className="mt-2 text-sm leading-6 text-[#68746a]">Share who is traveling, how to reach you, and when Uganda is possible.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" aria-label="Full name" className="form-input" placeholder="Full name" />
        <input required name="email" type="email" aria-label="Email address" className="form-input" placeholder="Email address" />
        <input name="phone" aria-label="WhatsApp or phone number" className="form-input" placeholder="WhatsApp / phone" />
        <input name="country" aria-label="Country of residence" className="form-input" placeholder="Country of residence" />
        <input name="organization" aria-label="Company or organization" className="form-input" placeholder="Company / organization" />
        <input name="travel_month" aria-label="Preferred timing" className="form-input" placeholder="Preferred timing" />
        <input name="group_size" aria-label="Travelers or members" className="form-input" placeholder="Travelers / members" />
      </div>

      <div className="my-5 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-4">
        <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 2 - Your experience preference</p>
        <p className="mt-2 text-sm leading-6 text-[#68746a]">Help us understand route, budget, and what the trip must achieve.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <select name="budget_range" aria-label="Budget range" className="form-input">
          <option value="">Budget range</option>
          {budgetOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <label className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-bold text-[#3d4a41]">{routeLabel}</span>
          <select name="route" defaultValue={routePlaceholder} className="form-input">
            <option>{routePlaceholder}</option>
            {routeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <input name="goal" aria-label="Journey goal" className="form-input sm:col-span-2" placeholder="What should this journey achieve?" />
        <textarea name="message" aria-label="Additional context and concerns" className="form-input min-h-32 sm:col-span-2" placeholder="Share the context, dates, concerns, and what would make this feel exceptional..." />
      </div>

      <div className="mt-5 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/80 p-4">
        <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step 3 - Send your travel request</p>
        <p className="mt-2 text-sm leading-6 text-[#68746a]">
          We will respond with realistic next steps, timing, and planning questions within 24 hours.
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="mt-6 w-full rounded-full bg-[#f5b416] py-4 font-black text-black transition hover:bg-[#ffd766] disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? "Preparing your request..." : cta}
      </button>
    </form>
  );
}
