import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ ok: false, reason: "Invalid payment reference." }, { status: 400 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, reason: "Payment status is unavailable." }, { status: 503 });
  }

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("payment_requests")
    .select("status, amount, currency, provider, created_at, paid_at, expires_at, metadata")
    .eq("public_token", token)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ ok: false, reason: "Payment reference was not found." }, { status: 404 });
  return NextResponse.json({
    ok: true,
    payment: {
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      trip_name: typeof data.metadata?.trip_name === "string" ? data.metadata.trip_name : "Private Uganda journey",
      created_at: data.created_at,
      paid_at: data.paid_at,
      expires_at: data.expires_at,
    },
  });
}
