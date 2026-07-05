-- Payment reconciliation ledger.
create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  provider_reference text,
  payment_request_id uuid references public.payment_requests(id) on delete set null,
  payload jsonb not null,
  processing_status text not null default 'received',
  processing_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

alter table public.payment_requests add column if not exists public_token uuid not null default gen_random_uuid();
alter table public.payment_requests add column if not exists updated_at timestamptz not null default now();
alter table public.payment_requests add column if not exists paid_at timestamptz;
alter table public.payment_requests add column if not exists expires_at timestamptz;
alter table public.payment_requests add column if not exists last_event_at timestamptz;

alter table public.receipts add column if not exists payment_request_id uuid references public.payment_requests(id) on delete set null;

alter table public.payment_requests
  drop constraint if exists payment_requests_status_check,
  add constraint payment_requests_status_check
  check (status in ('creating', 'pending', 'paid', 'failed', 'cancelled', 'expired'));

create unique index if not exists payment_requests_public_token_idx
  on public.payment_requests (public_token);

create unique index if not exists payment_requests_one_active_provider_idx
  on public.payment_requests (invoice_id, provider)
  where invoice_id is not null and status in ('creating', 'pending', 'paid');

drop index if exists public.receipts_payment_request_id_idx;
alter table public.receipts
  drop constraint if exists receipts_payment_request_id_unique,
  add constraint receipts_payment_request_id_unique unique (payment_request_id);

create index if not exists payment_webhook_events_created_at_idx
  on public.payment_webhook_events (created_at desc);

create index if not exists payment_webhook_events_payment_request_idx
  on public.payment_webhook_events (payment_request_id);

alter table public.payment_webhook_events enable row level security;
grant select on public.payment_webhook_events to authenticated;

drop policy if exists "Admins can read payment webhook events" on public.payment_webhook_events;
create policy "Admins can read payment webhook events"
  on public.payment_webhook_events
  for select
  to authenticated
  using (public.is_admin());
