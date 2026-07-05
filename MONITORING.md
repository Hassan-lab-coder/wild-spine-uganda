# Monitoring

Use `/api/health` for uptime checks. A healthy response requires Supabase connectivity, a successful Upstash `PING`, required Turnstile configuration, cron authentication, operational alerts, and payments remaining disabled. The GitHub `Production uptime` workflow checks this endpoint from outside Vercel every five minutes; its failure is independent evidence when the application cannot call its own alert receiver.

Server events are emitted as structured JSON in Vercel logs. Payment webhook mismatches, rejected settlement amounts, and reconciliation failures call the protected `/api/operations/alert` receiver through `ALERT_WEBHOOK_URL`; the receiver sends an operational email through Resend. The logger excludes common personal and secret-bearing fields.

Production checklist:

- Create alerts for elevated 5xx responses, lead-save failures, cron failures, and payment reconciliation events.
- Connect Vercel Web Analytics or another privacy-reviewed Core Web Vitals monitor.
- Connect Sentry (or an equivalent error tracker) when its DSN and data-retention policy are approved.
- Review `/api/health`, Vercel logs, Supabase logs, and the payment ledger after every release.
- Send a controlled alert event after every alert-configuration change and verify delivery at `LEAD_NOTIFICATION_EMAIL`.
- Keep the repository `ALERT_WEBHOOK_URL` Actions secret synchronized when the operational alert token is rotated.
