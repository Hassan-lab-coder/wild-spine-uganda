"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type LeadForm = {
  name: string;
  email: string;
  country: string;
  travelMonth: string;
  travelers: string;
  preferredTour: string;
};

type ChatResponse =
  | {
      ok: true;
      conversationId: string;
      reply: string;
      bookingIntent: boolean;
      leadCaptured: boolean;
    }
  | {
      ok: false;
      reason: string;
    };

const hiddenRoutes = new Set(["/admin", "/login", "/reset-password"]);
const storageKey = "wild-spine-ai-concierge-conversation";

const starterPrompts = [
  "I want to plan gorilla trekking in Bwindi.",
  "What should I pack for Rwenzori?",
  "When is the best month for Uganda safaris?",
] as const;

const preferredTours = [
  "Bwindi Gorilla Trekking",
  "The Spine Explorer",
  "The Summit Trail",
  "Margherita Expedition",
  "Luxury Uganda Safari",
  "Gorilla Permit Help",
  "Corporate Retreat",
  "Conservation Membership",
  "Custom Uganda Safari",
] as const;

function newMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello, I am the Wild Spine Uganda AI concierge. I can help with gorilla trekking, Bwindi and Mgahinga logistics, Rwenzori routes, safaris, packing, seasons, safety, permits, and the right planning path. What kind of Uganda journey are you considering?",
};

