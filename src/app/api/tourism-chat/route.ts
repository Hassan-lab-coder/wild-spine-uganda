import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  asRecord,
  cleanMultilineText,
  cleanText,
  isAllowedBrowserOrigin,
  isEmail,
  readJsonObject,
} from "@/lib/server-validation";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type LeadPayload = {
  name: string;
  email: string;
  country: string | null;
  travel_month: string | null;
  travelers: number | null;
  preferred_tour: string | null;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const allowedTours = new Set([
  "Bwindi Gorilla Trekking",
  "The Spine Explorer",
  "The Summit Trail",
  "Margherita Expedition",
  "Luxury Uganda Safari",
  "Gorilla Permit Help",
  "Corporate Retreat",
  "Conservation Membership",
  "Custom Uganda Safari",
]);

const bookingIntentPattern =
  /\b(book|booking|reserve|reservation|availability|available|quote|proposal|invoice|deposit|hold|confirm|call me|email me|whatsapp|speak with|talk to|ready to plan|start planning|send itinerary)\b/i;

const permitPricePattern =
  /\b(permit|permits)\b[\s\S]{0,600}\b(price|prices|cost|costs|fee|fees|how much|rate|rates)\b|\b(price|prices|cost|costs|fee|fees|how much|rate|rates)\b[\s\S]{0,600}\b(permit|permits)\b/i;

const feeAmountPattern = /(?:USD|US\$|\$)\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:USD|US dollars|dollars)\b/i;

