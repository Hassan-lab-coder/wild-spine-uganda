-- Bank-transfer-only booking controls and audit trail.

alter table public.admin_users
  add column if not exists role text;

update public.admin_users
set role = 'admin'
where role is null
  or role not in ('journey_planner', 'finance', 'admin');

alter table public.admin_users
  alter column role set default 'admin',
  alter column role set not null;

alter table public.admin_users
  drop constraint if exists admin_users_role_check,
  add constraint admin_users_role_check
  check (role in ('journey_planner', 'finance', 'admin'));

create or replace function public.current_admin_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role
  from public.admin_users
  where user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_finance_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('finance', 'admin'), false);
$$;

grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.is_finance_or_admin() to authenticated;

create or replace function public.can_insert_invoice_for_role(next_status text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select case public.current_admin_role()
    when 'admin' then true
    when 'finance' then next_status in (
      'invoice_issued',
      'awaiting_bank_transfer',
      'transfer_under_verification',
      'deposit_received',
      'reservations_in_progress',
      'booking_confirmed',
      'balance_due',
      'fully_paid'
    )
    when 'journey_planner' then next_status in (
      'inquiry_received',
      'proposal_sent',
      'itinerary_approved',
      'invoice_issued'
    )
    else false
  end;
$$;

create or replace function public.can_update_invoice_for_role(next_status text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select case public.current_admin_role()
    when 'admin' then true
    when 'finance' then next_status in (
      'awaiting_bank_transfer',
      'transfer_under_verification',
      'deposit_received',
      'reservations_in_progress',
      'booking_confirmed',
      'balance_due',
      'fully_paid'
    )
    when 'journey_planner' then next_status in (
      'inquiry_received',
      'proposal_sent',
      'itinerary_approved',
      'invoice_issued'
    )
    else false
  end;
$$;

grant execute on function public.can_insert_invoice_for_role(text) to authenticated;
grant execute on function public.can_update_invoice_for_role(text) to authenticated;

do $$
begin
  if exists (
    select 1
    from public.invoices
    where status not in (
      'draft',
      'sent',
      'paid',
      'cancelled',
      'inquiry_received',
      'proposal_sent',
      'itinerary_approved',
      'invoice_issued',
      'awaiting_bank_transfer',
      'transfer_under_verification',
      'deposit_received',
      'reservations_in_progress',
      'booking_confirmed',
      'balance_due',
      'fully_paid',
      'refunded',
      'disputed'
    )
  ) then
    raise exception 'Cannot apply bank-transfer migration: invoices contain unknown status values.';
  end if;
end $$;

update public.invoices
set status = case status
  when 'draft' then 'invoice_issued'
  when 'sent' then 'awaiting_bank_transfer'
  when 'paid' then 'fully_paid'
  when 'cancelled' then 'disputed'
  else status
end
where status in ('draft', 'sent', 'paid', 'cancelled');

alter table public.invoices
  add column if not exists verification_token text,
  add column if not exists verification_revoked_at timestamptz,
  add column if not exists verification_last_rotated_at timestamptz not null default now(),
  add column if not exists assigned_journey_planner text,
  add column if not exists deposit_amount numeric(12,2) not null default 0,
  add column if not exists non_refundable_amount numeric(12,2) not null default 0,
  add column if not exists balance_due_date date,
  add column if not exists beneficiary_legal_name text not null default 'Verified company legal name pending configuration',
  add column if not exists updated_at timestamptz not null default now();

alter table public.invoices
  alter column verification_token type text using verification_token::text;

update public.invoices
set
  verification_token = encode(gen_random_bytes(32), 'hex'),
  verification_last_rotated_at = now()
where verification_token is null
  or verification_token !~ '^[0-9a-f]{64}$';

alter table public.invoices
  alter column verification_token set default encode(gen_random_bytes(32), 'hex'),
  alter column verification_token set not null;

drop index if exists public.invoices_verification_token_idx;
create unique index invoices_active_verification_token_idx
  on public.invoices (verification_token)
  where verification_revoked_at is null;
create index if not exists invoices_verification_revoked_idx
  on public.invoices (verification_revoked_at);

alter table public.invoices
  drop constraint if exists invoices_status_check,
  add constraint invoices_status_check
  check (status in (
    'inquiry_received',
    'proposal_sent',
    'itinerary_approved',
    'invoice_issued',
    'awaiting_bank_transfer',
    'transfer_under_verification',
    'deposit_received',
    'reservations_in_progress',
    'booking_confirmed',
    'balance_due',
    'fully_paid',
    'refunded',
    'disputed'
  ));

alter table public.invoices
  drop constraint if exists invoices_deposit_amount_check,
  add constraint invoices_deposit_amount_check
  check (deposit_amount >= 0 and non_refundable_amount >= 0);

create table if not exists public.bank_transfer_reconciliations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  bank_transaction_reference text not null,
  sender_name text not null,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  value_date date not null,
  invoice_reference text not null,
  status text not null default 'matched',
  transfer_advice_received boolean not null default false,
  reconciled_by uuid references auth.users(id) on delete set null,
  reconciled_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bank_transfer_reconciliations enable row level security;

alter table public.bank_transfer_reconciliations
  drop constraint if exists bank_transfer_reconciliations_status_check,
  add constraint bank_transfer_reconciliations_status_check
  check (status in ('matched', 'unmatched', 'rejected'));

alter table public.bank_transfer_reconciliations
  drop constraint if exists bank_transfer_reconciliations_amount_check,
  add constraint bank_transfer_reconciliations_amount_check
  check (amount > 0);

create unique index if not exists bank_transfer_reconciliations_reference_idx
  on public.bank_transfer_reconciliations (lower(bank_transaction_reference));
create index if not exists bank_transfer_reconciliations_invoice_idx
  on public.bank_transfer_reconciliations (invoice_id, reconciled_at desc);
create index if not exists bank_transfer_reconciliations_status_idx
  on public.bank_transfer_reconciliations (status, reconciled_at desc);

create table if not exists public.invoice_audit_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  event_type text not null,
  old_status text,
  new_status text,
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.invoice_audit_events enable row level security;

create index if not exists invoice_audit_events_invoice_idx
  on public.invoice_audit_events (invoice_id, created_at desc);
create index if not exists invoice_audit_events_type_idx
  on public.invoice_audit_events (event_type, created_at desc);

create table if not exists public.financial_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  invoice_id uuid references public.invoices(id) on delete restrict,
  receipt_id uuid references public.receipts(id) on delete restrict,
  document_number text not null,
  version integer not null,
  generated_by uuid references auth.users(id) on delete set null,
  generated_by_role text,
  generated_at timestamptz not null default now(),
  verification_url text,
  qr_payload text,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint financial_documents_subject_check check (invoice_id is not null or receipt_id is not null),
  constraint financial_documents_type_check check (document_type in ('invoice', 'receipt')),
  constraint financial_documents_version_check check (version > 0),
  constraint financial_documents_hash_check check (content_hash ~ '^sha256:[a-f0-9]{64}$'),
  constraint financial_documents_version_unique unique (document_type, document_number, version)
);

alter table public.financial_documents enable row level security;

create index if not exists financial_documents_invoice_idx
  on public.financial_documents (invoice_id, version desc);
create index if not exists financial_documents_receipt_idx
  on public.financial_documents (receipt_id, version desc);
create index if not exists financial_documents_hash_idx
  on public.financial_documents (content_hash);

create or replace function public.block_financial_history_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'Financial history is append-only; create a new audit or correction event instead.';
end;
$$;

drop trigger if exists bank_transfer_reconciliations_no_update on public.bank_transfer_reconciliations;
create trigger bank_transfer_reconciliations_no_update
  before update on public.bank_transfer_reconciliations
  for each row execute function public.block_financial_history_mutation();

drop trigger if exists bank_transfer_reconciliations_no_delete on public.bank_transfer_reconciliations;
create trigger bank_transfer_reconciliations_no_delete
  before delete on public.bank_transfer_reconciliations
  for each row execute function public.block_financial_history_mutation();

drop trigger if exists invoice_audit_events_no_update on public.invoice_audit_events;
create trigger invoice_audit_events_no_update
  before update on public.invoice_audit_events
  for each row execute function public.block_financial_history_mutation();

drop trigger if exists invoice_audit_events_no_delete on public.invoice_audit_events;
create trigger invoice_audit_events_no_delete
  before delete on public.invoice_audit_events
  for each row execute function public.block_financial_history_mutation();

drop trigger if exists financial_documents_no_update on public.financial_documents;
create trigger financial_documents_no_update
  before update on public.financial_documents
  for each row execute function public.block_financial_history_mutation();

drop trigger if exists financial_documents_no_delete on public.financial_documents;
create trigger financial_documents_no_delete
  before delete on public.financial_documents
  for each row execute function public.block_financial_history_mutation();

grant select on public.bank_transfer_reconciliations to authenticated;
grant select on public.invoice_audit_events to authenticated;
grant select on public.financial_documents to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select, insert on public.receipts to authenticated;

revoke insert, update, delete on public.bank_transfer_reconciliations from anon, authenticated;
revoke insert, update, delete on public.invoice_audit_events from anon, authenticated;
revoke insert, update, delete on public.financial_documents from anon, authenticated;
revoke update, delete on public.receipts from authenticated;
revoke delete on public.invoices from authenticated;

revoke insert, update on public.payment_requests from authenticated;

drop policy if exists "Admins can read bank transfer reconciliations" on public.bank_transfer_reconciliations;
create policy "Admins can read bank transfer reconciliations"
  on public.bank_transfer_reconciliations
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read invoice audit events" on public.invoice_audit_events;
create policy "Admins can read invoice audit events"
  on public.invoice_audit_events
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read financial documents" on public.financial_documents;
create policy "Admins can read financial documents"
  on public.financial_documents
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create invoices" on public.invoices;
create policy "Role based invoice creation"
  on public.invoices
  for insert
  to authenticated
  with check (public.can_insert_invoice_for_role(status));

drop policy if exists "Admins can update invoices" on public.invoices;
create policy "Role based invoice updates"
  on public.invoices
  for update
  to authenticated
  using (public.is_admin())
  with check (public.can_update_invoice_for_role(status));

drop policy if exists "Admins can create receipts" on public.receipts;
create policy "Finance or admin can create receipts"
  on public.receipts
  for insert
  to authenticated
  with check (public.is_finance_or_admin());

drop policy if exists "Admins can update receipts" on public.receipts;

alter table public.email_automation_events
  drop constraint if exists email_automation_events_event_type_check,
  add constraint email_automation_events_event_type_check
  check (event_type in (
    'instant_acknowledgement',
    'planning_follow_up_24h',
    'permit_urgency_follow_up_72h',
    'guide_delivery',
    'guide_follow_up_48h',
    'proposal_sent',
    'invoice_issued',
    'transfer_instructions',
    'transfer_under_verification',
    'deposit_received',
    'booking_confirmed',
    'balance_reminder',
    'receipt_issued'
  ));
