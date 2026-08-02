# Release process

Production releases must be reproducible from Git. Do not deploy from a dirty local worktree.

1. Create a `release/*` branch from the reviewed commit.
2. Confirm `PAYMENTS_ENABLED=false`, `PAYMENT_METHOD=bank_transfer`, and `BANK_TRANSFER_BOOKINGS_ENABLED=true`.
3. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run audit:db`, `npm run build`, `npm run audit:site`, and `npm run test:e2e`.
4. Open a pull request and require the Production checks workflow to pass.
5. Merge through GitHub. Vercel must deploy the linked Git commit, not a local CLI upload.
6. Verify `/api/health`, the homepage form, admin login, invoice creation, bank-transfer reconciliation controls, and the disabled online-checkout message.
7. Tag the exact approved commit. Record the Git SHA and Vercel deployment URL in the release notes.

Rollback by promoting the previous healthy Vercel Git deployment and reverting the release commit. Database migrations require the restore procedure in `BACKUP_RESTORE.md`; never "rollback" schema with an unreviewed ad-hoc query.

## Bank-transfer trust architecture record — 2 August 2026

- Safari booking payments remain company-bank transfer only; online checkout and external payment APIs stay disabled.
- Public pages explain the booking process without publishing full bank account details.
- `/payment-information` documents beneficiary verification, bank charges, references, anti-fraud rules, reconciliation timing, and bank-detail change policy.
- `/why-wild-spine` publishes the evidence-based trust architecture using placeholders where legal identity, licensing, staff credentials, reviews, insurance, memberships, or bank details still require verification.
- Homepage, contact, landing, tour, and inquiry CTA flows now include the booking confidence panel.
- Admin invoices use the bank-transfer booking lifecycle and include legal-identity/licence placeholders, itemised pricing, deposit/balance fields, due dates, bank-charge clause, anti-fraud warning, authorised signatory, and a verification URL.
- `/verify-invoice/[token]` displays only limited invoice verification data and never exposes passport data or full bank details.
- Finance/admin bank-transfer reconciliation requires explicit statement-match confirmation before payment status changes; journey planners cannot mark transfers paid.
- Receipt creation and matched bank-transfer reconciliation create audit events.
- Automated email copy now covers proposal sent, invoice issued, transfer instructions, transfer under verification, deposit received, booking confirmed, balance reminder, and receipt issued.
- Local validation passed: typecheck, lint, unit tests, payment audit, database migration audit, site audit, production build, and Playwright E2E.

## Production hardening record — 5 July 2026

- Payments remained disabled throughout the work.
- A restricted logical backup (`20260705-205323`) captured 10 public tables, schema metadata, restore SQL, and per-file SHA-256 checksums outside Git.
- Backup row counts were re-read from production and matched every exported table.
- All five migrations were first executed inside a production transaction and rolled back cleanly.
- Migration versions `202607050001` through `202607050005` were then applied through the linked Supabase CLI project.
- Post-migration checks confirmed no row loss, RLS enabled on public submission tables, and anonymous inserts rejected.
- Upstash Redis was provisioned as `wildspine-rate-limit`; a live `PING` returned `PONG`.
- Cloudflare Turnstile was configured in Managed mode for both production hostnames. Its secret was rotated after setup, and production requires successful verification.
- `CRON_SECRET`, the protected operational alert receiver, and `ALERT_WEBHOOK_URL` were configured without storing their values in Git.
- GitHub's external production-uptime workflow checks `/api/health` every five minutes and fails if health degrades or payments become enabled.
- PR #2 passed GitHub Production checks and the Git-based Vercel preview, then merged as `1456ef3dd6b2`.
- The production health endpoint returned HTTP 200 and `healthy` on that exact release; all infrastructure checks were true and payments were false.
- Unit tests (12), E2E tests (6), typecheck, lint, build, database audit, and site audit all passed locally and in CI.
- Production rejected an unverified public submission with HTTP 403, and Redis denied the third request in a two-request sliding window across three fresh clients.
- The contact address and WhatsApp destination were verified live, and the existing administrator session loaded the production operations dashboard.
- A human-verified production form exposed a mismatched Turnstile secret before any lead was stored. The production secret was reconciled with the current Cloudflare widget, and health was upgraded from a presence check to an active credential probe.
