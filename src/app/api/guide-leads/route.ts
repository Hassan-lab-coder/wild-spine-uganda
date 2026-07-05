import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "guide_lead", limit: 8, windowMs: 10 * 60 * 1000 });

  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many guide requests. Please wait a few minutes and try again." },
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
  if (cleanText(body.website, 200)) return NextResponse.json({ ok: false, reason: "Invalid request." }, { status: 400 });
  const turnstile = await verifyTurnstile(request, body.turnstile_token);
  if (!turnstile.ok) return NextResponse.json({ ok: false, reason: turnstile.reason }, { status: 403 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseWriteKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseWriteKey) {
    return NextResponse.json({ ok: false, reason: "Supabase is not configured on this deployment." }, { status: 500 });
  }

  const email = cleanText(body.email, 160).toLowerCase();
  const source = cleanText(body.source, 80) || "guide";

  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, reason: "A valid email address is required." }, { status: 400 });
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

  const leadId = randomUUID();
  const { error } = await supabase.from("guide_leads").insert({
    id: leadId,
    email,
    source,
  });

  if (error && error.code !== "23505") {
    console.warn("Guide lead was not saved:", error.message);
    return NextResponse.json(
      { ok: false, reason: "We could not save your request. Please try again or contact us on WhatsApp." },
      { status: 502 }
    );
  }

  if (!error) await scheduleGuideAutomation(leadId, source);

  await notifyLead(request, {
    type: "guide download",
    email,
    message: "A traveler unlocked the Gorilla Trekking Guide 2026.",
  });

  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(limit) });
}

async function scheduleGuideAutomation(leadId: string, source: string) {
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

  await supabase.from("email_automation_events").insert([
    {
      lead_id: leadId,
      lead_table: "guide_leads",
      event_type: "guide_delivery",
      scheduled_for: new Date().toISOString(),
      metadata: { source },
    },
    {
      lead_id: leadId,
      lead_table: "guide_leads",
      event_type: "guide_follow_up_48h",
      scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      metadata: { source },
    },
  ]);
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
    // The PDF unlock should survive notification provider downtime.
  }
}
