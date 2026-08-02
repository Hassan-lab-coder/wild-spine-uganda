import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { sendOperationalAlert } from "@/lib/logger";
import { bearerToken } from "@/lib/server-validation";

type AutomationEvent = Database["public"]["Tables"]["email_automation_events"]["Row"];
type ItineraryRequest = Database["public"]["Tables"]["itinerary_requests"]["Row"];
type GuideLead = Database["public"]["Tables"]["guide_leads"]["Row"];

export async function POST(request: Request) {
  const token = bearerToken(request) || new URL(request.url).searchParams.get("token") || "";
  const expectedToken = process.env.CRON_SECRET || process.env.AUTOMATION_SECRET;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ ok: false, reason: "Automation token is invalid." }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, reason: "RESEND_API_KEY is not configured." }, { status: 500 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, reason: "Supabase service role is not configured." }, { status: 500 });
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

  const { data: events, error } = await supabase
    .from("email_automation_events")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 502 });
  }

  const results = [];

  for (const event of events || []) {
    const result = await sendAutomationEmail(supabase, event);
    results.push({ id: event.id, ...result });
    if (!result.ok) {
      await sendOperationalAlert("email_delivery_failure", {
        eventId: event.id,
        eventType: event.event_type,
        leadTable: event.lead_table,
        reason: result.reason,
      });
    }

    await supabase
      .from("email_automation_events")
      .update({
        status: result.ok ? "sent" : "failed",
        sent_at: result.ok ? new Date().toISOString() : null,
        metadata: {
          ...(event.metadata || {}),
          last_result: result,
        },
      })
      .eq("id", event.id);
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}

export const GET = POST;

async function sendAutomationEmail(
  supabase: ReturnType<typeof createClient<Database>>,
  event: AutomationEvent
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const lead = await loadLead(supabase, event);

  if (!lead) {
    return { ok: false, reason: "Lead was not found." };
  }

  const email = "email" in lead ? lead.email : "";

  if (!email) {
    return { ok: false, reason: "Lead email is missing." };
  }

  const message = automationMessage(event, lead);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFICATION_FROM || "Wild Spine <reservations@wildspineuganda.com>",
      to: email,
      reply_to: "reservations@wildspineuganda.com",
      subject: message.subject,
      text: message.text,
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: await response.text() };
  }

  return { ok: true };
}

async function loadLead(
  supabase: ReturnType<typeof createClient<Database>>,
  event: AutomationEvent
): Promise<ItineraryRequest | GuideLead | null> {
  if (event.lead_table === "itinerary_requests") {
    const { data } = await supabase.from("itinerary_requests").select("*").eq("id", event.lead_id).maybeSingle();
    return data;
  }

  if (event.lead_table === "guide_leads") {
    const { data } = await supabase.from("guide_leads").select("*").eq("id", event.lead_id).maybeSingle();
    return data;
  }

  return null;
}

