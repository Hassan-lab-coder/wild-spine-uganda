"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function Guide() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/guide-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        source: "guide",
      }),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean; reason?: string } | null;

    setSubmitting(false);

    if (!response.ok || !result?.ok) {
      setError(result?.reason || "We could not save your email. Please try again.");
      return;
    }

    setUnlocked(true);
    trackEvent("guide_download_unlocked");
  }

  return (
    <main className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-6 py-28 text-center">
      <h1 className="text-4xl md:text-6xl font-black mb-6">
        Plan Uganda with confidence.
      </h1>

      <p className="text-gray-400 max-w-xl mb-10">
        Get a practical field guide for gorilla trekking Uganda, Bwindi permit timing,
        Rwenzori mountains hiking, and private safari planning, written for travelers who want the magic without the uncertainty.
      </p>

      {/* FORM */}
      {!unlocked && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Email address"
            className="px-4 py-3 rounded bg-white/10 border border-white/20 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-500 text-black py-3 rounded-full font-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70 transition"
          >
            {submitting ? "Preparing your guide..." : "Send Me the Uganda Planning Guide"}
          </button>

          {error && <p className="text-sm text-red-300">{error}</p>}
        </form>
      )}

      {/* DOWNLOAD */}
      {unlocked && (
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/guide.pdf"
            download
            className="bg-green-500 px-6 py-3 rounded-full font-black hover:scale-105 transition"
          >
            Download the Planning Guide
          </a>
          <a
            href="/"
            className="border border-white/20 px-6 py-3 rounded-full font-black hover:bg-white hover:text-black transition"
          >
            Return Home
          </a>
          <a
            href="/#book"
            className="bg-yellow-500 text-black px-6 py-3 rounded-full font-black hover:bg-yellow-400 transition"
          >
            Start My Private Uganda Plan
          </a>
        </div>
      )}

    </main>
  );
}
