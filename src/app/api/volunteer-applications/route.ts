import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { cleanMultilineText, cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";
import type { Database } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";

const programs = new Set(["Community Impact", "Conservation", "Volunteer + Gorilla"]);

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "volunteer_application", limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many applications. Please wait and try again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });

  const body = await readJsonObject(request);
  if (!body || cleanText(body.website, 200)) {
    return NextResponse.json({ ok: false, reason: "Invalid application." }, { status: 400 });
  }
  const turnstile = await verifyTurnstile(request, body.turnstile_token);
  if (!turnstile.ok) return NextResponse.json({ ok: false, reason: turnstile.reason }, { status: 403 });

  const payload = {
    id: randomUUID(),
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 160).toLowerCase(),
    phone: cleanText(body.phone, 80) || null,
    country: cleanText(body.country, 120) || null,
    program: cleanText(body.program, 120) || null,
    motivation: cleanMultilineText(body.motivation) || null,
    lead_source: "volunteer_page",
  };
  if (!payload.name || !isEmail(payload.email)) {
    return NextResponse.json({ ok: false, reason: "A valid name and email are required." }, { status: 400 });
  }
  if (payload.program && !programs.has(payload.program)) {
    return NextResponse.json({ ok: false, reason: "Selected program is not available." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: "Applications are temporarily unavailable." }, { status: 503 });

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("volunteer_applications").insert(payload);
  if (error) return NextResponse.json({ ok: false, reason: "We could not save your application." }, { status: 502 });
  return NextResponse.json({ ok: true, id: payload.id }, { status: 201, headers: rateLimitHeaders(limit) });
}