function automationMessage(event: AutomationEvent, lead: ItineraryRequest | GuideLead) {
  if (event.event_type === "guide_delivery") {
    return {
      subject: "Your Wild Spine Uganda Gorilla Trekking Guide",
      text: `Hello,

Thank you for requesting the Wild Spine Uganda Gorilla Trekking Guide 2026.

You can download it here:
${siteUrl()}/guide.pdf

If you want help with gorilla permits, Bwindi timing, or a private Uganda itinerary, reply with your travel month and number of travelers.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "guide_follow_up_48h") {
    return {
      subject: "Questions after reading the gorilla trekking guide?",
      text: `Hello,

I hope the guide helped you understand Uganda's gorilla forests, permit timing, safety basics, and planning considerations.

If you are comparing dates or permit options, send us your preferred month, group size, and comfort level. We can help you avoid the common mistakes around sector choice, long transfers, and lodge timing.

Warmly,
Wild Spine Uganda`,
    };
  }

  const request = lead as ItineraryRequest;
  const name = request.name || "there";
  const route = request.route || "your Uganda journey";
  const invoiceNumber = typeof event.metadata?.invoice_number === "string" ? event.metadata.invoice_number : "your Wild Spine invoice";

  if (event.event_type === "instant_acknowledgement") {
    return {
      subject: `We received your Wild Spine request`,
      text: `Hi ${name},

Thank you for reaching out to Wild Spine Uganda about ${route}.

We have your details and will review the realistic next steps around dates, permits, route fit, lodge style, transfers, and pricing before replying.

For faster planning, you can reply with:
- Number of travelers
- Flexible or fixed dates
- Preferred comfort level
- Must-see experiences

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "proposal_sent") {
    return {
      subject: `Your Wild Spine Uganda proposal for ${route}`,
      text: `Hi ${name},

Your Wild Spine Uganda proposal is ready for review.

Please check the written itinerary, itemised quotation, inclusions, exclusions, cancellation notes, and suggested next steps before approving anything financially.

No payment is requested until you approve the itinerary and receive a numbered invoice.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "invoice_issued") {
    return {
      subject: `Invoice issued: ${invoiceNumber}`,
      text: `Hi ${name},

Wild Spine Uganda has issued ${invoiceNumber} for ${route}.

Please review the itinerary, itemised quotation, due dates, cancellation terms, and beneficiary legal name before transferring funds.

Payments are accepted only by transfer to the official company bank account stated on the authorised invoice. Do not pay a personal account or social-media payment request.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "transfer_instructions") {
    return {
      subject: `Bank-transfer instructions for ${invoiceNumber}`,
      text: `Hi ${name},

Your bank-transfer instructions are provided only on the authorised Wild Spine Uganda invoice or approved booking thread.

Before transferring:
- confirm the invoice number;
- confirm the beneficiary name matches the legal entity on the invoice;
- quote the invoice reference exactly;
- contact us through the official website details if anything looks different.

A transfer advice or screenshot is not proof of payment. Finance confirms receipt only after bank reconciliation.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "transfer_under_verification") {
    return {
      subject: `Transfer under verification: ${invoiceNumber}`,
      text: `Hi ${name},

Thank you. Your transfer information for ${invoiceNumber} is under finance verification.

This does not yet confirm payment. Wild Spine Uganda confirms receipt only after the funds appear in the official company bank account and are reconciled against the invoice reference.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "deposit_received") {
    return {
      subject: `Deposit received for ${route}`,
      text: `Hi ${name},

Wild Spine Uganda finance has reconciled your deposit for ${route}.

Our operations team will continue with the agreed reservation steps and will send written updates for permits, lodges, transfers, and any remaining balance.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "booking_confirmed") {
    return {
      subject: `Booking confirmed: ${route}`,
      text: `Hi ${name},

Your Wild Spine Uganda booking for ${route} is confirmed in writing.

Please keep your itinerary, invoice, receipt, emergency contacts, and booking terms together. Our team will continue supporting the journey through pre-trip preparation and arrival.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "balance_reminder") {
    return {
      subject: `Balance reminder for ${route}`,
      text: `Hi ${name},

This is a reminder to review the balance due date for ${route}.

Please use only the official company-bank instructions on your authorised invoice and quote the invoice reference exactly. If anything about the bank details appears to have changed, verify through the contact details published on wildspineuganda.com before transferring.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "receipt_issued") {
    return {
      subject: `Receipt issued for ${invoiceNumber}`,
      text: `Hi ${name},

Wild Spine Uganda has issued a receipt linked to ${invoiceNumber}.

Receipts are issued only after authorised bank reconciliation. Please keep the receipt with your itinerary and invoice records.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "permit_urgency_follow_up_72h") {
    return {
      subject: "A quick note on gorilla permit timing",
      text: `Hi ${name},

One practical note before your Uganda plans move too far: gorilla permits can shape the exact date, Bwindi sector, lodge options, and transfer route.

If gorilla trekking is important for ${route}, it is worth checking permit availability early instead of building the rest of the itinerary first.

Warmly,
Wild Spine Uganda`,
    };
  }

  return {
    subject: `Planning next steps for ${route}`,
    text: `Hi ${name},

Just checking in on your Wild Spine Uganda inquiry.

If you would like us to shape a realistic private itinerary, send your preferred month, number of travelers, and comfort level. We will help map the route around permits, lodges, transfers, and pacing.

Warmly,
Wild Spine Uganda`,
  };
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.wildspineuganda.com";
}
