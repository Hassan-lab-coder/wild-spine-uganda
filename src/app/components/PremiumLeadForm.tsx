"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
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
  budgetOptions = ["Under $1,500", "$1,500 - $3,000", "$3,000 - $6,000", "$6,000+", "Not sure yet"],
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
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
      country: String(form.get("country") || "").trim() || null,
      travel_month: String(form.get("travel_month") || "").trim() || null,
      route: route === routePlaceholder ? null : route,
      message: message || null,
      lead_source: leadSource,
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
      <div className="mb-7">
        <h3 className="text-2xl font-black">{title}</h3>
        <p className="mt-2 leading-7 text-[#68746a]">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" className="form-input" placeholder="Full name" />
        <input required name="email" type="email" className="form-input" placeholder="Email address" />
        <input name="phone" className="form-input" placeholder="WhatsApp / phone" />
        <input name="country" className="form-input" placeholder="Country of residence" />
        <input name="organization" className="form-input" placeholder="Company / organization" />
        <input name="travel_month" className="form-input" placeholder="Preferred timing" />
        <input name="group_size" className="form-input" placeholder="Travelers / members" />
        <select name="budget_range" className="form-input">
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

        <input name="goal" className="form-input sm:col-span-2" placeholder="What should this journey achieve?" />
        <textarea name="message" className="form-input min-h-32 sm:col-span-2" placeholder="Share the context, dates, concerns, and what would make this feel exceptional..." />
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="mt-6 w-full rounded-full bg-[#f5b416] py-4 font-black text-black transition hover:bg-[#ffd766] disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? "Saving request..." : cta}
      </button>
    </form>
  );
}