export async function POST(request: Request) {
  const limit = rateLimit(request, { key: "tourism_chat", limit: 18, windowMs: 10 * 60 * 1000 });

  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many chat requests. Please wait a few minutes and try again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });
  }

  const body = await readJsonObject(request);

  if (!body) {
    return NextResponse.json({ ok: false, reason: "Invalid JSON payload." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, reason: "Wildspine Chatbot is temporarily in WhatsApp handoff mode." },
      { status: 500, headers: rateLimitHeaders(limit) }
    );
  }

  const message = cleanMultilineText(body.message, 1800);

  if (!message) {
    return NextResponse.json({ ok: false, reason: "A message is required." }, { status: 400 });
  }

  const pagePath = cleanText(body.pagePath, 300) || referrerPath(request) || "/";
  const history = readMessages(body.messages);
  const conversationId = validUuid(cleanText(body.conversationId, 80)) || randomUUID();
  let lead: LeadPayload | null;

  try {
    lead = readLead(body.lead);
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : "Lead details are invalid." },
      { status: 400, headers: rateLimitHeaders(limit) }
    );
  }
  const bookingIntent = Boolean(lead) || bookingIntentPattern.test(message);
  const supabase = createServerSupabase();

  if (supabase) {
    await upsertConversation(supabase, conversationId, pagePath, bookingIntent, request);
    await insertMessage(supabase, conversationId, "user", message, {
      page_path: pagePath,
      lead_included: Boolean(lead),
    });
  }

  let leadCaptured = false;

  if (lead) {
    if (!supabase) {
      return NextResponse.json(
        { ok: false, reason: "Supabase is not configured for lead capture." },
        { status: 500, headers: rateLimitHeaders(limit) }
      );
    }

    const result = await saveLead(supabase, conversationId, pagePath, lead, history, message);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, reason: result.reason },
        { status: 502, headers: rateLimitHeaders(limit) }
      );
    }

    leadCaptured = true;
    await notifyLead(request, lead, conversationId);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  let openAiResponse: Response;

  try {
    openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.45,
        max_tokens: 650,
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "system", content: requestContext({ lead, pagePath, bookingIntent, message }) },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });
  } catch (error) {
    console.warn("OpenAI chat request failed:", error instanceof Error ? error.message : "request failed");
    return NextResponse.json(
      { ok: false, reason: "Wildspine Chatbot could not reply right now." },
      { status: 502, headers: rateLimitHeaders(limit) }
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await openAiResponse.json().catch(() => null) as OpenAIChatResponse | null;

  if (!openAiResponse.ok) {
    console.warn("OpenAI chat request failed:", data?.error?.message || openAiResponse.statusText);
    return NextResponse.json(
      { ok: false, reason: "Wildspine Chatbot could not reply right now." },
      { status: 502, headers: rateLimitHeaders(limit) }
    );
  }

  const rawReply = cleanMultilineText(data?.choices?.[0]?.message?.content, 2500);
  const reply = enforcePermitPriceRule(rawReply || fallbackReply(), message);

  if (supabase) {
    await insertMessage(supabase, conversationId, "assistant", reply, {
      booking_intent: bookingIntent,
      lead_captured: leadCaptured,
    });
    await upsertConversation(supabase, conversationId, pagePath, bookingIntent, request);
  }

  return NextResponse.json(
    {
      ok: true,
      conversationId,
      reply,
      bookingIntent,
      leadCaptured,
    },
    { headers: rateLimitHeaders(limit) }
  );
}

function systemPrompt() {
  const knowledge = cleanMultilineText(process.env.WILD_SPINE_CHAT_KNOWLEDGE, 7000);
  const permitKnowledgeNote = hasConfiguredPermitPrices()
    ? "Configured knowledge may include current permit or fee details. Use only those configured details when discussing exact fees."
    : "No exact permit or government fee prices are configured. Do not provide numeric permit, park, visa, or government fee amounts.";

  return `You are Wildspine Chatbot, the AI tourism concierge for Wild Spine Uganda, a premium Uganda travel company.

Brand voice:
- Professional, warm, calm, expert, trustworthy, and conversion-focused.
- Sound like a senior Uganda travel planner, not a generic chatbot.
- Be concise, practical, and reassuring.

Specialties:
- Gorilla trekking in Bwindi and Mgahinga.
- Rwenzori hiking, Margherita Peak preparation, trekking fitness, and packing.
- Uganda safaris, route design, lodge levels, transfers, travel seasons, permits, safety, visas, and booking guidance.
- Wild Spine Uganda tours including The Spine Explorer, The Summit Trail, Margherita Expedition, Gorilla Permit Help, Luxury Uganda Safari, Corporate Retreats, Conservation Membership, and custom Uganda journeys.

Rules:
- Ask clarifying questions before recommending a package. Prioritize travel month or dates, number of travelers, trip duration, fitness or mobility needs, comfort level, interests, and whether gorilla trekking is essential.
- Recommend Wild Spine Uganda tours naturally when they fit the traveler's goals. Do not force a tour if more context is needed.
- Encourage the traveler to speak with the Wild Spine Uganda team for final booking confirmation, live availability, exact routing, lodge holds, and permits.
- Never invent exact permit prices, park fees, visa fees, lodge rates, or government fees unless they are present in the configured knowledge base.
- ${permitKnowledgeNote}
- If asked for exact fees that are not configured, explain that official fees can change and the team will confirm current amounts before booking.
- Avoid medical, legal, or immigration guarantees. Offer general planning guidance and suggest official sources or professional advice for final decisions.
- Do not promise wildlife sightings, weather outcomes, border decisions, medical safety, or permit availability.
- Keep responses conversion-aware: helpful first, then invite the traveler to share details or continue with the Wild Spine team.
- If the traveler shows booking intent, invite them to share contact details or continue on WhatsApp.

Configured knowledge base:
${knowledge || "No deployment-specific knowledge base has been configured."}`;
}

function requestContext(input: {
  lead: LeadPayload | null;
  pagePath: string;
  bookingIntent: boolean;
  message: string;
}) {
  const parts = [
    `Current date: ${new Date().toISOString().slice(0, 10)}`,
    `Current site path: ${input.pagePath}`,
    `Booking intent detected: ${input.bookingIntent ? "yes" : "no"}`,
  ];

  if (input.lead) {
    parts.push(
      "Traveler lead details:",
      `Name: ${input.lead.name}`,
      `Email: ${input.lead.email}`,
      `Country: ${input.lead.country || "not provided"}`,
      `Travel month: ${input.lead.travel_month || "not provided"}`,
      `Travelers: ${input.lead.travelers ?? "not provided"}`,
      `Preferred tour: ${input.lead.preferred_tour || "not provided"}`
    );
  }

  if (permitPricePattern.test(input.message) && !hasConfiguredPermitPrices()) {
    parts.push("The traveler asked about permit pricing. Do not include numeric fee amounts because no configured permit pricing exists.");
  }

  return parts.join("\n");
}

function readMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asRecord(item))
    .map((item) => {
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const content = cleanMultilineText(item.content, 1400);
      return role && content ? { role, content } : null;
    })
    .filter((item): item is ChatMessage => Boolean(item))
    .slice(-8);
}

function readLead(value: unknown): LeadPayload | null {
  const record = asRecord(value);

  if (Object.keys(record).length === 0) {
    return null;
  }

  const name = cleanText(record.name, 120);
  const email = cleanText(record.email, 160).toLowerCase();
  const country = cleanText(record.country, 120) || null;
  const travelMonth = cleanText(record.travelMonth, 80) || cleanText(record.travel_month, 80) || null;
  const travelers = parseTravelers(record.travelers);
  const preferredTour = cleanText(record.preferredTour, 120) || cleanText(record.preferred_tour, 120) || null;

  if (!name) {
    throw new Error("Full name is required for lead capture.");
  }

  if (!isEmail(email)) {
    throw new Error("A valid email address is required for lead capture.");
  }

  if (preferredTour && !allowedTours.has(preferredTour)) {
    throw new Error("Selected tour is not available.");
  }

  return {
    name,
    email,
    country,
    travel_month: travelMonth,
    travelers,
    preferred_tour: preferredTour,
  };
}

function parseTravelers(value: unknown) {
  const number = typeof value === "number" ? value : Number(cleanText(value, 10));

  if (!Number.isFinite(number)) {
    return null;
  }

  const travelers = Math.trunc(number);
  return travelers >= 1 && travelers <= 99 ? travelers : null;
}

