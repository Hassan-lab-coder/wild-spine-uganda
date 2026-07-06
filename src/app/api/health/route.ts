import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { paymentsEnabled } from "@/lib/payment-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    durable_rate_limit: false,
    turnstile_required: false,
    cron_secret: Boolean(process.env.CRON_SECRET),
    operational_alerts: Boolean(
      process.env.ALERT_WEBHOOK_URL &&
      process.env.ALERT_WEBHOOK_SECRET &&
      process.env.RESEND_API_KEY &&
      process.env.LEAD_NOTIFICATION_EMAIL
    ),
    payments_enabled: paymentsEnabled(),
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const result = await supabase.from("itinerary_requests").select("id", { head: true, count: "exact" });
    checks.database = !result.error;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      checks.durable_rate_limit = (await redis.ping()) === "PONG";
    } catch {
      checks.durable_rate_limit = false;
    }
  }

  checks.turnstile_required = await validateTurnstileConfiguration();

  const healthy =
    checks.database &&
    checks.durable_rate_limit &&
    checks.turnstile_required &&
    checks.cron_secret &&
    checks.operational_alerts &&
    !checks.payments_enabled;
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

async function validateTurnstileConfiguration() {
  const required = process.env.TURNSTILE_REQUIRED?.toLowerCase() === "true";
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!required || !siteKey || !secret) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: "wildspine-health-credential-probe",
      }),
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    if (!response.ok) return false;

    const result = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
    const errors = result["error-codes"] || [];
    return (
      result.success === true ||
      (errors.includes("invalid-input-response") &&
        !errors.includes("invalid-input-secret") &&
        !errors.includes("missing-input-secret"))
    );
  } catch {
    return false;
  }
}
