"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Payment = {
  status: string;
  amount: number;
  currency: string;
  provider: string;
  trip_name: string;
  paid_at: string | null;
};

const copy: Record<string, { eyebrow: string; title: string; body: string }> = {
  paid: {
    eyebrow: "Payment confirmed",
    title: "Your journey is one step closer.",
    body: "Your payment has been securely confirmed. Our Uganda team will continue with the agreed permits, lodges, transfers, and next planning steps.",
  },
  pending: {
    eyebrow: "Payment processing",
    title: "We are waiting for confirmation.",
    body: "Your payment provider is still processing the transaction. This page updates automatically, and our team will only confirm services after verified settlement.",
  },
  creating: {
    eyebrow: "Preparing payment",
    title: "Your secure checkout is being prepared.",
    body: "Please wait a moment. If this status remains unchanged, contact our team before attempting another payment.",
  },
  failed: {
    eyebrow: "Payment not completed",
    title: "Your payment was not confirmed.",
    body: "No journey confirmation has been issued. Contact our team for a fresh secure payment link or help with another payment method.",
  },
  expired: {
    eyebrow: "Payment link expired",
    title: "This checkout is no longer active.",
    body: "For your security, expired links cannot be reused. Ask our team to issue a new payment link.",
  },
  cancelled: {
    eyebrow: "Payment cancelled",
    title: "No payment was taken.",
    body: "Your journey request remains with our team, but no services are confirmed until a verified payment is received.",
  },
  unavailable: {
    eyebrow: "Payment status unavailable",
    title: "We could not verify this payment link.",
    body: "No journey confirmation has been issued from this page. Contact Wild Spine with your invoice number so our team can verify the payment safely.",
  },
};

export default function PaymentStatusView({ fallbackStatus }: { fallbackStatus: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState(fallbackStatus);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/payments/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config: { payments_enabled?: boolean }) => setPaymentsEnabled(config.payments_enabled === true))
      .catch(() => setPaymentsEnabled(false));
  }, []);

  useEffect(() => {
    if (!paymentsEnabled) return;
    if (!token) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const response = await fetch(`/api/payments/status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const json = await response.json().catch(() => null) as { payment?: Payment } | null;
        if (!active) return;
        if (!response.ok || !json?.payment) {
          if (response.status >= 500) timer = setTimeout(load, 8000);
          else setStatus("unavailable");
          return;
        }
        setPayment(json.payment);
        setStatus(json.payment.status);
        if (["creating", "pending"].includes(json.payment.status)) timer = setTimeout(load, 4000);
      } catch {
        if (active) timer = setTimeout(load, 8000);
      }
    }

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [paymentsEnabled, token]);

  const effectiveStatus = paymentsEnabled && token ? status : "unavailable";
  const content = copy[effectiveStatus] || copy.pending;
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white md:px-16">
      <section className="mx-auto max-w-4xl border-y border-white/15 py-16">
        <p className="section-kicker">{content.eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">{content.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300">{content.body}</p>
        {payment && (
          <dl className="mt-10 grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-3">
            <div><dt className="text-xs uppercase text-gray-500">Journey</dt><dd className="mt-2 font-bold">{payment.trip_name}</dd></div>
            <div><dt className="text-xs uppercase text-gray-500">Amount</dt><dd className="mt-2 font-bold">{formatMoney(payment.amount, payment.currency)}</dd></div>
            <div><dt className="text-xs uppercase text-gray-500">Status</dt><dd className="mt-2 font-bold capitalize">{payment.status}</dd></div>
          </dl>
        )}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a href="https://wa.me/256751828241" className="bg-yellow-500 px-7 py-4 text-center font-black text-black">Contact Wild Spine</a>
          <a href="/" className="border border-white/20 px-7 py-4 text-center font-black">Return Home</a>
        </div>
      </section>
    </main>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency.toUpperCase() === "UGX" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