function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseWriteKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseWriteKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseWriteKey, {
    auth: {
      persistSession: false,
    },
  });
}

async function upsertConversation(
  supabase: ReturnType<typeof createClient<Database>>,
  conversationId: string,
  pagePath: string,
  bookingIntent: boolean,
  request: Request
) {
  const metadata = {
    user_agent: request.headers.get("user-agent"),
  };
  const { data: existing, error: lookupError } = await supabase
    .from("chatbot_conversations")
    .select("booking_intent,status")
    .eq("id", conversationId)
    .maybeSingle();

  if (lookupError) {
    console.warn("Chat conversation lookup failed:", lookupError.message);
  }

  const payload = {
    page_path: pagePath,
    booking_intent: Boolean(existing?.booking_intent || bookingIntent),
    status: existing?.status || "open",
    last_message_at: new Date().toISOString(),
    metadata,
  };
  const { error } = existing
    ? await supabase
      .from("chatbot_conversations")
      .update(payload)
      .eq("id", conversationId)
    : await supabase.from("chatbot_conversations").insert({
      id: conversationId,
      ...payload,
    });

  if (error) {
    console.warn("Chat conversation was not saved:", error.message);
  }
}

async function insertMessage(
  supabase: ReturnType<typeof createClient<Database>>,
  conversationId: string,
  role: ChatRole,
  content: string,
  metadata: Record<string, unknown>
) {
  const { error } = await supabase.from("chatbot_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    metadata,
  });

  if (error) {
    console.warn("Chat message was not saved:", error.message);
  }
}

async function saveLead(
  supabase: ReturnType<typeof createClient<Database>>,
  conversationId: string,
  pagePath: string,
  lead: LeadPayload,
  history: ChatMessage[],
  latestMessage: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const transcript = [...history, { role: "user" as const, content: latestMessage }]
    .slice(-10)
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");

  const { error } = await supabase.from("chatbot_leads").upsert(
    {
      conversation_id: conversationId,
      name: lead.name,
      email: lead.email,
      country: lead.country,
      travel_month: lead.travel_month,
      travelers: lead.travelers,
      preferred_tour: lead.preferred_tour,
      lead_source: "ai_chat",
      page_path: pagePath,
      booking_intent: true,
      transcript_summary: transcript || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id" }
  );

  if (error) {
    console.warn("AI chat lead was not saved:", error.message);
    return { ok: false, reason: "We could not save your details. Please try again or contact us on WhatsApp." };
  }

  return { ok: true };
}

async function notifyLead(request: Request, lead: LeadPayload, conversationId: string) {
  try {
    const url = new URL("/api/notify-lead", request.url);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: new URL(request.url).origin,
      },
      body: JSON.stringify({
        type: "AI chat lead",
        name: lead.name,
        email: lead.email,
        country: lead.country,
        route: lead.preferred_tour,
        travelMonth: lead.travel_month,
        message: [
          `Travelers: ${lead.travelers ?? "Not provided"}`,
          `Preferred tour: ${lead.preferred_tour || "Not provided"}`,
          `Conversation ID: ${conversationId}`,
        ].join("\n"),
      }),
    });
  } catch {
    // Chat lead capture should survive notification provider downtime.
  }
}

function enforcePermitPriceRule(reply: string, userMessage: string) {
  if (hasConfiguredPermitPrices()) {
    return reply;
  }

  const userAskedPermitPrice = permitPricePattern.test(userMessage);
  const replyHasPermitFee = /\b(permit|permits)\b[\s\S]{0,240}(price|prices|cost|costs|fee|fees|rate|rates)?[\s\S]{0,240}(?:USD|US\$|\$|\bdollars\b)/i.test(reply);
  const containsLikelyPrice = feeAmountPattern.test(reply);

  if (!containsLikelyPrice || (!userAskedPermitPrice && !replyHasPermitFee)) {
    return reply;
  }

  return "I cannot quote an exact gorilla permit fee from here because Wild Spine has not configured current permit pricing in the concierge knowledge base. Official fees can change by traveler category, park, season, and policy updates. Share your travel month, nationality or residency status, and number of travelers, and the Wild Spine Uganda team can confirm current official permit costs before you book.";
}

function hasConfiguredPermitPrices() {
  const knowledge = process.env.WILD_SPINE_CHAT_KNOWLEDGE || "";
  return /\b(permit|permits)\b[\s\S]{0,240}(?:USD|US\$|\$|\bdollars\b)/i.test(knowledge) && feeAmountPattern.test(knowledge);
}

function fallbackReply() {
  return "I can help with that. To guide you properly, please share your travel month, number of travelers, trip length, comfort level, and whether gorilla trekking is essential. For final availability, permits, and booking confirmation, the Wild Spine Uganda team will verify the details with you.";
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : "";
}

function referrerPath(request: Request) {
  const referrer = request.headers.get("referer");

  if (!referrer) {
    return "";
  }

  try {
    return new URL(referrer).pathname;
  } catch {
    return "";
  }
}
