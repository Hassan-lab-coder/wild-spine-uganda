import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "admin_password_reset", limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "Too many reset requests." }, { status: 429, headers: rateLimitHeaders(limit) });
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await readJsonObject(request);
  const email = cleanText(body?.email, 160).toLowerCase();
  const redirectTo = cleanText(body?.redirect_to, 500);
  if (!isEmail(email)) return NextResponse.json({ ok: false, reason: "A valid email is required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: "Password reset is temporarily unavailable." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo || undefined });
  if (error) return NextResponse.json({ ok: false, reason: "Password reset could not be requested." }, { status: 502 });
  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(limit) });
}

