import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { paymentsEnabled } from "@/lib/payment-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    durable_rate_limit: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    payments_enabled: paymentsEnabled(),
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const result = await supabase.from("itinerary_requests").select("id", { head: true, count: "exact" });
    checks.database = !result.error;
  }

  const healthy = checks.database && checks.durable_rate_limit;
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

