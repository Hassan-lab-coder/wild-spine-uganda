import { NextResponse } from "next/server";
import { cleanMultilineText, cleanText, isAllowedBrowserOrigin, readJsonObject } from "@/lib/server-validation";

type LeadPayload = {
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  route?: string;
  program?: string;
  country?: string;
  travelMonth?: string;
  message?: string;
};

export async function POST(request: Request) {
  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ sent: false, reason: "Origin is not allowed." }, { status: 403 });
  }

  const body = await readJsonObject(request);
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!body) {
    return NextResponse.json({ sent: false, reason: "Invalid JSON payload." }, { status: 400 });
  }

  if (!to || !resendKey) {
    return NextResponse.json({ sent: false, reason: "Email notifications are not configured." });
  }

  const payload: LeadPayload = {
    type: cleanText(body.type, 80) || "lead",
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 160),
    phone: cleanText(body.phone, 80),
    route: cleanText(body.route, 120),
    program: cleanText(body.program, 120),
    country: cleanText(body.country, 120),
    travelMonth: cleanText(body.travelMonth, 80),
    message: cleanMultilineText(body.message),
  };
  const subject = `New Wild Spine ${payload.type}: ${payload.name || payload.email || "Website inquiry"}`;
  const text = [
    `Type: ${payload.type}`,
    `Name: ${payload.name || "Not provided"}`,
    `Email: ${payload.email || "Not provided"}`,
    `Phone/WhatsApp: ${payload.phone || "Not provided"}`,
    `Country: ${payload.country || "Not provided"}`,
    `Route: ${payload.route || "Not provided"}`,
    `Program: ${payload.program || "Not provided"}`,
    `Travel month: ${payload.travelMonth || "Not provided"}`,
    "",
    payload.message || "No message provided.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFICATION_FROM || "Wild Spine <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ sent: false, reason: await response.text() }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
