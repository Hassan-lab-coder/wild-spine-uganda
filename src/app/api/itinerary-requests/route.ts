import { createClient } from "@supabase/supabase-js";
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
  const limit = rateLimit(request, { key: "itinerary_request", limit: 6, windowMs: 10 * 60 * 1000 });

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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: false, reason: "Supabase is not configured on this deployment." }, { status: 500 });
  }

  const payload = {
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
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from("itinerary_requests")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 502 });
  }

  await scheduleLeadAutomation(data.id, payload.lead_source, payload.route);

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

  return NextResponse.json({ ok: true, id: data.id }, { headers: rateLimitHeaders(limit) });
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
