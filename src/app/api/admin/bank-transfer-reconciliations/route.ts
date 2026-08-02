import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase";
import {
  bookingStatusLabel,
  canApproveCorrections,
  canTransitionInvoiceStatusForRole,
  canReconcileBankTransfer,
  isBookingLifecycleStatus,
} from "@/lib/bank-transfer";
import { logEvent, sendOperationalAlert } from "@/lib/logger";
import { invoiceBeneficiaryMatchesConfiguration, safeBankingConfigStatus } from "@/lib/server-banking-config";
import { bearerToken, cleanMultilineText, cleanText, isAllowedBrowserOrigin, readJsonObject } from "@/lib/server-validation";

type AdminProfile = Database["public"]["Tables"]["admin_users"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export async function POST(request: Request) {
  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });
  }

  const token = bearerToken(request);
  const body = await readJsonObject(request);
  if (!token || !body) {
    return NextResponse.json({ ok: false, reason: "Admin session and JSON payload are required." }, { status: 400 });
  }

  const auth = await authenticateAdmin(token);
  if (!auth.ok) return NextResponse.json({ ok: false, reason: auth.reason }, { status: auth.status });

  const role = auth.admin.role;
  if (!canReconcileBankTransfer(role)) {
    await sendOperationalAlert("unauthorised_reconciliation_attempt", { role, userId: auth.userId });
    return NextResponse.json({ ok: false, reason: "Finance or admin role is required to reconcile bank transfers." }, { status: 403 });
  }

  const invoiceId = cleanText(body.invoice_id, 80);
  const transactionReference = cleanText(body.bank_transaction_reference, 160);
  const senderName = cleanText(body.sender_name, 160);
  const invoiceReference = cleanText(body.invoice_reference, 160);
  const currency = cleanText(body.currency, 8).toUpperCase() || "USD";
  const valueDate = cleanText(body.value_date, 20);
  const reconciliationStatus = reconciliationStatusFrom(body.status);
  const nextStatus = cleanText(body.next_invoice_status, 80) || (reconciliationStatus === "matched" ? "deposit_received" : "transfer_under_verification");
  const amount = Number(body.amount);
  const notes = cleanMultilineText(body.notes, 2000) || null;
  const transferAdviceReceived = body.transfer_advice_received === true;
  const confirmReconciliation = body.confirm_reconciliation === true;
  const issueReceipt = body.issue_receipt !== false;

  if (!invoiceId || !transactionReference || !senderName || !invoiceReference || !valueDate || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, reason: "Invoice, bank reference, sender, amount, currency, value date, and invoice reference are required." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valueDate)) {
    return NextResponse.json({ ok: false, reason: "Value date must use YYYY-MM-DD." }, { status: 400 });
  }
  if (!isBookingLifecycleStatus(nextStatus)) {
    return NextResponse.json({ ok: false, reason: "Next invoice status is not part of the bank-transfer lifecycle." }, { status: 400 });
  }
  if (["refunded", "disputed"].includes(nextStatus) && !canApproveCorrections(role)) {
    await sendOperationalAlert("unauthorised_reconciliation_correction_attempt", { role, userId: auth.userId });
    return NextResponse.json({ ok: false, reason: "Admin role is required for refunds, disputes, and correction states." }, { status: 403 });
  }
  if (reconciliationStatus === "matched" && !confirmReconciliation) {
    await sendOperationalAlert("transfer_proof_without_reconciliation_confirmation", { role, transferAdviceReceived });
    return NextResponse.json({ ok: false, reason: "Explicit authorised confirmation is required before a transfer can update payment status." }, { status: 409 });
  }

  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ ok: false, reason: "Supabase service role is not configured." }, { status: 500 });

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) return NextResponse.json({ ok: false, reason: "Invoice was not found." }, { status: 404 });

  const bankingStatus = safeBankingConfigStatus();
  if (!bankingStatus.beneficiary_matches_legal_entity) {
    await sendOperationalAlert("banking_configuration_mismatch", bankingStatus);
    return NextResponse.json({ ok: false, reason: "Banking configuration requires finance review before reconciliation." }, { status: 503 });
  }

  if (!invoiceBeneficiaryMatchesConfiguration(invoice.beneficiary_legal_name)) {
    await sendOperationalAlert("invoice_beneficiary_mismatch", { invoiceId: invoice.id });
    return NextResponse.json({ ok: false, reason: "Invoice beneficiary does not match the configured company beneficiary." }, { status: 409 });
  }

  if (reconciliationStatus === "matched" && !canTransitionInvoiceStatusForRole(role, invoice.status, nextStatus)) {
    await sendOperationalAlert("invalid_invoice_status_transition_attempt", {
      role,
      currentStatus: invoice.status,
      nextStatus,
    });
    return NextResponse.json({ ok: false, reason: "Invoice status transition is not allowed for this role." }, { status: 409 });
  }

  const moneyMismatch = reconciliationStatus === "matched" && (
    currency !== invoice.currency ||
    amount <= 0 ||
    !invoiceReference.toLowerCase().includes(invoice.invoice_number.toLowerCase())
  );
  if (moneyMismatch) {
    logEvent("warn", "bank_transfer_reconciliation_rejected", { invoiceId, currency, invoiceCurrency: invoice.currency });
    await sendOperationalAlert("bank_transfer_reconciliation_rejected", { invoiceId, currency, invoiceCurrency: invoice.currency });
    await writeAuditEvent(supabase, invoice, "bank_transfer_reconciliation_rejected", invoice.status, "transfer_under_verification", auth.admin, {
      transfer_advice_received: transferAdviceReceived,
      reason: "Currency or invoice reference did not match the invoice.",
    });
    return NextResponse.json({ ok: false, reason: "Currency and invoice reference must match the invoice before status can change." }, { status: 409 });
  }

  const { data: reconciliation, error: reconciliationError } = await supabase
    .from("bank_transfer_reconciliations")
    .insert({
      invoice_id: invoice.id,
      bank_transaction_reference: transactionReference,
      sender_name: senderName,
      amount,
      currency,
      value_date: valueDate,
      invoice_reference: invoiceReference,
      status: reconciliationStatus,
      transfer_advice_received: transferAdviceReceived,
      reconciled_by: auth.userId,
      notes,
    })
    .select("*")
    .single();

  if (reconciliationError || !reconciliation) {
    if (reconciliationError?.message?.toLowerCase().includes("duplicate") || reconciliationError?.code === "23505") {
      await sendOperationalAlert("duplicate_bank_transfer_reference", { invoiceId: invoice.id });
    }
    return NextResponse.json({ ok: false, reason: reconciliationError?.message || "Bank transfer reconciliation could not be saved." }, { status: 502 });
  }

  if (reconciliationStatus !== "matched") {
    await sendOperationalAlert("unmatched_bank_transfer_recorded", {
      invoiceId: invoice.id,
      reconciliationStatus,
      transferAdviceReceived,
    });
  }

  await writeAuditEvent(supabase, invoice, "bank_transfer_reconciliation_recorded", invoice.status, invoice.status, auth.admin, {
    reconciliation_id: reconciliation.id,
    reconciliation_status: reconciliationStatus,
    transfer_advice_received: transferAdviceReceived,
  });

  let updatedInvoice: Invoice = invoice;
  if (reconciliationStatus === "matched") {
    const { data, error } = await supabase
      .from("invoices")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id)
      .select("*")
      .single();

    if (error || !data) {
      await sendOperationalAlert("invoice_reconciliation_status_update_failed", { invoiceId: invoice.id, nextStatus });
      return NextResponse.json({ ok: false, reason: error?.message || "Invoice status could not be updated." }, { status: 502 });
    }

    updatedInvoice = data;
    await writeAuditEvent(supabase, invoice, "invoice_status_changed", invoice.status, nextStatus, auth.admin, {
      reconciliation_id: reconciliation.id,
      label: bookingStatusLabel(nextStatus),
    });

    if (issueReceipt) {
      const receiptNumber = receiptNumberFor(transactionReference);
      const { error: receiptError } = await supabase.from("receipts").insert({
        receipt_number: receiptNumber,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        payment_date: valueDate,
        currency,
        amount,
        payment_method: "bank_transfer",
        reference: transactionReference,
        notes: "Issued after authorised bank-transfer reconciliation.",
      });

      if (!receiptError) {
        await writeAuditEvent(supabase, invoice, "receipt_issued", nextStatus, nextStatus, auth.admin, {
          reconciliation_id: reconciliation.id,
          receipt_number: receiptNumber,
        });
      } else {
        await sendOperationalAlert("receipt_generation_failure", { invoiceId: invoice.id, receiptNumber });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    reconciliation,
    invoice: updatedInvoice,
  });
}

