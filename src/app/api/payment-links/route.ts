import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { assessTazapayReadiness, toTazapayMinorUnits } from "@/lib/payments";
import { PAYMENT_HOLD_MESSAGE, paymentsEnabled } from "@/lib/payment-guard";
import { logEvent } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { bearerToken, cleanText, isAllowedBrowserOrigin, readJsonObject } from "@/lib/server-validation";

type Provider = "manual" | "stripe" | "flutterwave" | "tazapay";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "payment_links", limit: 12, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "Too many payment link requests." }, { status: 429 });
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });

  const token = bearerToken(request);
  const body = await readJsonObject(request);
  const invoiceId = cleanText(body?.invoice_id, 80);
  const provider = providerFrom(body?.provider);
  const clientCountry = (cleanText(body?.client_country, 2) || process.env.TAZAPAY_DEFAULT_CUSTOMER_COUNTRY || "US").toUpperCase();

  if (!token || !body || !invoiceId) {
    return NextResponse.json({ ok: false, reason: "An admin session and invoice are required." }, { status: 400 });
  }
  if (provider === "tazapay" && !/^[A-Z]{2}$/.test(clientCountry)) {
    return NextResponse.json({ ok: false, reason: "Tazapay requires a two-letter buyer country code." }, { status: 400 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: false, reason: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData.user) return NextResponse.json({ ok: false, reason: "Admin session is invalid." }, { status: 401 });

  const { data: adminProfile } = await supabase.from("admin_users").select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (!adminProfile) return NextResponse.json({ ok: false, reason: "This account is not approved." }, { status: 403 });

  if (!paymentsEnabled()) {
    logEvent("warn", "payment_link_blocked_by_release_guard", { invoiceId, provider });
    return NextResponse.json(
      { ok: false, payments_enabled: false, reason: PAYMENT_HOLD_MESSAGE },
      { status: 503 }
    );
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, client_email, total, currency, trip_name, status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) return NextResponse.json({ ok: false, reason: "Invoice was not found." }, { status: 404 });
  if (!invoice.client_email || invoice.total <= 0 || invoice.status === "cancelled") {
    return NextResponse.json({ ok: false, reason: "Invoice must have an email, positive total, and active status." }, { status: 409 });
  }

  if (provider === "tazapay") {
    const readiness = currentTazapayReadiness();
    if (!readiness.ready) {
      const details = [...readiness.missing, ...readiness.errors].join(" ");
      return NextResponse.json({
        ok: false,
        reason: `Tazapay checkout is not production-ready. ${details}`.trim(),
      }, { status: 503 });
    }
  }

  const { data: existing } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("invoice_id", invoice.id)
    .eq("provider", provider)
    .in("status", ["creating", "pending", "paid"])
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      reused: true,
      payment_request: existing,
      reason: existing.status === "paid" ? "This invoice is already paid." : "Existing active payment request returned.",
    });
  }

  const publicToken = crypto.randomUUID();
  const { data: paymentRequest, error: createError } = await supabase
    .from("payment_requests")
    .insert({
      invoice_id: invoice.id,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      amount: invoice.total,
      currency: invoice.currency,
      provider,
      status: "creating",
      public_token: publicToken,
      metadata: { trip_name: invoice.trip_name || invoice.invoice_number, client_country: clientCountry },
      created_by: userData.user.id,
    })
    .select("*")
    .single();

  if (createError || !paymentRequest) {
    if (createError?.code === "23505") {
      return NextResponse.json({ ok: false, reason: "An active payment request already exists. Refresh the dashboard." }, { status: 409 });
    }
    return NextResponse.json({ ok: false, reason: createError?.message || "Payment request could not be reserved." }, { status: 502 });
  }

  const reference = `wsu_${paymentRequest.id}`;
  const payment = await createProviderPayment(request, {
    client_name: invoice.client_name,
    client_email: invoice.client_email,
    amount: invoice.total,
    currency: invoice.currency,
    trip_name: invoice.trip_name || invoice.invoice_number,
    provider,
    client_country: clientCountry,
    reference,
    public_token: publicToken,
  });

  if (!payment.ok) {
    await supabase.from("payment_requests").update({
      status: "failed",
      updated_at: new Date().toISOString(),
      metadata: { ...(paymentRequest.metadata || {}), creation_error: payment.reason },
    }).eq("id", paymentRequest.id);
    return NextResponse.json(payment, { status: 502 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("payment_requests")
    .update({
      provider_reference: payment.reference,
      checkout_url: payment.checkout_url,
      status: "pending",
      expires_at: payment.expires_at || null,
      updated_at: new Date().toISOString(),
      metadata: { ...(paymentRequest.metadata || {}), internal_reference: reference },
    })
    .eq("id", paymentRequest.id)
    .select("*")
    .single();

  if (saveError) return NextResponse.json({ ok: false, reason: "Checkout was created but its record needs reconciliation." }, { status: 502 });
  return NextResponse.json({ ok: true, payment_request: saved });
}

function providerFrom(value: unknown): Provider {
  const provider = cleanText(value, 40).toLowerCase();
  return provider === "stripe" || provider === "flutterwave" || provider === "tazapay" ? provider : "manual";
}

type PaymentPayload = {
  client_name: string;
  client_email: string;
  amount: number;
  currency: string;
  trip_name: string;
  provider: Provider;
  client_country: string;
  reference: string;
  public_token: string;
};

async function createProviderPayment(request: Request, payload: PaymentPayload): Promise<{
  ok: true;
  checkout_url: string | null;
  reference: string;
  expires_at?: string | null;
} | { ok: false; reason: string }> {
  if (payload.provider === "tazapay") return createTazapayCheckout(request, payload);
  if (payload.provider === "manual") return { ok: true, checkout_url: null, reference: payload.reference };
  return { ok: false, reason: `${payload.provider} is not enabled for production reconciliation yet.` };
}

async function createTazapayCheckout(request: Request, payload: PaymentPayload) {
  const apiKey = process.env.TAZAPAY_API_KEY;
  const apiSecret = process.env.TAZAPAY_API_SECRET;
  if (!apiKey || !apiSecret) return { ok: false as const, reason: "Tazapay credentials are not configured." };

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const baseUrl = process.env.TAZAPAY_BASE_URL ||
    (process.env.TAZAPAY_ENVIRONMENT === "live" ? "https://service.tazapay.com" : "https://service-sandbox.tazapay.com");
  const minorAmount = toTazapayMinorUnits(payload.amount, payload.currency);
  if (!Number.isSafeInteger(minorAmount) || minorAmount <= 0 || minorAmount > 2_147_483_647) {
    return { ok: false as const, reason: "The invoice amount is outside Tazapay's supported range." };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v3/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.reference,
    },
    body: JSON.stringify({
      invoice_currency: payload.currency,
      amount: minorAmount,
      customer_details: { name: payload.client_name, email: payload.client_email, country: payload.client_country },
      success_url: `${origin}/payment/success?token=${payload.public_token}`,
      cancel_url: `${origin}/payment/cancelled?token=${payload.public_token}`,
      webhook_url: `${origin}/api/tazapay/webhook`,
      transaction_description: payload.trip_name,
      reference_id: payload.reference,
      items: [{ name: payload.trip_name, quantity: 1, amount: minorAmount, description: "Wild Spine Uganda private travel services" }],
      metadata: JSON.stringify({ brand: "Wild Spine Uganda", payment_request_reference: payload.reference }),
    }),
  });

  const json = await response.json().catch(() => null) as {
    data?: { id?: string; url?: string; expires_at?: string };
    message?: string;
    error?: { message?: string };
  } | null;

  if (!response.ok || !json?.data?.url || !json.data.id) {
    return { ok: false as const, reason: json?.error?.message || json?.message || "Tazapay checkout could not be created." };
  }
  return {
    ok: true as const,
    checkout_url: json.data.url,
    reference: json.data.id,
    expires_at: json.data.expires_at || null,
  };
}

function currentTazapayReadiness() {
  return assessTazapayReadiness({
    nodeEnvironment: process.env.NODE_ENV,
    configuredEnvironment: process.env.TAZAPAY_ENVIRONMENT,
    hasApiKey: Boolean(process.env.TAZAPAY_API_KEY),
    hasApiSecret: Boolean(process.env.TAZAPAY_API_SECRET),
    hasWebhookSecret: Boolean(process.env.TAZAPAY_WEBHOOK_SECRET),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    baseUrl: process.env.TAZAPAY_BASE_URL,
    allowSandboxInProduction: process.env.TAZAPAY_ALLOW_SANDBOX_IN_PRODUCTION === "true",
  });
}
