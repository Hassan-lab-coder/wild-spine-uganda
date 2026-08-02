# Bank-transfer migration deployment checklist

Do not deploy this migration from a dirty laptop workspace. Production must be backed up, tested, reviewed, and applied from the approved Git commit.

## 1. Production backup

- Record the Git SHA, Supabase project ref, current production URL, and current migration list.
- Create a fresh Supabase logical backup covering schema, RLS policies, functions, triggers, and all public tables.
- Export row counts for `invoices`, `receipts`, `admin_users`, `email_automation_events`, and public lead tables.
- Store backup artifacts outside Git with SHA-256 checksums.
- Confirm the backup includes financial tables and authentication references needed to restore invoice/payment history.

## 2. Restoration test

- Restore the backup into a disposable Supabase project or local database.
- Verify row counts match the production export.
- Confirm admin login, invoice list, receipt list, and public lead tables are readable in the restored environment.
- Document the restore command, timestamp, operator, and result.

## 3. Staging application

- Apply `202608020001_bank_transfer_booking_controls.sql` to staging first.
- Confirm no destructive operations ran: no table drops, no column drops, no cascade deletion of reconciliation/audit history.
- Confirm legacy invoice statuses converted as expected:
  - `draft` -> `invoice_issued`
  - `sent` -> `awaiting_bank_transfer`
  - `paid` -> `fully_paid`
  - `cancelled` -> `disputed`
- Confirm unknown invoice statuses would fail the migration before constraints are applied.

## 4. Database audit

- Run `npm run audit:db`.
- Confirm append-only triggers exist on:
  - `bank_transfer_reconciliations`
  - `invoice_audit_events`
  - `financial_documents`
- Confirm authenticated users cannot directly insert/update/delete reconciliation, audit, or financial document ledger rows.
- Confirm the case-insensitive duplicate bank transaction reference index exists.
- Confirm invoice verification tokens are 64-character random hex strings and revoked tokens are ignored.

## 5. Production application

- Confirm `PAYMENTS_ENABLED=false`, `PAYMENT_METHOD=bank_transfer`, and `BANK_TRANSFER_BOOKINGS_ENABLED=true`.
- Confirm no `NEXT_PUBLIC_BANK_TRANSFER_*` variables exist.
- Confirm verified banking values are configured only as server-side env vars.
- Apply the migration in a reviewed change window.
- Capture migration output and row counts immediately after apply.

## 6. Post-migration verification

- Run:
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run audit:payments`
  - `npm run audit:db`
  - `npm run audit:site`
  - `npm run build`
  - `npm run test:e2e`
- Verify `/api/health`.
- Verify `/api/payments/config` reports disabled online checkout and bank-transfer bookings enabled.
- Verify `/api/payment-links` returns the disabled bank-transfer response.
- Verify `/payment-information` does not expose full account details.
- Verify `/verify-invoice/[token]` shows only limited invoice fields and rejects revoked/invalid tokens.
- Verify finance/admin can reconcile a controlled staging bank transfer.
- Verify journey planner cannot reconcile or create receipts.
- Verify audit, reconciliation, and document ledger rows cannot be updated or deleted.

## Rollback readiness

- If migration fails before commit, stop and restore from the tested backup.
- If application deploy fails after migration, promote the previous healthy Git deployment while preserving the migrated database.
- Do not attempt ad-hoc schema rollback. Use the tested restore procedure when data correctness is at risk.