export default function TourismChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(storageKey) || "";
  });
  const [loading, setLoading] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [bookingIntent, setBookingIntent] = useState(false);
  const [error, setError] = useState("");
  const [lead, setLead] = useState<LeadForm>({
    name: "",
    email: "",
    country: "",
    travelMonth: "",
    travelers: "",
    preferredTour: "",
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      window.localStorage.setItem(storageKey, conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, leadOpen]);

  const whatsappHref = useMemo(() => {
    const phone = process.env.NEXT_PUBLIC_WILD_SPINE_WHATSAPP_NUMBER || "256751828241";
    const details = [
      "Hello Wild Spine Uganda, I would like help planning a Uganda trip.",
      lead.name ? `Name: ${lead.name}` : "",
      lead.email ? `Email: ${lead.email}` : "",
      lead.country ? `Country: ${lead.country}` : "",
      lead.travelMonth ? `Travel month: ${lead.travelMonth}` : "",
      lead.travelers ? `Travelers: ${lead.travelers}` : "",
      lead.preferredTour ? `Preferred tour: ${lead.preferredTour}` : "",
    ].filter(Boolean);

    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(details.join("\n"))}`;
  }, [lead]);

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setInput("");
    setLoading(true);

    const userMessage = newMessage("user", trimmed);
    const visibleMessages = [...messages, userMessage];
    setMessages(visibleMessages);

    try {
      const result = await postChat({
        message: trimmed,
        conversationId,
        messages: messages.slice(-8),
        pagePath: pathname,
      });

      if (!result.ok) {
        throw new Error(result.reason);
      }

      setConversationId(result.conversationId);
      setBookingIntent((current) => current || result.bookingIntent);
      setLeadCaptured((current) => current || result.leadCaptured);
      setMessages((current) => [...current, newMessage("assistant", result.reply)]);

      trackEvent("ai_chat_message_sent", {
        page_path: pathname,
        booking_intent: result.bookingIntent,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "The concierge could not reply right now.";
      setError(reason);
      setBookingIntent(true);
      setMessages((current) => [
        ...current,
        newMessage(
          "assistant",
          "I am sorry, the AI concierge is unavailable for a moment. You can still contact the Wild Spine team on WhatsApp for fast planning help."
        ),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!lead.name.trim() || !lead.email.trim()) {
      setError("Please add your name and email so the team can follow up.");
      return;
    }

    setLeadSubmitting(true);
    const detailMessage = newMessage("user", "I shared my trip details with Wild Spine Uganda.");
    setMessages((current) => [...current, detailMessage]);

    try {
      const result = await postChat({
        message: "I would like Wild Spine Uganda to help plan my trip. Please acknowledge my details and tell me what you need next.",
        conversationId,
        messages: messages.slice(-8),
        pagePath: pathname,
        lead,
      });

      if (!result.ok) {
        throw new Error(result.reason);
      }

      if (!result.leadCaptured) {
        throw new Error("We could not save your details. Please try again or continue on WhatsApp.");
      }

      setConversationId(result.conversationId);
      setLeadCaptured(true);
      setBookingIntent(true);
      setLeadOpen(false);
      setMessages((current) => [...current, newMessage("assistant", result.reply)]);

      trackEvent("ai_chat_lead_captured", {
        page_path: pathname,
        preferred_tour: lead.preferredTour,
        country: lead.country,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "We could not save your details.";
      setError(reason);
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <div className={`fixed right-4 z-[90] sm:right-6 ${open ? "bottom-4" : "bottom-20 sm:bottom-24"}`}>
      {open ? (
        <section className="flex h-[min(720px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[1.5rem] border border-[#d8cda9] bg-[#fffaf0] text-[#123a2a] shadow-2xl sm:h-[680px]">
          <header className="border-b border-white/10 bg-[#123a2a] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#f5b416]">Wild Spine</p>
                <h2 className="mt-1 text-lg font-black">Uganda AI Concierge</h2>
                <p className="mt-1 text-xs leading-5 text-white/70">Expert planning support before you speak with the team.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-xl text-white/80 transition hover:border-[#f5b416] hover:text-[#f5b416]"
                aria-label="Close chat"
              >
                x
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "ml-auto bg-[#123a2a] text-white"
                      : "mr-auto border border-[#d8cda9] bg-white text-[#223f31]"
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto flex items-center gap-2 rounded-2xl border border-[#d8cda9] bg-white px-4 py-3 text-sm text-[#536257]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5b416]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5b416] [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5b416] [animation-delay:300ms]" />
                  <span className="sr-only">Concierge is typing</span>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="mt-4 grid gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-2xl border border-[#d8cda9] bg-white px-4 py-3 text-left text-sm font-bold text-[#123a2a] transition hover:border-[#f5b416] hover:bg-[#fff4cd]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {leadOpen && (
              <form onSubmit={submitLead} className="mt-4 rounded-2xl border border-[#d8cda9] bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <p className="text-sm font-black">Share trip details</p>
                  <p className="mt-1 text-xs leading-5 text-[#667268]">The Wild Spine team can use this to follow up with realistic next steps.</p>
                </div>

                <div className="grid gap-2">
                  <input
                    required
                    value={lead.name}
                    onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))}
                    className="form-input rounded-xl px-3 py-3 text-sm"
                    placeholder="Full name"
                  />
                  <input
                    required
                    type="email"
                    value={lead.email}
                    onChange={(event) => setLead((current) => ({ ...current, email: event.target.value }))}
                    className="form-input rounded-xl px-3 py-3 text-sm"
                    placeholder="Email address"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={lead.country}
                      onChange={(event) => setLead((current) => ({ ...current, country: event.target.value }))}
                      className="form-input rounded-xl px-3 py-3 text-sm"
                      placeholder="Country"
                    />
                    <input
                      value={lead.travelMonth}
                      onChange={(event) => setLead((current) => ({ ...current, travelMonth: event.target.value }))}
                      className="form-input rounded-xl px-3 py-3 text-sm"
                      placeholder="Travel month"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      min="1"
                      max="99"
                      type="number"
                      value={lead.travelers}
                      onChange={(event) => setLead((current) => ({ ...current, travelers: event.target.value }))}
                      className="form-input rounded-xl px-3 py-3 text-sm"
                      placeholder="Travelers"
                    />
                    <select
                      value={lead.preferredTour}
                      onChange={(event) => setLead((current) => ({ ...current, preferredTour: event.target.value }))}
                      className="form-input rounded-xl px-3 py-3 text-sm"
                    >
                      <option value="">Preferred tour</option>
                      {preferredTours.map((tour) => (
                        <option key={tour} value={tour}>
                          {tour}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="mt-3 w-full rounded-full bg-[#f5b416] px-4 py-3 text-sm font-black text-[#123a2a] transition hover:bg-[#ffd766] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {leadSubmitting ? "Saving details..." : "Send details"}
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-[#d8cda9] bg-white/90 p-4">
            {error && (
              <p className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </p>
            )}

            {(bookingIntent || leadCaptured) && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 block rounded-full bg-[#22c55e] px-4 py-3 text-center text-sm font-black text-[#08210f] transition hover:bg-[#4ade80]"
              >
                Continue with the team on WhatsApp
              </a>
            )}

            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setLeadOpen((current) => !current)}
                className="flex-1 rounded-full border border-[#d8cda9] px-4 py-3 text-sm font-black text-[#123a2a] transition hover:border-[#f5b416] hover:bg-[#fff4cd]"
              >
                {leadCaptured ? "Details saved" : leadOpen ? "Hide details" : "Share trip details"}
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="flex items-end gap-2"
            >
              <label className="sr-only" htmlFor="wild-spine-chat-message">
                Message Wild Spine AI concierge
              </label>
              <textarea
                id="wild-spine-chat-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-[#d8cda9] bg-[#fffaf0] px-4 py-3 text-sm outline-none transition placeholder:text-[#7b877d] focus:border-[#f5b416] focus:ring-4 focus:ring-[#f5b416]/10"
                placeholder="Ask about permits, seasons, packing..."
                rows={1}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#123a2a] text-sm font-black text-white transition hover:bg-[#1d563e] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-[#d8cda9] bg-[#123a2a] px-5 py-4 text-left text-white shadow-2xl transition hover:-translate-y-0.5 hover:border-[#f5b416]"
          aria-label="Open Wild Spine Uganda AI concierge"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5b416] text-sm font-black text-[#123a2a]">AI</span>
          <span className="min-w-0">
            <span className="block text-xs font-black uppercase tracking-[0.2em] text-[#f5b416]">Concierge</span>
            <span className="block truncate text-sm font-black">Ask Wild Spine</span>
          </span>
        </button>
      )}
    </div>
  );
}

async function postChat(payload: {
  message: string;
  conversationId: string;
  messages: ChatMessage[];
  pagePath: string;
  lead?: LeadForm;
}): Promise<ChatResponse> {
  const response = await fetch("/api/tourism-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null) as ChatResponse | null;

  if (!response.ok) {
    return {
      ok: false,
      reason: result && "reason" in result ? result.reason : "The concierge could not reply right now.",
    };
  }

  return result || { ok: false, reason: "The concierge returned an empty response." };
}
