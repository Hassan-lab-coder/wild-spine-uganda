import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { bearerToken } from "@/lib/server-validation";

type AutomationEvent = Database["public"]["Tables"]["email_automation_events"]["Row"];
type ItineraryRequest = Database["public"]["Tables"]["itinerary_requests"]["Row"];
type GuideLead = Database["public"]["Tables"]["guide_leads"]["Row"];

export async function POST(request: Request) {
  const token = bearerToken(request) || new URL(request.url).searchParams.get("token") || "";

  if (!process.env.AUTOMATION_SECRET || token !== process.env.AUTOMATION_SECRET) {
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
      subject: "Your Wild Spine Uganda travel guide",
      text: `Hello,

Thank you for requesting the Wild Spine Uganda travel guide.

You can download it here:
${siteUrl()}/guide.pdf

If you want help with gorilla permits, Bwindi timing, Rwenzori hiking, or a private Uganda itinerary, reply with your travel month and number of travelers.

Warmly,
Wild Spine Uganda`,
    };
  }

  if (event.event_type === "guide_follow_up_48h") {
    return {
      subject: "Questions after reading the Uganda guide?",
      text: `Hello,

I hope the guide helped you understand Uganda's gorilla forests, Rwenzori routes, and planning considerations.

If you are comparing dates or permit options, send us your preferred month, group size, and comfort level. We can help you avoid the common mistakes around sector choice, long transfers, and lodge timing.

Warmly,
Wild Spine Uganda`,
    };
  }

  const request = lead as ItineraryRequest;
  const name = request.name || "there";
  const route = request.route || "your Uganda journey";

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
