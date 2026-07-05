# Operations runbook

## Daily

Review new leads, failed email automation, unread inbound mail, health status, and production error logs. Confirm manual payments against the provider or bank before changing invoice status or issuing a receipt.

## Lead failure

Check `/api/health`, Upstash, Supabase logs, and Vercel function logs. Preserve the request ID and timestamp without copying customer data into chat or issue trackers. Restore service, then contact affected travelers through approved channels.

## Payment event

Payments remain on hold. If an unexpected provider event arrives, keep the invoice unchanged, preserve the ledger/log evidence, verify the provider dashboard independently, and escalate. Never replay or edit webhook payloads in production.

## Refund and reconciliation

Two people should verify the invoice, provider reference, settled amount/currency, and customer identity. Process refunds in the provider dashboard, record the provider reference and reason, update internal records, and send a receipt/credit note. Reconcile invoices, receipts, provider settlements, and bank statements at least weekly.

## Incident

Disable affected integrations, rotate credentials if exposure is possible, preserve logs, identify the release SHA, and roll back the application through Vercel’s Git deployment history. Record timeline, impact, resolution, and follow-up actions.
