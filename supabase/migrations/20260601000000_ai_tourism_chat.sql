create extension if not exists "pgcrypto";

create table if not exists public.chatbot_conversations (
  id uuid primary key default gen_random_uuid(),
  page_path text,
  status text not null default 'open',
  booking_intent boolean not null default false,
  metadata jsonb,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.chatbot_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid unique references public.chatbot_conversations(id) on delete set null,
  name text not null,
  email text not null,
  country text,
  travel_month text,
  travelers integer,
  preferred_tour text,
  status text not null default 'new',
  lead_source text default 'ai_chat',
  page_path text,
  booking_intent boolean not null default true,
  transcript_summary text,
  admin_notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chatbot_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.chatbot_conversations add column if not exists page_path text;
alter table public.chatbot_conversations add column if not exists status text not null default 'open';
alter table public.chatbot_conversations add column if not exists booking_intent boolean not null default false;
alter table public.chatbot_conversations add column if not exists metadata jsonb;
alter table public.chatbot_conversations add column if not exists last_message_at timestamptz not null default now();

alter table public.chatbot_leads add column if not exists conversation_id uuid;
alter table public.chatbot_leads add column if not exists country text;
alter table public.chatbot_leads add column if not exists travel_month text;
alter table public.chatbot_leads add column if not exists travelers integer;
alter table public.chatbot_leads add column if not exists preferred_tour text;
alter table public.chatbot_leads add column if not exists status text not null default 'new';
alter table public.chatbot_leads add column if not exists lead_source text default 'ai_chat';
alter table public.chatbot_leads add column if not exists page_path text;
alter table public.chatbot_leads add column if not exists booking_intent boolean not null default true;
alter table public.chatbot_leads add column if not exists transcript_summary text;
alter table public.chatbot_leads add column if not exists admin_notes text;
alter table public.chatbot_leads add column if not exists follow_up_at timestamptz;
alter table public.chatbot_leads add column if not exists updated_at timestamptz not null default now();

alter table public.chatbot_messages add column if not exists metadata jsonb;

alter table public.chatbot_conversations enable row level security;
alter table public.chatbot_leads enable row level security;
alter table public.chatbot_messages enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.chatbot_conversations to service_role;
grant select, update on public.chatbot_conversations to authenticated;
grant select, insert, update, delete on public.chatbot_leads to service_role;
grant select, update on public.chatbot_leads to authenticated;
grant select, insert, update, delete on public.chatbot_messages to service_role;
grant select on public.chatbot_messages to authenticated;

drop policy if exists "Anyone can create chatbot conversations" on public.chatbot_conversations;
drop policy if exists "Anyone can create chatbot leads" on public.chatbot_leads;
drop policy if exists "Anyone can create chatbot messages" on public.chatbot_messages;

drop policy if exists "Admins can read chatbot conversations" on public.chatbot_conversations;
create policy "Admins can read chatbot conversations"
  on public.chatbot_conversations
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update chatbot conversations" on public.chatbot_conversations;
create policy "Admins can update chatbot conversations"
  on public.chatbot_conversations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read chatbot leads" on public.chatbot_leads;
create policy "Admins can read chatbot leads"
  on public.chatbot_leads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update chatbot leads" on public.chatbot_leads;
create policy "Admins can update chatbot leads"
  on public.chatbot_leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read chatbot messages" on public.chatbot_messages;
create policy "Admins can read chatbot messages"
  on public.chatbot_messages
  for select
  to authenticated
  using (public.is_admin());

create index if not exists chatbot_conversations_created_at_idx on public.chatbot_conversations (created_at desc);
create index if not exists chatbot_conversations_last_message_at_idx on public.chatbot_conversations (last_message_at desc);
create index if not exists chatbot_conversations_status_idx on public.chatbot_conversations (status);
create index if not exists chatbot_leads_created_at_idx on public.chatbot_leads (created_at desc);
create index if not exists chatbot_leads_status_idx on public.chatbot_leads (status);
create index if not exists chatbot_leads_email_idx on public.chatbot_leads (lower(email));
create index if not exists chatbot_leads_follow_up_at_idx on public.chatbot_leads (follow_up_at);
create index if not exists chatbot_messages_conversation_id_idx on public.chatbot_messages (conversation_id);
create index if not exists chatbot_messages_created_at_idx on public.chatbot_messages (created_at);

alter table public.chatbot_conversations
  drop constraint if exists chatbot_conversations_status_check,
  add constraint chatbot_conversations_status_check
  check (status in ('open', 'qualified', 'handoff', 'closed'));

alter table public.chatbot_leads
  drop constraint if exists chatbot_leads_status_check,
  add constraint chatbot_leads_status_check
  check (status in ('pending', 'new', 'contacted', 'qualified', 'confirmed', 'paid', 'closed'));

alter table public.chatbot_leads
  drop constraint if exists chatbot_leads_conversation_id_fkey,
  add constraint chatbot_leads_conversation_id_fkey
  foreign key (conversation_id) references public.chatbot_conversations(id) on delete set null;

alter table public.chatbot_leads
  drop constraint if exists chatbot_leads_conversation_id_key,
  add constraint chatbot_leads_conversation_id_key
  unique (conversation_id);

alter table public.chatbot_leads
  drop constraint if exists chatbot_leads_travelers_check,
  add constraint chatbot_leads_travelers_check
  check (travelers is null or (travelers >= 1 and travelers <= 99));

alter table public.chatbot_messages
  drop constraint if exists chatbot_messages_role_check,
  add constraint chatbot_messages_role_check
  check (role in ('user', 'assistant', 'system'));

alter table public.chatbot_messages
  drop constraint if exists chatbot_messages_conversation_id_fkey,
  add constraint chatbot_messages_conversation_id_fkey
  foreign key (conversation_id) references public.chatbot_conversations(id) on delete cascade;
