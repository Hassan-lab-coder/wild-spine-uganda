# Monitoring

Use `/api/health` for uptime checks. A healthy response requires Supabase connectivity, a successful Upstash `PING`, an active Cloudflare validation probe for the configured Turnstile secret, cron authentication, a complete alert path (`ALERT_WEBHOOK_URL`, `ALERT_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `LEAD_NOTIFICATION_EMAIL`), online checkout disabled, and bank-transfer bookings enabled. The GitHub `Production uptime` workflow checks this endpoint from outside Vercel every five minutes; its failure is independent evidence when the application cannot call its own alert receiver.

Server events are emitted as structured JSON in Vercel logs. Bank-transfer reconciliation failures, rejected matches, lead-save failures, invoice/receipt generation failures, suspicious invoice verification traffic, and operational health failures should call the protected `/api/operations/alert` receiver through `ALERT_WEBHOOK_URL`; the receiver sends an operational email through Resend. The logger excludes common personal and secret-bearing fields.

Bank-transfer alert events to route:

- `unmatched_bank_transfer_recorded`
- `duplicate_bank_transfer_reference`
- `unauthorised_reconciliation_attempt`
- `unauthorised_reconciliation_correction_attempt`
- `invalid_invoice_status_transition_attempt`
- `transfer_proof_without_reconciliation_confirmation`
- `banking_configuration_mismatch`
- `invoice_beneficiary_mismatch`
- `invoice_generation_failure`
- `receipt_generation_failure`
- `operational_alert_delivery_failed`
- `suspicious_invoice_verification_traffic`

Production checklist:

- Create alerts for elevated 5xx responses, lead-save failures, cron failures, bank-transfer reconciliation events, document-generation failures, email-delivery failures, and suspicious invoice-verification traffic.
- Connect Vercel Web Analytics or another privacy-reviewed Core Web Vitals monitor.
- Connect Sentry (or an equivalent error tracker) when its DSN and data-retention policy are approved.
- Review `/api/health`, Vercel logs, Supabase logs, invoice audit events, and bank-transfer reconciliations after every release.
- Send a controlled alert event after every alert-configuration change and verify delivery at `LEAD_NOTIFICATION_EMAIL`.
- Keep the repository `ALERT_WEBHOOK_URL` Actions secret synchronized when the operational alert token is rotated.
