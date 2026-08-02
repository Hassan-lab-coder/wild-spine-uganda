# Wild Spine Uganda bank-transfer rollout report

Date: 2026-08-02  
Branch: `codex/bank-transfer-trust`  
Deployment status: not deployed  
Migration status: not applied to production  
Backup status: production pre-migration backup created and checksum-verified on 2026-08-02

## Summary

The branch moves Wild Spine Uganda to a bank-transfer-only booking and trust architecture. Online checkout remains disabled, active gateway code is removed, public bank details are not exposed, invoice verification is tokenized and rate-limited, finance/admin reconciliation is required before payment status changes, and financial document generation is versioned, hashed, QR-linked, and append-only.

## Changed files

Primary areas changed:

- Payment and bank-transfer controls: `src/lib/bank-transfer.ts`, `src/lib/payment-guard.ts`, `src/lib/server-banking-config.ts`, `scripts/check-bank-transfer-readiness.mts`.
- Public trust architecture: `src/app/page.tsx`, `src/app/payment-information/page.tsx`, `src/app/why-wild-spine/page.tsx`, `src/app/components/PlanWithConfidence.tsx`, `src/app/components/BookingConfidencePanel.tsx`.
- Admin finance operations: `src/app/admin/page.tsx`, `src/app/admin/PaymentLinkPanel.tsx`, `src/app/api/admin/bank-transfer-reconciliations/route.ts`, `src/app/api/admin/financial-documents/route.ts`.
- Invoice verification and payment-disabled APIs: `src/app/verify-invoice/[token]/page.tsx`, `src/app/api/payment-links/route.ts`, `src/app/api/payments/config/route.ts`, `src/app/api/payments/status/route.ts`.
- Migration and database audit: `supabase/migrations/202608020001_bank_transfer_booking_controls.sql`, `scripts/validate-migrations.mjs`, `src/lib/supabase.ts`.
- Monitoring, runbooks, release docs: `MONITORING.md`, `OPERATIONS_RUNBOOK.md`, `PAYMENTS_ON_HOLD.md`, `RELEASE.md`, `MIGRATION_DEPLOYMENT_CHECKLIST.md`, `SECURITY.md`, `README.md`.
- Tests: `src/lib/bank-transfer.test.mts`, `src/lib/server-banking-config.test.mts`, `src/lib/payment-guard.test.mts`, `tests/e2e/release-safety.spec.ts`.
- Removed active gateway code/scripts: `src/lib/payments.ts`, `src/lib/payments.test.mts`, the former gateway webhook route, the former gateway activation script, and the former payment-readiness script.
- Dependency update: `qrcode` added for local QR SVG generation; `@types/qrcode` added as a dev dependency.

## Migration review

Migration reviewed: `202608020001_bank_transfer_booking_controls.sql`.

Findings and corrections:

- Initial blocker found: `bank_transfer_reconciliations` and `invoice_audit_events` used `ON DELETE CASCADE`, which could erase financial/audit history if an invoice were deleted. Corrected to `ON DELETE RESTRICT` for reconciliations and `ON DELETE SET NULL` for audit events.
- Restore-test blocker found: the legacy invoice status constraint rejected converted bank-transfer statuses during the migration `UPDATE`. Corrected by validating legacy statuses first, dropping the old `invoices_status_check`, converting status values, and then adding the final bank-transfer status constraint.
- No table drops, column drops, truncates, or data deletes remain in the migration.
- Existing invoice statuses are converted only for known legacy values:
  - `draft` -> `invoice_issued`
  - `sent` -> `awaiting_bank_transfer`
  - `paid` -> `fully_paid`
  - `cancelled` -> `disputed`
