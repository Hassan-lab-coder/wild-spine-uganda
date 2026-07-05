import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import {
  cleanMultilineText,
  cleanText,
  isAllowedBrowserOrigin,
  isEmail,
  readJsonObject,
} from "@/lib/server-validation";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const allowedRoutes = new Set([
  "The Spine Explorer",
  "The Summit Trail",
  "Margherita Expedition",
  "Gorilla Permit Help",
  "Corporate Retreat",
  "Conservation Membership",
  "Custom Uganda Safari",
  "Bwindi Gorilla Trekking",
  "Luxury Uganda Safari",
  "Rwenzori Hiking Tour",
]);

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "itinerary_request", limit: 6, windowMs: 10 * 60 * 1000 });

  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many requests. Please wait a few minutes and try again." },
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
  if (cleanText(body.website, 200)) {
    return NextResponse.json({ ok: false, reason: "Invalid request." }, { status: 400 });
  }
  const turnstile = await verifyTurnstile(request, body.turnstile_token);
  if (!turnstile.ok) return NextResponse.json({ ok: false, reason: turnstile.reason }, { status: 403 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseWriteKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseWriteKey) {
    return NextResponse.json({ ok: false, reason: "Supabase is not configured on this deployment." }, { status: 500 });
  }

  const leadId = randomUUID();
  const payload = {
    id: leadId,
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 160).toLowerCase(),
    phone: cleanText(body.phone, 80) || null,
    country: cleanText(body.country, 120) || null,
    travel_month: cleanText(body.travel_month, 80) || null,
    route: cleanText(body.route, 120) || null,
    message: cleanMultilineText(body.message) || null,
    lead_source: cleanText(body.lead_source, 120) || "website",
    status: "new",
  };

  if (!payload.name) {
    return NextResponse.json({ ok: false, reason: "Full name is required." }, { status: 400 });
  }

  if (!isEmail(payload.email)) {
    return NextResponse.json({ ok: false, reason: "A valid email address is required." }, { status: 400 });
  }

  if (payload.route && !allowedRoutes.has(payload.route)) {
    return NextResponse.json({ ok: false, reason: "Selected route is not available." }, { status: 400 });
  }

  const supabase = createClient<Database>(
    supabaseUrl,
    supabaseWriteKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const { error } = await supabase.from("itinerary_requests").insert(payload);

  if (error) {
    console.warn("Itinerary request was not saved:", error.message);
    return NextResponse.json(
      { ok: false, reason: "We could not save your request. Please try again or contact us on WhatsApp." },
      { status: 502 }
    );
  }

  await scheduleLeadAutomation(leadId, payload.lead_source, payload.route);

  const leadType = cleanText(body.lead_type, 80) || "itinerary request";

  await notifyLead(request, {
    type: leadType,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    country: payload.country,
    route: payload.route,
    travelMonth: payload.travel_month,
    source: payload.lead_source,
    message: payload.message,
  });

  return NextResponse.json({ ok: true, id: leadId }, { headers: rateLimitHeaders(limit) });
}

async function notifyLead(request: Request, body: Record<string, unknown>) {
  try {
    const url = new URL("/api/notify-lead", request.url);
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: new URL(request.url).origin,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Lead capture is the critical path; email notification should not block it.
  }
}

async function scheduleLeadAutomation(
  leadId: string,
  source: string,
  route: string | null
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return;
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
  const now = Date.now();
  const rows = [
    {
      lead_id: leadId,
      lead_table: "itinerary_requests",
      event_type: "instant_acknowledgement",
      scheduled_for: new Date(now).toISOString(),
      metadata: { source, route },
    },
    {
      lead_id: leadId,
      lead_table: "itinerary_requests",
      event_type: "planning_follow_up_24h",
      scheduled_for: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      metadata: { source, route },
    },
    {
      lead_id: leadId,
      lead_table: "itinerary_requests",
      event_type: "permit_urgency_follow_up_72h",
      scheduled_for: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
      metadata: { source, route },
    },
  ];

  await supabase.from("email_automation_events").insert(rows);
}
