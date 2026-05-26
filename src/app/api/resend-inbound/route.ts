import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";

type ResendInboundEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    created_at?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    message_id?: string;
    subject?: string;
    attachments?: ReceivedAttachment[];
  };
};

type ReceivedAttachment = {
  id: string;
  filename?: string | null;
  content_type?: string | null;
  content_disposition?: string | null;
  content_id?: string | null;
};

type ReceivedEmail = {
  id?: string;
  from?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string | null;
  text?: string | null;
  html?: string | null;
  headers?: Record<string, unknown> | null;
  message_id?: string | null;
  created_at?: string;
  raw?: {
    download_url?: string | null;
    expires_at?: string | null;
  } | null;
  attachments?: ReceivedAttachment[];
};

export async function POST(request: Request) {
  const configuredToken = process.env.INBOUND_WEBHOOK_TOKEN;
  const providedToken = new URL(request.url).searchParams.get("token") || request.headers.get("x-inbound-webhook-token");

  if (configuredToken && providedToken !== configuredToken) {
    return NextResponse.json({ stored: false, reason: "Invalid inbound webhook token." }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!resendKey || !serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ stored: false, reason: "Inbound email storage is not configured." }, { status: 500 });
  }

  const event = (await request.json()) as ResendInboundEvent;

  if (event.type !== "email.received") {
    return NextResponse.json({ stored: false, ignored: true });
  }

  const emailId = event.data?.email_id;

  if (!emailId) {
    return NextResponse.json({ stored: false, reason: "Missing Resend email id." }, { status: 400 });
  }

  const emailResponse = await fetch(`https://api.resend.com/emails/receiving/${emailId}?html_format=cid`, {
    headers: {
      Authorization: `Bearer ${resendKey}`,
    },
  });

  if (!emailResponse.ok) {
    return NextResponse.json({ stored: false, reason: await emailResponse.text() }, { status: 502 });
  }

  const email = (await emailResponse.json()) as ReceivedEmail;
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const fromEmail = email.from || event.data?.from || "unknown sender";
  const attachments = normalizeAttachments(email.attachments || event.data?.attachments || []);

  const { error } = await supabase.from("inbound_emails").upsert(
    {
      resend_email_id: emailId,
      message_id: email.message_id || event.data?.message_id || null,
      from_email: fromEmail,
      to_emails: email.to || event.data?.to || [],
      cc_emails: email.cc || event.data?.cc || [],
      bcc_emails: email.bcc || event.data?.bcc || [],
      subject: email.subject || event.data?.subject || null,
      text_body: email.text || null,
      html_body: email.html || null,
      headers: email.headers || null,
      attachments: attachments.length > 0 ? attachments : null,
      raw_download_url: email.raw?.download_url || null,
      raw_expires_at: email.raw?.expires_at || null,
      received_at: email.created_at || event.data?.created_at || event.created_at || new Date().toISOString(),
    },
    { onConflict: "resend_email_id" }
  );

  if (error) {
    return NextResponse.json({ stored: false, reason: error.message }, { status: 500 });
  }

  return NextResponse.json({ stored: true, email_id: emailId });
}

function normalizeAttachments(attachments: ReceivedAttachment[]) {
  return attachments.map((attachment) => ({
    id: attachment.id,
    filename: attachment.filename || null,
    content_type: attachment.content_type || null,
    content_disposition: attachment.content_disposition || null,
    content_id: attachment.content_id || null,
  }));
}