- Unknown invoice statuses now abort the migration before the new status constraint is applied.
- Admin roles are normalized before the role constraint is enforced.
- Audit, reconciliation, and financial document ledger tables are append-only through database triggers blocking `UPDATE` and `DELETE`.
- Direct authenticated `INSERT`, `UPDATE`, and `DELETE` grants are revoked for reconciliation, audit, and document-ledger tables.
- Invoice update RLS is role-aware. Journey planners are limited to planning/proposal states, finance to bank-transfer payment states, and admin to corrections/refunds.
- Receipt creation is restricted to finance/admin; receipt updates are revoked.
- Duplicate bank transaction references are blocked by a case-insensitive unique index.
- Invoice verification tokens are upgraded to 64-character random hex tokens generated with `gen_random_bytes(32)`.
- Token revocation support is added with `verification_revoked_at`; verification queries ignore revoked tokens.
- Financial documents are stored in an append-only ledger with version number, generation timestamp, issuer role, verification URL, QR payload, content hash, and metadata.

Rollback risk:

- Status conversion is intentionally one-way. A tested production backup is required before applying the migration.
- If unknown statuses are present, the migration aborts and production should not be changed until the data is reviewed.
- Do not perform ad-hoc schema rollback; restore from the tested backup if data correctness is at risk.

## Security findings

- Online checkout remains disabled.
- No active online checkout route remains in active app code.
- Full bank account details are read only from server-side env vars and are not exposed to public pages or client-side bundles.
- Reconciliation status changes require cleared-fund confirmation and finance/admin role.
- Transfer advice, screenshots, emails, or uploaded proof cannot mark an invoice paid.
- Invoice verification reveals only limited fields: validity, invoice reference, traveller initials, trip title, amount, currency, due date, beneficiary legal name, and payment status.
- Suspicious invoice verification traffic is rate-limited and alertable.
- `npm audit --omit=dev` still reports high-severity advisories in the existing `next`/`postcss`/`sharp` dependency chain. Do not force-upgrade inside this rollout; schedule a separate framework security update.

## Monitoring and alerts added

Alertable events now include:

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
- `email_delivery_failure`
- `suspicious_invoice_verification_traffic`

`/api/health` now checks:

- online checkout disabled;
- bank-transfer method enabled;
- server-only banking config complete;
- beneficiary matches legal entity;
- no `NEXT_PUBLIC_BANK_TRANSFER_*` env vars.

## Backup and dry-run status

Completed on 2026-08-02:

- Backup ID: `20260802-130120-bank-transfer-pre-migration`
- Backup location: `C:\Users\Yoga\wildspine-backups\20260802-130120-bank-transfer-pre-migration`
- Backup files:
  - `schema-public.sql` — 24,924 bytes
  - `data-public.sql` — 1,718,895 bytes
  - `roles.sql` — 297 bytes
  - `manifest.json`
  - `SHA256SUMS.txt`
- SHA-256 verification: passed.
- Backup was stored outside the repository and should not be committed or uploaded to an unapproved service.
- Safe row-count summary from the data dump:
  - `admin_users`: 1
  - `analytics_events`: 1,979
  - `email_automation_events`: 16
  - `guide_leads`: 6
  - `inbound_emails`: 29
  - `invoices`: 7
  - `itinerary_requests`: 31
  - `payment_requests`: 6
  - `payment_webhook_events`: 16
  - `receipts`: 1
  - `volunteer_applications`: 0
- Supabase dry-run result: `npx supabase db push --linked --dry-run` reported exactly one pending migration, `202608020001_bank_transfer_booking_controls.sql`; no migration was pushed.
- Disposable local restore test: passed after the migration-order fix.
  - Restored the verified schema/data backup into a disposable Docker database using the Supabase Postgres image.
  - Applied `202608020001_bank_transfer_booking_controls.sql` locally only.
  - Verified invoice and receipt row counts.
  - Verified invoice status conversion resulted in `invoice_issued` and `fully_paid` only for the current restored data.
  - Verified 64-character verification tokens, uniqueness, immutable triggers, duplicate bank-reference blocking, audit-event immutability, and financial-document immutability.
  - Removed the disposable Docker container after the test.

Operational note: `npx supabase db dump --linked --dry-run` prints connection credentials into terminal output. Treat local terminal/session logs as sensitive and rotate the database password after the migration window.

Invalid backup placeholders were created before Docker was ready:

- `C:\Users\Yoga\wildspine-backups\20260802-124450-bank-transfer-pre-migration`
- `C:\Users\Yoga\wildspine-backups\20260802-124919-bank-transfer-pre-migration`

