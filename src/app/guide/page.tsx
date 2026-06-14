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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitting(false);
      setError("Please enter a valid email address.");
      return;
    }

    const response = await fetch("/api/guide-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        source: "gorilla-trekking-guide-2026",
      }),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean; reason?: string } | null;

    setSubmitting(false);

    if (!response.ok || !result?.ok) {
      setError(result?.reason || "We could not save your email. Please try again.");
      return;
    }

    setUnlocked(true);
    trackEvent("guide_download_unlocked", { guide: "gorilla-trekking-2026" });
  }

  return (
    <main className="bg-black text-white min-h-screen flex flex-col justify-center items-center px-6 py-28 text-center">
      <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-yellow-400">
        Free PDF guide
      </p>

      <h1 className="text-4xl md:text-6xl font-black mb-6">
        Gorilla Trekking Guide 2026
      </h1>

      <p className="text-gray-400 max-w-xl mb-10">
        Enter your email to unlock the Wild Spine Uganda PDF for Bwindi gorilla
        trekking, permit timing, safety basics, packing notes, and private journey planning.
      </p>

      <div className="mb-8 grid w-full max-w-3xl gap-3 text-left md:grid-cols-3">
        {[
          ["Instant guide access", "Download the PDF immediately after submitting your email."],
          ["48-hour follow-up", "We prepare a practical follow-up for permit timing and route questions."],
          ["Private planning path", "You can request a gorilla trek plan when you are ready."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-black text-yellow-400">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
          </div>
        ))}
      </div>

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
            {submitting ? "Preparing your guide..." : "Get the Free Gorilla Guide"}
          </button>

          <p className="text-xs leading-5 text-gray-500">
            We will send practical follow-up guidance about permits and private planning. You can ask us to stop at any time.
          </p>

          {error && <p className="text-sm text-red-300">{error}</p>}
        </form>
      )}

      {/* DOWNLOAD */}
      {unlocked && (
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/guide.pdf"
            download="wild-spine-uganda-gorilla-trekking-guide-2026.pdf"
            onClick={() => trackEvent("guide_pdf_download_clicked", { guide: "gorilla-trekking-2026" })}
            className="bg-green-500 px-6 py-3 rounded-full font-black hover:scale-105 transition"
          >
            Download the PDF Guide
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
            Request a Private Gorilla Plan
          </a>
        </div>
      )}

    </main>
  );
}
