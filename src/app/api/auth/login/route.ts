import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "admin_login", limit: 6, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many sign-in attempts. Please wait before trying again." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });

  const body = await readJsonObject(request);
  const email = cleanText(body?.email, 160).toLowerCase();
  const password = typeof body?.password === "string" ? body.password.slice(0, 300) : "";
  if (!isEmail(email) || !password) return NextResponse.json({ ok: false, reason: "Email and password are required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: "Sign-in is temporarily unavailable." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ ok: false, reason: "Email or password is incorrect." }, { status: 401, headers: rateLimitHeaders(limit) });
  }
  return NextResponse.json(
    {
      ok: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    },
    { headers: rateLimitHeaders(limit) }
  );
}

