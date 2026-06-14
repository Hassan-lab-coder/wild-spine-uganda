-- Wild Spine Uganda production hardening
-- Apply after supabase/schema.sql. Replace the email below with the approved admin account.

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
      and lower(email) = lower((auth.jwt() ->> 'email'))
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Keep public inserts possible for lead capture, but block empty or malformed rows at RLS level too.
drop policy if exists "Anyone can create itinerary requests" on public.itinerary_requests;
create policy "Anyone can create itinerary requests"
  on public.itinerary_requests
  for insert
  to anon, authenticated
  with check (
    length(trim(coalesce(name, ''))) between 2 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and coalesce(status, 'new') in ('pending', 'new')
  );

drop policy if exists "Anyone can create guide leads" on public.guide_leads;
create policy "Anyone can create guide leads"
  on public.guide_leads
  for insert
  to anon, authenticated
  with check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and coalesce(status, 'new') in ('pending', 'new')
  );

drop policy if exists "Anyone can create volunteer applications" on public.volunteer_applications;
create policy "Anyone can create volunteer applications"
  on public.volunteer_applications
  for insert
  to anon, authenticated
  with check (
    length(trim(coalesce(name, ''))) between 2 and 120
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and coalesce(status, 'new') in ('pending', 'new')
  );

-- Admin reads/updates stay restricted to approved admin users only.
drop policy if exists "Admins can read itinerary requests" on public.itinerary_requests;
create policy "Admins can read itinerary requests"
  on public.itinerary_requests
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update itinerary requests" on public.itinerary_requests;
create policy "Admins can update itinerary requests"
  on public.itinerary_requests
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read guide leads" on public.guide_leads;
create policy "Admins can read guide leads"
  on public.guide_leads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update guide leads" on public.guide_leads;
create policy "Admins can update guide leads"
  on public.guide_leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bootstrap example:
-- insert into public.admin_users (user_id, email)
-- select id, email
-- from auth.users
-- where lower(email) = lower('reservations@wildspineuganda.com')
-- on conflict (user_id) do update set email = excluded.email;
