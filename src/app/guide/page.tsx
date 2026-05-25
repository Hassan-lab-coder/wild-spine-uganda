"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
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

    const { error: insertError } = await supabase.from("guide_leads").insert({
      email: email.trim(),
      source: "guide",
    });

    setSubmitting(false);

    if (insertError && insertError.code !== "23505") {
      setError("We could not save your email. Please try again.");
      return;
    }

    setUnlocked(true);
    trackEvent("guide_download_unlocked");
    fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "guide download",
        email: email.trim(),
        message: "A traveler unlocked the Uganda travel guide.",
      }),
    });
  }

  return (
    <main className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-6 py-28 text-center">
      {/* TITLE */}
      <h1 className="text-4xl md:text-6xl font-black mb-6">
        Uganda Travel Guide
      </h1>

      <p className="text-gray-400 max-w-xl mb-10">
        Learn how to plan your gorilla trek, Rwenzori expedition, and luxury safari experience.
        This guide gives you real insight most tourists never get.
      </p>

      {/* FORM */}
      {!unlocked && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            placeholder="Enter your email"
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
            {submitting ? "Saving..." : "Get Free Guide"}
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
            Download Guide PDF
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
            Plan My Trip
          </a>
        </div>
      )}

    </main>
  );
}
