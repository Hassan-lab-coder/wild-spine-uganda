# Gateway payments on hold

Online checkout is intentionally disabled. `PAYMENTS_ENABLED=false` remains a release guard, `/api/payment-links` returns a controlled `503`, and the admin interface does not expose a public checkout link.

Wild Spine Uganda's approved booking payment method is verified company-bank transfer:

- `PAYMENT_METHOD=bank_transfer`
- `BANK_TRANSFER_BOOKINGS_ENABLED=true`
- full bank details are invoice/admin-only;
- public pages explain the process without publishing full account numbers;
- transfer advice or screenshots are never treated as proof of payment;
- finance/admin reconciliation is required before payment status changes;
- receipts are issued only after authorised bank reconciliation.

Do not enable any online checkout provider without a separate written release plan, legal/accounting review, provider approval, signed-webhook proof, refund procedure, and controlled acceptance test.

The production health and uptime checks deliberately fail if `PAYMENTS_ENABLED` changes to true.
