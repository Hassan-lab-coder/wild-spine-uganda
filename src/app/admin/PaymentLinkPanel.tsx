"use client";

import { useEffect, useState } from "react";
import { supabase, type Database } from "@/lib/supabase";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Provider = "tazapay" | "manual";

export default function PaymentLinkPanel({ invoice }: { invoice: Invoice }) {
  const [provider, setProvider] = useState<Provider>("tazapay");
  const [clientCountry, setClientCountry] = useState("US");
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [holdMessage, setHoldMessage] = useState("Online payment is temporarily unavailable.");

  useEffect(() => {
    let active = true;
    fetch("/api/payments/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { payments_enabled?: boolean; message?: string }) => {
        if (!active) return;
        setPaymentsEnabled(config.payments_enabled === true);
        if (config.message) setHoldMessage(config.message);
      })
      .catch(() => {
        if (active) setPaymentsEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createPaymentLink() {
    if (!paymentsEnabled) {
      setError(holdMessage);
      return;
    }
    setCreating(true);
    setResult("");
    setError("");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setCreating(false);
      setError("Admin session expired. Sign in again before creating a payment link.");
      return;
    }

    const response = await fetch("/api/payment-links", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoice.id,
        provider,
        client_country: provider === "tazapay" ? clientCountry : undefined,
      }),
    });
    const json = await response.json().catch(() => null) as {
      ok?: boolean;
      reused?: boolean;
      reason?: string;
      payment_request?: { checkout_url?: string | null; provider_reference?: string | null };
    } | null;
    setCreating(false);

    if (!response.ok || !json?.ok) {
      setError(json?.reason || "Payment link could not be created.");
      return;
    }
    const checkoutUrl = json.payment_request?.checkout_url;
    if (checkoutUrl) {
      await navigator.clipboard.writeText(checkoutUrl);
      setResult(json.reused ? "Existing active payment link copied." : "Secure payment link created and copied.");
      return;
    }
    setResult(json.reason || `Payment request recorded: ${json.payment_request?.provider_reference || invoice.invoice_number}`);
  }

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-yellow-500">Payment readiness</p>
          <p className="mt-1 text-sm text-gray-400">
            {paymentsEnabled ? "Create a tracked Tazapay checkout." : "Payment disabled — awaiting approved offline instructions."}
          </p>
        </div>
        <select value={provider} onChange={(event) => setProvider(event.target.value as Provider)} className="form-input md:w-44">
          <option value="tazapay">Tazapay</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      {provider === "tazapay" && (
        <label className="mb-4 grid gap-2 md:max-w-xs">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Buyer country</span>
          <input
            className="form-input uppercase"
            value={clientCountry}
            maxLength={2}
            onChange={(event) => setClientCountry(event.target.value.replace(/[^a-z]/gi, "").toUpperCase())}
            placeholder="US"
          />
          <span className="text-xs leading-5 text-gray-500">Two-letter country code required by Tazapay, for example US, GB, DE, NL.</span>
        </label>
      )}
      <button
        type="button"
        onClick={createPaymentLink}
        disabled={!paymentsEnabled || creating || !invoice.client_email || invoice.total <= 0 || (provider === "tazapay" && clientCountry.length !== 2)}
        className="admin-primary-button text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Creating..." : paymentsEnabled ? "Create Payment Request" : "Online Payments On Hold"}
      </button>
      {!paymentsEnabled && <p className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">{holdMessage}</p>}
      {result && <p className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">{result}</p>}
      {error && <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
    </div>
  );
}
