import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { analyticsEventNames } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";
import { asRecord, cleanText, isAllowedBrowserOrigin, readJsonObject } from "@/lib/server-validation";
import type { Database } from "@/lib/supabase";

const allowedEvents = new Set<string>(analyticsEventNames);

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "analytics", limit: 120, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await readJsonObject(request);
  const eventName = cleanText(body?.event_name, 80);
  const pagePath = cleanText(body?.page_path, 300);
  const metadata = asRecord(body?.metadata);
  if (!allowedEvents.has(eventName) || !pagePath.startsWith("/")) {
    return NextResponse.json({ ok: false, reason: "Invalid analytics event." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
  const safeMetadata = Object.fromEntries(
    Object.entries(metadata).slice(0, 20).map(([name, value]) => [
      cleanText(name, 60),
      typeof value === "string" ? cleanText(value, 200) : value,
    ])
  );
  const { error } = await supabase.from("analytics_events").insert({
    event_name: eventName,
    page_path: pagePath,
    metadata: safeMetadata,
  });
  return NextResponse.json({ ok: !error }, { status: error ? 502 : 201 });
}
