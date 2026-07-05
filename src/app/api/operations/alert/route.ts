import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { asRecord, bearerToken, cleanText, readJsonObject } from "@/lib/server-validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "operational_alert_receiver", limit: 30, windowMs: 60_000 });
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  const expected = process.env.ALERT_WEBHOOK_SECRET || "";
  const received = bearerToken(request) || new URL(request.url).searchParams.get("token") || "";
  if (!expected || !secureEqual(expected, received)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await readJsonObject(request);
  const event = cleanText(body?.event, 120);
  const timestamp = cleanText(body?.timestamp, 80) || new Date().toISOString();
  const context = asRecord(body?.context);
  if (!event) return NextResponse.json({ ok: false, reason: "Event is required." }, { status: 400 });

  const resendKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!resendKey || !recipient) {
    return NextResponse.json({ ok: false, reason: "Alert email is not configured." }, { status: 503 });
  }

  const safeContext = Object.fromEntries(
    Object.entries(context).slice(0, 20).map(([key, value]) => [
      cleanText(key, 80),
      typeof value === "string" ? cleanText(value, 300) : value,
    ])
  );
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFICATION_FROM || "Wild Spine <onboarding@resend.dev>",
      to: recipient,
      subject: `[Wild Spine alert] ${event}`,
      text: [`Event: ${event}`, `Time: ${timestamp}`, "", JSON.stringify(safeContext, null, 2)].join("\n"),
    }),
  });
  if (!response.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}

function secureEqual(expected: string, received: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  return left.length === right.length && timingSafeEqual(left, right);
}
