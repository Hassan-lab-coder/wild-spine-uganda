import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { bearerToken, cleanText, isAllowedBrowserOrigin, isEmail, readJsonObject } from "@/lib/server-validation";

type Provider = "manual" | "stripe" | "flutterwave";

export async function POST(request: Request) {
  const limit = rateLimit(request, { key: "payment_links", limit: 12, windowMs: 10 * 60 * 1000 });

  if (!limit.ok) {
    return NextResponse.json({ ok: false, reason: "Too many payment link requests." }, { status: 429 });
  }

  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });
  }

  const token = bearerToken(request);
  const body = await readJsonObject(request);

  if (!token) {
    return NextResponse.json({ ok: false, reason: "Admin session is missing." }, { status: 401 });
  }

  if (!body) {
    return NextResponse.json({ ok: false, reason: "Invalid JSON payload." }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: false, reason: "Supabase is not configured on this deployment." }, { status: 500 });
  }

  const payload = {
    invoice_id: cleanText(body.invoice_id, 80) || null,
    client_name: cleanText(body.client_name, 120),
    client_email: cleanText(body.client_email, 160).toLowerCase(),
    amount: Number(body.amount),
    currency: (cleanText(body.currency, 8) || "USD").toUpperCase(),
    trip_name: cleanText(body.trip_name, 160) || "Wild Spine Uganda travel services",
    provider: providerFrom(body.provider),
  };

  if (!payload.client_name || !isEmail(payload.client_email) || !Number.isFinite(payload.amount) || payload.amount <= 0) {
    return NextResponse.json({ ok: false, reason: "Client name, valid email, and positive amount are required." }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    return NextResponse.json({ ok: false, reason: "Admin session is invalid." }, { status: 401 });
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !adminProfile) {
    return NextResponse.json({ ok: false, reason: "This account is not approved for payment link creation." }, { status: 403 });
  }

  const payment = await createProviderPayment(request, payload);

  if (!payment.ok) {
    return NextResponse.json(payment, { status: 502 });
  }

  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      invoice_id: payload.invoice_id,
      client_name: payload.client_name,
      client_email: payload.client_email,
      amount: payload.amount,
      currency: payload.currency,
      provider: payload.provider,
      provider_reference: payment.reference,
      checkout_url: payment.checkout_url,
      status: "pending",
      metadata: {
        trip_name: payload.trip_name,
      },
      created_by: userData.user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, payment_request: data });
}

function providerFrom(value: unknown): Provider {
  const provider = cleanText(value, 40).toLowerCase();

  if (provider === "stripe" || provider === "flutterwave") {
    return provider;
  }

  return "manual";
}

async function createProviderPayment(
  request: Request,
  payload: {
    client_name: string;
    client_email: string;
    amount: number;
    currency: string;
    trip_name: string;
    provider: Provider;
  }
): Promise<{ ok: true; checkout_url: string | null; reference: string | null } | { ok: false; reason: string }> {
  if (payload.provider === "stripe") {
    return createStripeCheckout(request, payload);
  }

  if (payload.provider === "flutterwave") {
    return createFlutterwaveCheckout(request, payload);
  }

  return { ok: true, checkout_url: null, reference: `manual-${crypto.randomUUID()}` };
}

async function createStripeCheckout(
  request: Request,
  payload: { client_email: string; amount: number; currency: string; trip_name: string }
) {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return { ok: false as const, reason: "STRIPE_SECRET_KEY is not configured." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const form = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/thank-you?type=payment&source=stripe`,
    cancel_url: `${origin}/admin`,
    customer_email: payload.client_email,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": payload.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(Math.round(payload.amount * 100)),
    "line_items[0][price_data][product_data][name]": payload.trip_name,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const json = await response.json().catch(() => null) as { id?: string; url?: string; error?: { message?: string } } | null;

  if (!response.ok || !json?.url) {
    return { ok: false as const, reason: json?.error?.message || "Stripe checkout session could not be created." };
  }

  return { ok: true as const, checkout_url: json.url, reference: json.id || null };
}

async function createFlutterwaveCheckout(
  request: Request,
  payload: { client_name: string; client_email: string; amount: number; currency: string; trip_name: string }
) {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!key) {
    return { ok: false as const, reason: "FLUTTERWAVE_SECRET_KEY is not configured." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const reference = `wsu-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: `${origin}/thank-you?type=payment&source=flutterwave`,
      customer: {
        email: payload.client_email,
        name: payload.client_name,
      },
      customizations: {
        title: "Wild Spine Uganda",
        description: payload.trip_name,
      },
    }),
  });

  const json = await response.json().catch(() => null) as { status?: string; data?: { link?: string }; message?: string } | null;

  if (!response.ok || !json?.data?.link) {
    return { ok: false as const, reason: json?.message || "Flutterwave payment link could not be created." };
  }

  return { ok: true as const, checkout_url: json.data.link, reference };
}
