"use client";

import { useEffect, useState } from "react";
import type { Database } from "@/lib/supabase";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export default function PaymentLinkPanel({ invoice }: { invoice: Invoice }) {
  const [message, setMessage] = useState("Online checkout is disabled. Use authorised company-bank transfer instructions on the invoice.");

  useEffect(() => {
    let active = true;
    fetch("/api/payments/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { message?: string; public_notice?: string }) => {
        if (!active) return;
        setMessage(config.public_notice || config.message || message);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [message]);

  return (
    <div className="mt-5 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
      <p className="text-xs font-black uppercase tracking-widest text-yellow-500">Bank-transfer booking only</p>
      <p className="mt-2 text-sm leading-6 text-yellow-50">
        {message}
      </p>
      <div className="mt-4 grid gap-3 text-sm text-yellow-100 md:grid-cols-2">
        <p>Invoice: {invoice.invoice_number}</p>
        <p>Status: {invoice.status.replaceAll("_", " ")}</p>
        <p>Public payment links are not available.</p>
        <p>Do not mark paid from transfer advice alone.</p>
      </div>
      <a href="/payment-information" target="_blank" rel="noopener noreferrer" className="admin-outline-button mt-5 inline-flex text-sm">
        Open payment information
      </a>
    </div>
  );
}
