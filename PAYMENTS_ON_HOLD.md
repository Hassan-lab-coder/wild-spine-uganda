# Payments on hold

Online payments are intentionally disabled. `PAYMENTS_ENABLED` defaults to false, payment-link creation returns a controlled `503`, the admin button is disabled, and the Tazapay webhook does not mutate invoices or receipts.

Staff may create quotes, invoices, and manually verified receipts. Do not send an online checkout link or mark an invoice paid without independent bank/provider confirmation.

Activation requires:

1. Approved Tazapay KYB and live account access.
2. Live API and webhook secrets stored in Vercel, never Git.
3. Database migrations and monitoring verified.
4. A sandbox acceptance test, then one controlled low-value live checkout.
5. Evidence of signed webhook → payment ledger → paid invoice → receipt.
6. Written refund, reconciliation, incident, and customer-communication procedures.
7. Explicit release approval before setting `PAYMENTS_ENABLED=true`.

The July 2026 hardening work does not satisfy payment activation approval. Upstash, Turnstile, migrations, monitoring, and successful non-payment workflows do not authorize Tazapay. Keep `PAYMENTS_ENABLED=false` in every Vercel environment.

The production health and uptime checks deliberately fail if `PAYMENTS_ENABLED` changes to true without a separately approved payment release.
