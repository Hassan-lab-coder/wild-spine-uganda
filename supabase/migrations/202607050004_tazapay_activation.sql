-- Tazapay-specific payment request constraints.

alter table public.payment_requests
  drop constraint if exists payment_requests_provider_check,
  add constraint payment_requests_provider_check
  check (provider in ('manual', 'stripe', 'flutterwave', 'tazapay'));