Those folders contain zero-byte dump files and must not be used as backups.

## Unresolved blockers before production

- Managed Supabase staging migration has not been applied in this run. A disposable local restore/migration test passed, but a real Supabase staging project remains recommended before production.
- Production migration has not been applied.
- Production deployment has not been performed.
- Server-only banking env vars are placeholders until verified legal/bank details are entered.
- Legal identity, licensing, insurance, staff credentials, reviews, memberships, and bank details remain placeholders until verified.
- Live RLS/trigger behavior still needs staging verification against Supabase after migration apply.
- Existing framework dependency advisories require a separate security-update PR.

## Deployment steps

1. Review and commit this branch.
2. Create a production Supabase backup and verify row counts.
3. Restore that backup into staging or a disposable Supabase project.
4. Apply `202608020001_bank_transfer_booking_controls.sql` to staging.
5. Verify RLS, triggers, token revocation, duplicate-reference blocking, document ledger insert, and role separation in staging.
6. Configure server-only banking env vars in Vercel:
   - `BANK_TRANSFER_LEGAL_ENTITY_NAME`
   - `BANK_TRANSFER_BENEFICIARY_NAME`
   - `BANK_TRANSFER_BANK_NAME`
   - `BANK_TRANSFER_ACCOUNT_NUMBER`
   - `BANK_TRANSFER_SWIFT_BIC`
   - `BANK_TRANSFER_BRANCH_NAME`
   - `BANK_TRANSFER_CURRENCY`
   - `BANK_TRANSFER_BANK_INSTRUCTIONS_APPROVED_BY`
7. Confirm no `NEXT_PUBLIC_BANK_TRANSFER_*` variables exist.
8. Run the full validation suite.
9. Apply migration to production in a reviewed change window.
10. Deploy through Git only.
11. Verify `/api/health`, `/api/payments/config`, `/api/payment-links`, `/payment-information`, `/verify-invoice/[token]`, admin invoice generation, receipt generation, and bank-transfer reconciliation.

## Rollback steps

Application rollback:

1. Promote the previous healthy Vercel Git deployment.
2. Keep the migrated database intact unless data correctness is compromised.
3. Disable bank-transfer booking publication if banking config is not verified.

Database rollback:

1. Stop writes.
2. Restore the tested pre-migration backup into an isolated project.
3. Compare row counts and financial records.
4. Obtain approval before replacing production.
5. Never delete audit/reconciliation/document-ledger rows manually.

## Acceptance evidence

- Payments remain disabled: `npm run audit:payments`, `/api/payments/config`, and `/api/payment-links` E2E.
- No complete bank details public: E2E scans public HTML and `_next` scripts for banking env names; `/payment-information` contains no account numbers.
- Transfer advice does not mark paid: unit tests prove confirmation requires cleared funds and finance/admin role; server route rejects matched reconciliation without explicit statement confirmation.
- Direct API role bypass fails: E2E posts to admin reconciliation/document APIs without session and receives a closed response.
- Audit events cannot be edited/deleted: migration adds immutable triggers and the DB audit enforces them.
- Invalid invoice tokens reveal no information: E2E checks UUID-shaped and malformed tokens both show the generic invalid page.
- Refund/correction requires admin: unit tests and server route enforce admin-only `refunded`/`disputed` transitions.
- Duplicate reconciliation is blocked: migration uses a case-insensitive unique bank-reference index and DB audit enforces its presence.
- Status transitions follow the allowed state machine: unit tests cover journey planner, finance, and admin transitions.
- Invoice verification hardened: 256-bit tokens, revocation column, rate limiting, no sensitive fields, no bank details.
- Documents hardened: admin route records version, generated timestamp, issuer role, verification URL/QR payload, QR SVG, and SHA-256 hash before print/save-PDF.

## Validation results

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm test` — passed, 13 tests
- `npm run audit:payments` — passed with placeholder warnings for unconfigured bank values
- `npm run audit:db` — passed, 6 ordered migrations
- `npm run audit:site` — passed
- `npm run build` — passed
- `npm run test:e2e` — passed, 8 tests
