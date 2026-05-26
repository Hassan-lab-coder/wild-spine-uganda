create extension if not exists "pgcrypto";

create table if not exists public.itinerary_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  country text,
  travel_month text,
  route text,
  message text,
  status text not null default 'new',
  lead_source text,
  admin_notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.guide_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'guide',
  status text not null default 'new',
  admin_notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.volunteer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  country text,
  program text,
  motivation text,
  status text not null default 'new',
  lead_source text,
  admin_notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_name text not null,
  client_email text,
  client_phone text,
  trip_name text,
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'USD',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'draft',
  notes text,
  line_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  invoice_id uuid references public.invoices(id) on delete set null,
  invoice_number text,
  client_name text not null,
  client_email text,
  payment_date date not null default current_date,
  currency text not null default 'USD',
  amount numeric(12,2) not null default 0,
  payment_method text not null default 'bank_transfer',
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.itinerary_requests add column if not exists admin_notes text;
alter table public.itinerary_requests add column if not exists follow_up_at timestamptz;
alter table public.itinerary_requests add column if not exists phone text;
alter table public.itinerary_requests add column if not exists lead_source text;
alter table public.guide_leads add column if not exists status text not null default 'new';
alter table public.guide_leads add column if not exists admin_notes text;
alter table public.guide_leads add column if not exists follow_up_at timestamptz;
alter table public.volunteer_applications add column if not exists admin_notes text;
alter table public.volunteer_applications add column if not exists follow_up_at timestamptz;
alter table public.volunteer_applications add column if not exists phone text;
alter table public.volunteer_applications add column if not exists lead_source text;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.itinerary_requests enable row level security;
alter table public.guide_leads enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.invoices enable row level security;
alter table public.receipts enable row level security;
alter table public.admin_users enable row level security;
alter table public.analytics_events enable row level security;

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant insert on public.itinerary_requests to anon, authenticated;
grant select, update on public.itinerary_requests to authenticated;
grant insert on public.guide_leads to anon, authenticated;
grant select, update on public.guide_leads to authenticated;
grant insert on public.volunteer_applications to anon, authenticated;
grant select, update on public.volunteer_applications to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select, insert, update on public.receipts to authenticated;
grant select on public.admin_users to authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

drop policy if exists "Anyone can create itinerary requests" on public.itinerary_requests;
drop policy if exists "Public can create itinerary requests" on public.itinerary_requests;
create policy "Anyone can create itinerary requests"
  on public.itinerary_requests
  for insert
  to public
  with check (true);

drop policy if exists "Authenticated users can read itinerary requests" on public.itinerary_requests;
drop policy if exists "Admins can read itinerary requests" on public.itinerary_requests;
create policy "Admins can read itinerary requests"
  on public.itinerary_requests
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated users can update itinerary requests" on public.itinerary_requests;
drop policy if exists "Admins can update itinerary requests" on public.itinerary_requests;
create policy "Admins can update itinerary requests"
  on public.itinerary_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can create guide leads" on public.guide_leads;
drop policy if exists "Public can create guide leads" on public.guide_leads;
create policy "Anyone can create guide leads"
  on public.guide_leads
  for insert
  to public
  with check (true);

drop policy if exists "Authenticated users can read guide leads" on public.guide_leads;
drop policy if exists "Admins can read guide leads" on public.guide_leads;
create policy "Admins can read guide leads"
  on public.guide_leads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated users can update guide leads" on public.guide_leads;
drop policy if exists "Admins can update guide leads" on public.guide_leads;
create policy "Admins can update guide leads"
  on public.guide_leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can create volunteer applications" on public.volunteer_applications;
drop policy if exists "Public can create volunteer applications" on public.volunteer_applications;
create policy "Anyone can create volunteer applications"
  on public.volunteer_applications
  for insert
  to public
  with check (true);

drop policy if exists "Authenticated users can read volunteer applications" on public.volunteer_applications;
drop policy if exists "Admins can read volunteer applications" on public.volunteer_applications;
create policy "Admins can read volunteer applications"
  on public.volunteer_applications
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated users can update volunteer applications" on public.volunteer_applications;
drop policy if exists "Admins can update volunteer applications" on public.volunteer_applications;
create policy "Admins can update volunteer applications"
  on public.volunteer_applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read invoices" on public.invoices;
create policy "Admins can read invoices"
  on public.invoices
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create invoices" on public.invoices;
create policy "Admins can create invoices"
  on public.invoices
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update invoices" on public.invoices;
create policy "Admins can update invoices"
  on public.invoices
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read receipts" on public.receipts;
create policy "Admins can read receipts"
  on public.receipts
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create receipts" on public.receipts;
create policy "Admins can create receipts"
  on public.receipts
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update receipts" on public.receipts;
create policy "Admins can update receipts"
  on public.receipts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can read their own admin profile" on public.admin_users;
create policy "Users can read their own admin profile"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Anyone can create analytics events" on public.analytics_events;
create policy "Anyone can create analytics events"
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can read analytics events" on public.analytics_events;
create policy "Admins can read analytics events"
  on public.analytics_events
  for select
  to authenticated
  using (public.is_admin());

create index if not exists itinerary_requests_created_at_idx on public.itinerary_requests (created_at desc);
create index if not exists itinerary_requests_status_idx on public.itinerary_requests (status);
create index if not exists itinerary_requests_lead_source_idx on public.itinerary_requests (lead_source);
create index if not exists itinerary_requests_follow_up_at_idx on public.itinerary_requests (follow_up_at);
create index if not exists guide_leads_created_at_idx on public.guide_leads (created_at desc);
create index if not exists guide_leads_status_idx on public.guide_leads (status);
create index if not exists volunteer_applications_created_at_idx on public.volunteer_applications (created_at desc);
create index if not exists volunteer_applications_status_idx on public.volunteer_applications (status);
create index if not exists volunteer_applications_lead_source_idx on public.volunteer_applications (lead_source);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_invoice_number_idx on public.invoices (invoice_number);
create index if not exists receipts_created_at_idx on public.receipts (created_at desc);
create index if not exists receipts_receipt_number_idx on public.receipts (receipt_number);
create index if not exists receipts_invoice_id_idx on public.receipts (invoice_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

alter table public.itinerary_requests
  drop constraint if exists itinerary_requests_status_check,
  add constraint itinerary_requests_status_check
  check (status in ('new', 'contacted', 'qualified', 'confirmed', 'closed'));

alter table public.guide_leads
  drop constraint if exists guide_leads_status_check,
  add constraint guide_leads_status_check
  check (status in ('new', 'contacted', 'qualified', 'confirmed', 'closed'));

alter table public.volunteer_applications
  drop constraint if exists volunteer_applications_status_check,
  add constraint volunteer_applications_status_check
  check (status in ('new', 'contacted', 'qualified', 'confirmed', 'closed'));

alter table public.invoices
  drop constraint if exists invoices_status_check,
  add constraint invoices_status_check
  check (status in ('draft', 'sent', 'paid', 'cancelled'));
