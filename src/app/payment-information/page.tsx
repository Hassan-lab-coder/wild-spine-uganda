import { ANTI_FRAUD_PAYMENT_NOTICE, TRANSFER_ADVICE_NOT_PROOF } from "@/lib/bank-transfer";
import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Payment Information | Wild Spine Uganda",
  description:
    "How Wild Spine Uganda handles safari payments by verified company-bank transfer, invoice reference, reconciliation, and anti-fraud checks.",
  path: "/payment-information",
});

const processSteps = [
  ["1", "Inquiry and consultation", "You share your route, dates, group size, comfort level, and planning questions. No payment is requested at inquiry stage."],
  ["2", "Written proposal", "Wild Spine sends a written itinerary and itemised quotation after checking realistic permit, lodge, transport, and guide availability."],
  ["3", "Numbered invoice", "When you approve the proposal, finance issues a numbered invoice with cancellation terms, due dates, payment reference, and authorised company-bank instructions."],
  ["4", "Bank transfer", "You transfer only to the official company account stated on the invoice and quote the invoice reference exactly."],
  ["5", "Bank reconciliation", "Finance confirms receipt only after the funds appear in the company bank account and the transaction is matched to the invoice."],
  ["6", "Receipt and booking confirmation", "After reconciliation, Wild Spine issues an official receipt and confirms the next reservation steps in writing."],
];

const safeguards = [
  "Full bank account details are not published on public website pages.",
  "Bank instructions appear only on authorised invoices or authenticated client spaces.",
  "The invoice, quotation, and bank beneficiary must use the same verified legal identity.",
  "Any bank-detail change must be issued through a new numbered invoice and independently verified.",
  "No employee, guide, social-media account, or informal message may receive safari payments.",
  "Transfer advice is reviewed, but it does not mark an invoice paid.",
];

export default function PaymentInformationPage() {
  return (
    <main className="min-h-screen bg-[#fff9ea] text-[#123a2a]">
      <section className="relative overflow-hidden bg-[#123a2a] px-6 py-32 text-white md:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,180,22,0.22),transparent_36%),linear-gradient(135deg,rgba(18,58,42,1),rgba(5,20,16,1))]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="section-kicker">Secure bank-transfer booking</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
            Formal invoices. Company-bank transfers. Details shared safely.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/78">
            Wild Spine Uganda accepts safari payments by bank transfer to the official company account
            shown on your authorised invoice. We do not publish full bank details on public pages,
            and we do not confirm bookings from screenshots, social-media messages, or transfer advice alone.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker">How payment works</p>
            <h2 className="mt-3 text-4xl font-black">The bank-transfer process</h2>
            <p className="mt-5 leading-8 text-[#68746a]">
              The safest payment experience is document-led. You should always know the itinerary,
              inclusions, exclusions, due date, beneficiary name, reference, and cancellation terms before sending money.
            </p>
          </div>
          <div className="grid gap-4">
            {processSteps.map(([step, title, text]) => (
              <article key={step} className="rounded-3xl border border-[#d8cda9] bg-white/75 p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-widest text-[#b8860b]">Step {step}</p>
                <h3 className="mt-2 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-[#4c5f51]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8cda9] bg-[#f8f4e8] px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <article className="rounded-3xl border border-[#d8cda9] bg-white/75 p-7">
            <p className="section-kicker">Beneficiary verification</p>
            <h2 className="mt-3 text-3xl font-black">Check the legal name before transfer.</h2>
            <p className="mt-5 leading-7 text-[#68746a]">
              Before transferring funds, confirm that the beneficiary name shown by your bank matches
              the legal entity stated on your invoice. If anything differs, stop and contact Wild Spine
              using the email or WhatsApp number published on this website.
            </p>
          </article>

          <article className="rounded-3xl border border-[#d8cda9] bg-white/75 p-7">
            <p className="section-kicker">Bank charges</p>
            <h2 className="mt-3 text-3xl font-black">The invoiced amount must arrive in full.</h2>
            <p className="mt-5 leading-7 text-[#68746a]">
              Originating, intermediary, correspondent, and receiving-bank charges are the traveller&apos;s
              responsibility unless your invoice says otherwise. If bank charges are deducted, finance may
              issue a balance request for the shortfall.
            </p>
          </article>

          <article className="rounded-3xl border border-[#d8cda9] bg-white/75 p-7">
            <p className="section-kicker">Reference requirements</p>
            <h2 className="mt-3 text-3xl font-black">Quote the invoice reference exactly.</h2>
            <p className="mt-5 leading-7 text-[#68746a]">
              Use the invoice number or payment reference provided on your invoice. This helps finance
              match the transfer to the right traveller, trip, amount, and due date.
            </p>
          </article>
        </div>
      </section>

      <section className="px-6 py-20 md:px-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#d8cda9] bg-[#123a2a] p-8 text-white shadow-2xl">
            <p className="section-kicker">Anti-fraud warning</p>
            <h2 className="mt-3 text-4xl font-black">If instructions change, verify before paying.</h2>
            <p className="mt-5 text-lg leading-8 text-white/78">{ANTI_FRAUD_PAYMENT_NOTICE}</p>
            <p className="mt-5 text-lg leading-8 text-white/78">
              Wild Spine Uganda does not change bank details through WhatsApp, social media, or an
              informal email message. Any legitimate change must be issued in a newly numbered invoice
              and independently verified using the contact details published on this website.
            </p>
          </div>

          <div className="grid gap-4">
            {safeguards.map((item) => (
              <div key={item} className="rounded-2xl border border-[#d8cda9] bg-white/75 p-5">
                <p className="font-bold leading-7 text-[#365143]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#d8cda9] bg-[#f8f4e8] px-6 py-20 md:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="section-kicker">Processing and reconciliation</p>
          <h2 className="mt-3 text-4xl font-black">Transfer advice is not proof of payment.</h2>
          <p className="mt-6 text-lg leading-8 text-[#68746a]">{TRANSFER_ADVICE_NOT_PROOF}</p>
          <p className="mt-5 leading-8 text-[#68746a]">
            International transfers commonly require several business days. Permit and lodge availability
            cannot be guaranteed until cleared funds are received, reconciled by an authorised finance user,
            and the reservation is confirmed in writing.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="/#book" className="rounded-full bg-[#f5b416] px-8 py-4 text-center font-black text-black hover:bg-[#ffd766]">
              Request a verified safari proposal
            </a>
            <a href="/why-wild-spine" className="rounded-full border border-[#d8cda9] px-8 py-4 text-center font-black text-[#123a2a] hover:bg-white">
              Why travel with Wild Spine?
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
