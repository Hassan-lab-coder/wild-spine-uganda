import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

import {
  canDraftProposal,
  canReconcileBankTransfer,
  type AdminRole,
} from "@/lib/bank-transfer";
import { sendOperationalAlert } from "@/lib/logger";
import { bearerToken, cleanText, isAllowedBrowserOrigin, readJsonObject } from "@/lib/server-validation";
import type { Database } from "@/lib/supabase";

type AdminProfile = Database["public"]["Tables"]["admin_users"]["Row"];
type FinancialDocument = Database["public"]["Tables"]["financial_documents"]["Row"];

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

  const documentType = cleanText(body.document_type, 20);
  const documentNumber = cleanText(body.document_number, 120);
  const invoiceId = cleanText(body.invoice_id, 80) || null;
  const receiptId = cleanText(body.receipt_id, 80) || null;
  const verificationUrl = cleanText(body.verification_url, 500) || null;
  const canonicalContent = typeof body.canonical_content === "string" ? body.canonical_content.slice(0, 200_000) : "";

  if (documentType !== "invoice" && documentType !== "receipt") {
    return NextResponse.json({ ok: false, reason: "Document type must be invoice or receipt." }, { status: 400 });
  }
  if (!documentNumber || !canonicalContent || (!invoiceId && !receiptId)) {
    return NextResponse.json({ ok: false, reason: "Document number, subject id, and canonical content are required." }, { status: 400 });
  }
  if (documentType === "invoice" && !canDraftProposal(auth.admin.role)) {
    return NextResponse.json({ ok: false, reason: "Invoice generation requires an authorised admin role." }, { status: 403 });
  }
  if (documentType === "receipt" && !canReconcileBankTransfer(auth.admin.role)) {
    await sendOperationalAlert("unauthorised_receipt_generation_attempt", {
      role: auth.admin.role,
      userId: auth.userId,
    });
    return NextResponse.json({ ok: false, reason: "Receipt generation requires finance or admin role." }, { status: 403 });
  }

  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ ok: false, reason: "Supabase service role is not configured." }, { status: 500 });

  const { data: latest } = await supabase
    .from("financial_documents")
    .select("version")
    .eq("document_type", documentType)
    .eq("document_number", documentNumber)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = Number(latest?.version || 0) + 1;
  const generatedAt = new Date().toISOString();
  const qrPayload = verificationUrl || `${documentType}:${documentNumber}:v${version}`;
  const qrSvg = await QRCode.toString(qrPayload, {
    type: "svg",
    margin: 1,
    width: 160,
    errorCorrectionLevel: "M",
  });
  const contentHash = `sha256:${createHash("sha256")
    .update([documentType, documentNumber, version, generatedAt, canonicalContent].join("\n"))
    .digest("hex")}`;

  const { data: document, error } = await supabase
    .from("financial_documents")
    .insert({
      document_type: documentType,
      invoice_id: invoiceId,
      receipt_id: receiptId,
      document_number: documentNumber,
      version,
      generated_by: auth.userId,
      generated_by_role: auth.admin.role,
      generated_at: generatedAt,
      verification_url: verificationUrl,
      qr_payload: qrPayload,
      content_hash: contentHash,
      metadata: {
        content_length: canonicalContent.length,
        qr_svg_length: qrSvg.length,
      },
    })
    .select("*")
    .single();

  if (error || !document) {
    await sendOperationalAlert(
      documentType === "invoice" ? "invoice_generation_failure" : "receipt_generation_failure",
      { documentType, documentNumber }
    );
    return NextResponse.json({ ok: false, reason: error?.message || "Document record could not be saved." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    document: publicDocumentRecord(document),
    qr_svg: qrSvg,
  });
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

function publicDocumentRecord(document: FinancialDocument) {
  return {
    id: document.id,
    document_type: document.document_type,
    document_number: document.document_number,
    version: document.version,
    generated_at: document.generated_at,
    generated_by_role: document.generated_by_role as AdminRole | null,
    verification_url: document.verification_url,
    qr_payload: document.qr_payload,
    content_hash: document.content_hash,
  };
}