function reconciliationStatusFrom(value: unknown) {
  const status = cleanText(value, 30);
  return status === "unmatched" || status === "rejected" ? status : "matched";
}

async function authenticateAdmin(token: string): Promise<
  | { ok: true; userId: string; admin: AdminProfile }
  | { ok: false; status: number; reason: string }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = serviceClient();
  if (!url || !anonKey || !service) return { ok: false, status: 500, reason: "Supabase is not configured." };

  const authClient = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return { ok: false, status: 401, reason: "Admin session is invalid." };

  const { data: admin, error: adminError } = await service
    .from("admin_users")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError || !admin) return { ok: false, status: 403, reason: "This account is not approved for admin operations." };
  return { ok: true, userId: data.user.id, admin };
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

async function writeAuditEvent(
  supabase: NonNullable<ReturnType<typeof serviceClient>>,
  invoice: Invoice,
  eventType: string,
  oldStatus: string | null,
  newStatus: string | null,
  admin: AdminProfile,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("invoice_audit_events").insert({
    invoice_id: invoice.id,
    event_type: eventType,
    old_status: oldStatus,
    new_status: newStatus,
    actor_id: admin.user_id,
    actor_role: admin.role,
    metadata,
  });
}

function receiptNumberFor(reference: string) {
  const clean = reference.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-12) || crypto.randomUUID().slice(0, 8).toUpperCase();
  return `RCT-BT-${clean}`;
}
