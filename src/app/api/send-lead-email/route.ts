import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { bearerToken, cleanMultilineText, cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";

type EmailPayload = {
  to?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ sent: false, reason: "Origin is not allowed." }, { status: 403 });
  }

  const body = await readJsonObject(request);
  const token = bearerToken(request);
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.ADMIN_REPLY_FROM || process.env.LEAD_NOTIFICATION_FROM || "Wild Spine <reservations@wildspineuganda.com>";

  if (!body) {
    return NextResponse.json({ sent: false, reason: "Invalid JSON payload." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ sent: false, reason: "Admin session is missing." }, { status: 401 });
  }

  if (!resendKey) {
    return NextResponse.json({ sent: false, reason: "Email sending is not configured. Add RESEND_API_KEY." }, { status: 500 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ sent: false, reason: "Supabase is not configured on this deployment." }, { status: 500 });
  }

  const payload: EmailPayload = {
    to: cleanText(body.to, 160),
    subject: cleanText(body.subject, 180),
    message: cleanMultilineText(body.message),
  };

  if (!payload.to || !payload.subject || !payload.message) {
    return NextResponse.json({ sent: false, reason: "Recipient, subject, and message are required." }, { status: 400 });
  }

  if (!isEmail(payload.to)) {
    return NextResponse.json({ sent: false, reason: "Recipient email is invalid." }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ sent: false, reason: "Admin session is invalid." }, { status: 401 });
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminProfile) {
    return NextResponse.json({ sent: false, reason: "This account is not approved for admin email sending." }, { status: 403 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      reply_to: "reservations@wildspineuganda.com",
      subject: payload.subject,
      text: payload.message,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ sent: false, reason: await response.text() }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
