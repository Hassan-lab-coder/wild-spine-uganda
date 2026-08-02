"use client";

const copy: Record<string, { eyebrow: string; title: string; body: string }> = {
  success: {
    eyebrow: "Transfer verification required",
    title: "No booking is confirmed from this page.",
    body: "Wild Spine Uganda confirms bank-transfer payments only after authorised finance reconciliation against the official company bank statement.",
  },
  pending: {
    eyebrow: "Awaiting bank reconciliation",
    title: "Transfer advice is not proof of payment.",
    body: "If you have sent transfer advice, our finance team still needs to match the funds, sender, amount, currency, value date, and invoice reference before updating your booking.",
  },
  failed: {
    eyebrow: "Payment not confirmed",
    title: "Please verify through official contacts.",
    body: "Do not attempt any informal payment. Use only the company-bank instructions shown on your authorised invoice and contact Wild Spine through the published website details if anything looks unusual.",
  },
  cancelled: {
    eyebrow: "No payment confirmed",
    title: "Your request can continue safely.",
    body: "Your travel request remains with our team, but no services are confirmed until the official company-bank transfer is reconciled and written confirmation is issued.",
  },
};

export default function PaymentStatusView({ fallbackStatus }: { fallbackStatus: string }) {
  const content = copy[fallbackStatus] || copy.pending;

  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white md:px-16">
      <section className="mx-auto max-w-4xl border-y border-white/15 py-16">
        <p className="section-kicker">{content.eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">{content.title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300">{content.body}</p>
        <div className="mt-10 rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-yellow-50">
          <p className="font-black">Wild Spine Uganda does not display public bank account details here.</p>
          <p className="mt-3 leading-7">
            Full bank instructions appear only on an authorised invoice or authenticated client space.
            If bank details change, request a newly numbered invoice and independently verify through
            reservations@wildspineuganda.com or the WhatsApp number published on this website.
          </p>
        </div>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a href="https://wa.me/256751828241" className="bg-yellow-500 px-7 py-4 text-center font-black text-black">Contact Wild Spine</a>
          <a href="/payment-information" className="border border-white/20 px-7 py-4 text-center font-black">Payment Information</a>
          <a href="/" className="border border-white/20 px-7 py-4 text-center font-black">Return Home</a>
        </div>
      </section>
    </main>
  );
}
