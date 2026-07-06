# Operations runbook

## Daily

The Vercel Cron processes due email automation once daily at 06:00 UTC. Review new leads, failed email automation, unread inbound mail, health status, and production error logs. Confirm manual payments against the provider or bank before changing invoice status or issuing a receipt.

The Cron request is authenticated automatically by Vercel with `CRON_SECRET`. Never place this secret in a URL, repository, screenshot, or support message.

## Lead failure

Check `/api/health`, Upstash, Supabase logs, and Vercel function logs. Preserve the request ID and timestamp without copying customer data into chat or issue trackers. Restore service, then contact affected travelers through approved channels.

Public forms require a valid Cloudflare Turnstile token and pass through Upstash-backed distributed rate limiting before Supabase writes. If either provider is unavailable, inspect health and provider status before relaxing any control.

## Payment event

Payments remain on hold. If an unexpected provider event arrives, keep the invoice unchanged, preserve the ledger/log evidence, verify the provider dashboard independently, and escalate. Never replay or edit webhook payloads in production.

## Refund and reconciliation

Two people should verify the invoice, provider reference, settled amount/currency, and customer identity. Process refunds in the provider dashboard, record the provider reference and reason, update internal records, and send a receipt/credit note. Reconcile invoices, receipts, provider settlements, and bank statements at least weekly.

## Incident

Disable affected integrations, rotate credentials if exposure is possible, preserve logs, identify the release SHA, and roll back the application through Vercel’s Git deployment history. Record timeline, impact, resolution, and follow-up actions.

## Database recovery

The 5 July 2026 pre-migration backup is stored outside the repository under backup ID `20260705-205323`. Verify `SHA256SUMS.txt` before restore. Restore only into an isolated Supabase project first, compare table row counts with `manifest.json`, and obtain approval before any production replacement.

## Configuration verification

- Upstash resource: `wildspine-rate-limit`; verify it with a `PING` and confirm `/api/health` reports `rate_limit: true`.
- Turnstile widget: `WildSpine Uganda Production`, Managed mode, restricted to `wildspineuganda.com` and `www.wildspineuganda.com`.
- After any Turnstile secret rotation, update Vercel, deploy through Git, confirm `/api/health` recognizes the credential, and complete one human-verified production form submission.
- Keep `TURNSTILE_REQUIRED=true` and `PAYMENTS_ENABLED=false` in production.
- Keep `CRON_SECRET` and `ALERT_WEBHOOK_SECRET` in deployment secrets only. Set `LEAD_NOTIFICATION_EMAIL` to the monitored reservations inbox; health remains degraded without it or `RESEND_API_KEY`. The application sends the alert secret as a Bearer token; the separately stored GitHub Actions webhook URL carries a masked token so the external monitor can authenticate.
- The GitHub `Production uptime` workflow runs every five minutes. A failed health response also attempts the protected operational alert receiver and leaves a failed workflow run for independent evidence.
