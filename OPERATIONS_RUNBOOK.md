# Operations runbook

## Daily

The Vercel Cron processes due email automation once daily at 06:00 UTC. Review new leads, failed email automation, unread inbound mail, health status, and production error logs. Confirm bank-transfer payments against the official company bank statement before changing invoice status or issuing a receipt.

The Cron request is authenticated automatically by Vercel with `CRON_SECRET`. Never place this secret in a URL, repository, screenshot, or support message.

## Lead failure

Check `/api/health`, Upstash, Supabase logs, and Vercel function logs. Preserve the request ID and timestamp without copying customer data into chat or issue trackers. Restore service, then contact affected travelers through approved channels.

Public forms require a valid Cloudflare Turnstile token and pass through Upstash-backed distributed rate limiting before Supabase writes. If either provider is unavailable, inspect health and provider status before relaxing any control.

## Bank-transfer reconciliation

Online checkout remains on hold. Safari payments are company-bank transfer only. A transfer advice, screenshot, or remittance slip is not proof of payment. Finance/admin must match bank transaction reference, sender name, amount, currency, value date, and invoice reference against the official company bank statement before updating status.

## Daily bank reconciliation

1. Export or view the official company bank statement from the authorised bank channel.
2. Match each incoming transfer by bank transaction reference, sender name, amount, currency, value date, and invoice reference.
3. Treat emails, transfer advice, uploaded proof, and screenshots as tracing aids only. They are never confirmation of payment.
4. Record matched, unmatched, or rejected rows in the admin Bank Transfer Reconciliation panel.
5. Issue receipts only after cleared funds are matched.
6. Review unmatched transfers, duplicate references, document-generation failures, email failures, and suspicious invoice-verification alerts before close of business.

## Partial, over, and underpayments

- Partial payment: mark only the reconciled amount, issue a receipt for the amount received, and leave the invoice in `deposit_received` or `balance_due`.
- Underpayment: do not absorb bank charges silently. Notify the traveller of the shortfall unless finance approves an exception in writing.
- Overpayment: record the overpayment in notes, notify finance/admin, and either apply it to the balance or refund the excess to the originating account after approval.
- Unknown allocation: keep the transfer `unmatched` until the invoice reference and sender can be verified.

## Foreign exchange and bank charges

- The invoice currency is authoritative.
- The traveller is responsible for originating, intermediary, correspondent, and receiving-bank charges unless written terms say otherwise.
- If conversion creates a shortfall, finance records the received amount and keeps the balance due.
- If conversion creates an overpayment, admin approves the allocation or refund path.

## Refunds and corrections

Refunds require admin approval. Refund only to the originating bank account unless legal, banking, or fraud-review constraints require a documented exception. Record the reason, original transaction reference, refund reference, amount, currency, date, approver, and supporting notes. Do not overwrite receipts or audit events; issue new correction records.

## Duplicate and unidentified transfers

- Duplicate bank reference: stop reconciliation and investigate before updating any invoice.
- Duplicate amount from same sender: match only when the statement reference is unique and the invoice intent is clear.
- Unidentified transfer: record as `unmatched`, alert finance/admin, and hold booking confirmation.
- Fraud concern: do not communicate private banking details over social media; escalate to incident response.

## Bank-detail changes

Bank details may change only through a verified finance/admin procedure. Publish no full bank account details on public pages. If details change, issue a newly numbered invoice or approved finance instruction page, rotate the verification token if needed, and tell travellers to verify through the official website contact details.

## Incident

Disable affected integrations, rotate credentials if exposure is possible, preserve logs, identify the release SHA, and roll back the application through Vercel's Git deployment history. Record timeline, impact, resolution, and follow-up actions.

For payment incidents, immediately freeze reconciliation on affected invoices, preserve bank statement evidence, revoke invoice verification tokens if fraud is suspected, notify admin/finance, and contact travellers only through official channels.

## Database recovery

The 5 July 2026 pre-migration backup is stored outside the repository under backup ID `20260705-205323`. Verify `SHA256SUMS.txt` before restore. Restore only into an isolated Supabase project first, compare table row counts with `manifest.json`, and obtain approval before any production replacement.

## Configuration verification

- Upstash resource: `wildspine-rate-limit`; verify it with a `PING` and confirm `/api/health` reports `rate_limit: true`.
- Turnstile widget: `WildSpine Uganda Production`, Managed mode, restricted to `wildspineuganda.com` and `www.wildspineuganda.com`.
- After any Turnstile secret rotation, update Vercel, deploy through Git, confirm `/api/health` recognizes the credential, and complete one human-verified production form submission.
- Keep `TURNSTILE_REQUIRED=true`, `PAYMENTS_ENABLED=false`, `PAYMENT_METHOD=bank_transfer`, and `BANK_TRANSFER_BOOKINGS_ENABLED=true` in production.
- Keep `CRON_SECRET` and `ALERT_WEBHOOK_SECRET` in deployment secrets only. Set `LEAD_NOTIFICATION_EMAIL` to the monitored reservations inbox; health remains degraded without it or `RESEND_API_KEY`. The application sends the alert secret as a Bearer token; the separately stored GitHub Actions webhook URL carries a masked token so the external monitor can authenticate.
- The GitHub `Production uptime` workflow runs every five minutes. A failed health response also attempts the protected operational alert receiver and leaves a failed workflow run for independent evidence.
