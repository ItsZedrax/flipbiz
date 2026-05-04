-- ============================================================================
-- Admin features: roles, approval gating, announcements
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: add admin / approved flags
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin    boolean not null default false,
  add column if not exists is_approved boolean not null default false;

-- Existing users keep working: approve them all.
update public.profiles set is_approved = true;

-- Bootstrap the first admin (penot.augustin@gmail.com).
update public.profiles
set is_admin = true, is_approved = true
where id in (
  select id from auth.users where lower(email) = 'penot.augustin@gmail.com'
);

-- ----------------------------------------------------------------------------
-- handle_new_user: defaults is_approved = false for new signups.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  username_value text;
  fallback_username text;
  bootstrap_admin boolean;
begin
  fallback_username := split_part(new.email, '@', 1);
  username_value := coalesce(
    new.raw_user_meta_data ->> 'username',
    fallback_username
  );

  if exists (select 1 from public.profiles where username = username_value) then
    username_value := username_value || '-' || substr(new.id::text, 1, 6);
  end if;

  -- Auto-approve + admin if this is the bootstrap email.
  bootstrap_admin := lower(new.email) = 'penot.augustin@gmail.com';

  insert into public.profiles (id, username, full_name, color, is_admin, is_approved)
  values (
    new.id,
    username_value,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'color', '#6366f1'),
    bootstrap_admin,
    bootstrap_admin
  );
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles RLS: admins can update any profile (toggle is_admin / is_approved).
-- ----------------------------------------------------------------------------
drop policy if exists "profiles update self only" on public.profiles;

create policy "profiles update self or admin"
  on public.profiles for update to authenticated
  using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ))
  with check (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

-- ----------------------------------------------------------------------------
-- announcements
-- ----------------------------------------------------------------------------
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  type        text not null default 'info' check (type in ('info', 'warning', 'danger')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles(id) on delete set null
);

create index if not exists idx_announcements_active
  on public.announcements(is_active, created_at desc);

alter table public.announcements enable row level security;

drop policy if exists "announcements read all" on public.announcements;
drop policy if exists "announcements admin write" on public.announcements;

create policy "announcements read all"
  on public.announcements for select to authenticated
  using (true);

create policy "announcements admin write"
  on public.announcements for all to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ))
  with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ));

-- ----------------------------------------------------------------------------
-- delete_user_cascade: wipes all data for a user, then deletes auth.users.
-- Called from server-side admin route with service_role key.
-- ----------------------------------------------------------------------------
create or replace function public.delete_user_cascade(target_user uuid)
returns void
security definer
set search_path = public
language plpgsql as $$
begin
  delete from public.expenses  where user_id   = target_user;
  delete from public.sales     where seller_id = target_user;
  delete from public.purchases where buyer_id  = target_user;
  delete from public.articles  where created_by = target_user;
  delete from auth.users       where id = target_user;
end;
$$;
