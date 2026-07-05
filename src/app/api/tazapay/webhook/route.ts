import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import { fromTazapayMinorUnits, isStalePaymentEvent, mapTazapayEventToStatus } from "@/lib/payments";
import { asRecord, cleanText } from "@/lib/server-validation";
import { PAYMENT_HOLD_MESSAGE, paymentsEnabled } from "@/lib/payment-guard";
import { logEvent, sendOperationalAlert } from "@/lib/logger";

type TazapayWebhookEvent = {
  id: string;
  type: string;
  created_at: string;
  data: Record<string, unknown>;
};

export async function POST(request: Request) {
  if (!paymentsEnabled()) {
    logEvent("warn", "tazapay_webhook_blocked_by_release_guard");
    return NextResponse.json(
      { ok: false, payments_enabled: false, reason: PAYMENT_HOLD_MESSAGE },
      { status: 503, headers: { "Retry-After": "3600" } }
    );
  }

  const rawPayload = await request.text();
  const event = parseWebhookEvent(rawPayload);
  if (!event) return NextResponse.json({ ok: false, reason: "Invalid webhook payload." }, { status: 400 });

  const verification = verifyTazapaySignature(request, rawPayload, event);
  if (!verification.ok) return NextResponse.json({ ok: false, reason: verification.reason }, { status: verification.status });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, reason: "Payment reconciliation is not configured." }, { status: 500 });
  }

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const checkoutId = extractCheckoutId(event);
  const internalReference = extractInternalReference(event);

  let { data: ledgerEvent, error: ledgerError } = await supabase
    .from("payment_webhook_events")
    .insert({
      provider: "tazapay",
      event_id: event.id,
      event_type: event.type,
      provider_reference: checkoutId || null,
      payload: event as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (ledgerError?.code === "23505") {
    const existingLedger = await supabase
      .from("payment_webhook_events")
      .select("id, processing_status")
      .eq("provider", "tazapay")
      .eq("event_id", event.id)
      .single();

    if (existingLedger.error || !existingLedger.data) {
      return NextResponse.json({ ok: false, reason: "Webhook ledger lookup failed." }, { status: 503 });
    }
    if (existingLedger.data.processing_status === "processed") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    ledgerEvent = { id: existingLedger.data.id };
    ledgerError = null;
  }
  if (ledgerError || !ledgerEvent) return NextResponse.json({ ok: false, reason: "Webhook ledger is unavailable." }, { status: 503 });

  const finishLedger = async (status: string, error?: string, paymentRequestId?: string) => {
    await supabase.from("payment_webhook_events").update({
      processing_status: status,
      processing_error: error || null,
      payment_request_id: paymentRequestId || null,
      processed_at: new Date().toISOString(),
    }).eq("id", ledgerEvent.id);
  };

  let lookup = supabase.from("payment_requests").select("*").eq("provider", "tazapay");
  if (checkoutId) lookup = lookup.eq("provider_reference", checkoutId);
  else if (internalReference.startsWith("wsu_")) lookup = lookup.eq("id", internalReference.slice(4));
  else {
    await finishLedger("ignored", "No checkout or internal reference.");
    return NextResponse.json({ ok: true, ignored: true });
  }

  const { data: paymentRequest, error: lookupError } = await lookup.maybeSingle();
  if (lookupError || !paymentRequest) {
    await finishLedger("unmatched", lookupError?.message || "Payment request was not found.");
    void sendOperationalAlert("payment_webhook_unmatched", { eventId: event.id, provider: "tazapay" });
    return NextResponse.json({ ok: true, unmatched: true });
  }

  const nextStatus = mapTazapayEventToStatus(event.type);
  if (!nextStatus) {
    await finishLedger("ignored", undefined, paymentRequest.id);
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (isStalePaymentEvent(paymentRequest.last_event_at, event.created_at)) {
    await finishLedger("ignored", "Event is older than the latest reconciled payment event.", paymentRequest.id);
    return NextResponse.json({ ok: true, ignored: true, status: paymentRequest.status });
  }

  if (paymentRequest.status === "paid" && nextStatus !== "paid") {
    await finishLedger("ignored", "Paid status cannot be downgraded.", paymentRequest.id);
    return NextResponse.json({ ok: true, ignored: true, status: "paid" });
  }

  if (nextStatus === "paid") {
    const moneyError = verifyPaidMoney(event, paymentRequest.amount, paymentRequest.currency);
    if (moneyError) {
      await finishLedger("rejected", moneyError, paymentRequest.id);
      void sendOperationalAlert("payment_webhook_money_rejected", { eventId: event.id, paymentRequestId: paymentRequest.id });
      return NextResponse.json({ ok: false, reason: moneyError }, { status: 422 });
    }
  }

  const eventTime = new Date(event.created_at).toISOString();
  const { error: paymentError } = await supabase.from("payment_requests").update({
    status: nextStatus,
    paid_at: nextStatus === "paid" ? eventTime : paymentRequest.paid_at,
    last_event_at: eventTime,
    updated_at: new Date().toISOString(),
    metadata: {
      ...(paymentRequest.metadata || {}),
      tazapay_event_id: event.id,
      tazapay_event_type: event.type,
      tazapay_checkout_id: checkoutId || paymentRequest.provider_reference,
      tazapay_payin_id: extractPayinId(event) || null,
      tazapay_payment_attempt_id: extractPaymentAttemptId(event) || null,
      tazapay_payment_status: cleanText(event.data.payment_status, 40) || null,
      tazapay_status_description: cleanText(event.data.status_description, 500) || null,
    },
  }).eq("id", paymentRequest.id);

  if (paymentError) {
    await finishLedger("failed", paymentError.message, paymentRequest.id);
    void sendOperationalAlert("payment_reconciliation_failed", { eventId: event.id, paymentRequestId: paymentRequest.id });
    return NextResponse.json({ ok: false, reason: "Payment state could not be saved." }, { status: 503 });
  }

  if (nextStatus === "paid" && paymentRequest.invoice_id) {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", paymentRequest.invoice_id)
      .select("invoice_number, client_name, client_email")
      .single();

    if (invoiceError || !invoice) {
      await finishLedger("failed", invoiceError?.message || "Invoice was not found.", paymentRequest.id);
      void sendOperationalAlert("payment_invoice_reconciliation_failed", { eventId: event.id, paymentRequestId: paymentRequest.id });
      return NextResponse.json({ ok: false, reason: "Invoice reconciliation failed." }, { status: 503 });
    }

    const receiptNumber = `RCT-TP-${(checkoutId || paymentRequest.id).replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase()}`;
    const { error: receiptError } = await supabase.from("receipts").upsert({
      receipt_number: receiptNumber,
      invoice_id: paymentRequest.invoice_id,
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      payment_date: event.created_at.slice(0, 10),
      currency: paymentRequest.currency,
      amount: paymentRequest.amount,
      payment_method: "tazapay",
      reference: checkoutId || paymentRequest.provider_reference,
      notes: "Automatically reconciled from a verified Tazapay webhook.",
      payment_request_id: paymentRequest.id,
    }, { onConflict: "payment_request_id" });

    if (receiptError) {
      await finishLedger("failed", receiptError.message, paymentRequest.id);
      void sendOperationalAlert("payment_receipt_reconciliation_failed", { eventId: event.id, paymentRequestId: paymentRequest.id });
      return NextResponse.json({ ok: false, reason: "Receipt reconciliation failed." }, { status: 503 });
    }
  }

  await finishLedger("processed", undefined, paymentRequest.id);
  return NextResponse.json({ ok: true, status: nextStatus, payment_request_id: paymentRequest.id });
}

function parseWebhookEvent(rawPayload: string): TazapayWebhookEvent | null {
  try {
    const record = asRecord(JSON.parse(rawPayload));
    const id = cleanText(record.id, 120);
    const type = cleanText(record.type, 120);
    const createdAt = cleanText(record.created_at, 80);
    if (!id || !type || !createdAt) return null;
    return { id, type, created_at: createdAt, data: asRecord(record.data) };
  } catch {
    return null;
  }
}

function verifyTazapaySignature(request: Request, rawPayload: string, event: TazapayWebhookEvent): { ok: true } | { ok: false; reason: string; status: number } {
  const secret = process.env.TAZAPAY_WEBHOOK_SECRET;
  if (!secret) return { ok: false, reason: "Webhook authentication is not configured.", status: 500 };
  const signature = cleanText(request.headers.get("signature") || request.headers.get("webhook-signature"), 500);
  if (!signature) return { ok: false, reason: "Missing webhook signature.", status: 401 };

  const eventDate = new Date(event.created_at);
  const toleranceMs = Number(process.env.TAZAPAY_WEBHOOK_TOLERANCE_SECONDS || 600) * 1000;
  if (Number.isNaN(eventDate.getTime()) || Math.abs(Date.now() - eventDate.getTime()) > toleranceMs) {
    return { ok: false, reason: "Webhook timestamp is outside the allowed tolerance.", status: 401 };
  }

  const expected = createHmac("sha256", secret).update(`${event.id}${rawPayload}${event.created_at}`).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return { ok: false, reason: "Invalid webhook signature.", status: 401 };
  }
  return { ok: true };
}

function verifyPaidMoney(event: TazapayWebhookEvent, expectedAmount: number, expectedCurrency: string) {
  const currency = cleanText(event.data.invoice_currency || event.data.currency, 8).toUpperCase();
  const rawAmount = Number(event.data.amount_paid ?? event.data.amount);
  if (!currency || !Number.isFinite(rawAmount)) return "Paid event is missing settlement amount or currency.";
  const settledAmount = fromTazapayMinorUnits(rawAmount, currency);
  if (currency !== expectedCurrency.toUpperCase()) return `Currency mismatch: expected ${expectedCurrency}, received ${currency}.`;
  if (Math.abs(settledAmount - expectedAmount) > 0.001) return `Amount mismatch: expected ${expectedAmount}, received ${settledAmount}.`;
  return "";
}

function extractCheckoutId(event: TazapayWebhookEvent) {
  for (const value of [event.data.id, event.data.checkout, event.data.checkout_id]) {
    const text = cleanText(value, 120);
    if (text.startsWith("chk_")) return text;
  }
  return "";
}

function extractPayinId(event: TazapayWebhookEvent) {
  for (const value of [event.data.id, event.data.payin]) {
    const text = cleanText(value, 120);
    if (text.startsWith("pay_")) return text;
  }
  return "";
}

function extractPaymentAttemptId(event: TazapayWebhookEvent) {
  const id = cleanText(event.data.id, 120);
  return id.startsWith("pat_") ? id : "";
}

function extractInternalReference(event: TazapayWebhookEvent) {
  const direct = cleanText(event.data.reference_id, 120);
  if (direct) return direct;
  return cleanText(asRecord(event.data.metadata).payment_request_reference, 120);
}
