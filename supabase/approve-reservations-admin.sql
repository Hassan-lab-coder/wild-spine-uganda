create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

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

grant execute on function public.is_admin() to anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Users can read their own admin profile" on public.admin_users;
create policy "Users can read their own admin profile"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('reservations@wildspineuganda.com')
on conflict (user_id) do update
set email = excluded.email;

select au.email, au.user_id, u.created_at, u.last_sign_in_at
from public.admin_users au
left join auth.users u on u.id = au.user_id
where lower(au.email) = lower('reservations@wildspineuganda.com');
