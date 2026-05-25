import { NextResponse } from "next/server";

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
  const payload = (await request.json()) as LeadPayload;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!to || !resendKey) {
    return NextResponse.json({ sent: false, reason: "Email notifications are not configured." });
  }

  const subject = `New Wild Spine ${payload.type || "lead"}: ${payload.name || payload.email || "Website inquiry"}`;
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
