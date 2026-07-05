# Monitoring

Use `/api/health` for an uptime check. A `503 degraded` response identifies missing database connectivity or durable rate limiting. Configure an external monitor to check it every five minutes and alert the operator.

Server events are emitted as structured JSON in Vercel logs. Payment webhook mismatches, rejected settlement amounts, and reconciliation failures also call `ALERT_WEBHOOK_URL` when configured. The logger excludes common personal and secret-bearing fields.

Production checklist:

- Create alerts for elevated 5xx responses, lead-save failures, cron failures, and payment reconciliation events.
- Connect Vercel Web Analytics or another privacy-reviewed Core Web Vitals monitor.
- Connect Sentry (or an equivalent error tracker) when its DSN and data-retention policy are approved.
- Review `/api/health`, Vercel logs, Supabase logs, and the payment ledger after every release.

