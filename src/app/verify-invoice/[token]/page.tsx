import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { bookingStatusLabel, initialsForTraveller } from "@/lib/bank-transfer";
import { sendOperationalAlert } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { noIndexMetadata } from "@/lib/seo";
import type { Database } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = noIndexMetadata(
  "Verify Wild Spine Uganda Invoice",
  "Private invoice verification page for Wild Spine Uganda bank-transfer bookings.",
);

type VerifyInvoicePageProps = {
  params: Promise<{ token: string }>;
};

export default async function VerifyInvoicePage({ params }: VerifyInvoicePageProps) {
  const { token } = await params;
  const headerStore = await headers();
  const limit = await rateLimit(
    new Request("https://wildspine.local/verify-invoice", { headers: headerStore }),
    { key: "invoice_verify", limit: 12, windowMs: 60_000 }
  );
  if (!limit.ok) {
    await sendOperationalAlert("suspicious_invoice_verification_traffic", {
      durableRateLimit: limit.durable,
      resetAt: limit.resetAt,
    });
    return invalidInvoicePanel("Invoice verification is temporarily limited", "Too many verification attempts were made. Contact Wild Spine Uganda through the official website details before transferring funds.");
  }

  const normalizedToken = token.trim().toLowerCase();
  const tokenLooksValid = /^[0-9a-f]{64}$/.test(normalizedToken);
  if (!tokenLooksValid) {
    return invalidInvoicePanel();
  }

  const invoice = await loadInvoice(normalizedToken);
  if (!invoice) {
    return invalidInvoicePanel();
  }

  return (
    <main className="min-h-screen bg-[#fff9ea] px-6 py-28 text-[#123a2a] md:px-16">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-[#d8cda9] bg-white/85 p-8 shadow-2xl">
        <p className="section-kicker">Invoice verification</p>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Valid Wild Spine invoice</h1>
        <p className="mt-5 max-w-2xl leading-8 text-[#68746a]">
          This page confirms high-level invoice details only. It does not display full bank account
          numbers, passport data, or private traveller records.
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          <VerificationField label="Validity" value="Valid invoice token" />
          <VerificationField label="Invoice reference" value={invoice.invoice_number} />
          <VerificationField label="Traveller initials" value={initialsForTraveller(invoice.client_name)} />
          <VerificationField label="Trip title" value={invoice.trip_name || "Private Uganda journey"} />
          <VerificationField label="Amount" value={formatMoney(invoice.total, invoice.currency)} />
          <VerificationField label="Currency" value={invoice.currency} />
          <VerificationField label="Due date" value={invoice.due_date ? formatPlainDate(invoice.due_date) : "Shown on invoice"} />
          <VerificationField label="Beneficiary legal name" value={invoice.beneficiary_legal_name} />
          <VerificationField label="Payment status" value={bookingStatusLabel(invoice.status)} />
        </dl>

        <div className="mt-10 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <p className="font-black text-[#7a5200]">Anti-fraud reminder</p>
          <p className="mt-3 leading-7 text-[#4c5f51]">
            Only transfer to the official company bank account stated on your authorised invoice.
            If bank details change, request a newly numbered invoice and verify through the contact
            details published on wildspineuganda.com.
          </p>
        </div>
      </section>
    </main>
  );
}

function invalidInvoicePanel(
  title = "Invoice not valid",
  message = "This verification token was not found. Do not transfer funds from this page. Contact Wild Spine Uganda through the official website details and request a fresh invoice."
) {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white md:px-16">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8">
        <p className="section-kicker">Invoice verification</p>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">{title}</h1>
        <p className="mt-6 leading-8 text-red-100">{message}</p>
      </section>
    </main>
  );
}

function VerificationField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d8cda9] bg-[#fff9ea] p-5">
      <dt className="text-xs font-black uppercase tracking-widest text-[#b8860b]">{label}</dt>
      <dd className="mt-2 font-black text-[#123a2a]">{value}</dd>
    </div>
  );
}

async function loadInvoice(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("invoices")
    .select("invoice_number, client_name, trip_name, total, currency, due_date, beneficiary_legal_name, status")
    .eq("verification_token", token)
    .is("verification_revoked_at", null)
    .maybeSingle();

  return data;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency.toUpperCase() === "UGX" ? 0 : 2,
  }).format(value);
}

function formatPlainDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
