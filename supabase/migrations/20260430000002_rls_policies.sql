-- ============================================================================
-- FlipBiz — Migration 2/4: Row Level Security policies
-- Pattern: tous les utilisateurs authentifiés voient tout (business partagé)
--          mais profile.update est restreint à soi-même.
-- ============================================================================

alter table public.profiles  enable row level security;
alter table public.articles  enable row level security;
alter table public.purchases enable row level security;
alter table public.sales     enable row level security;
alter table public.expenses  enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings  enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles read for authenticated"
  on public.profiles for select to authenticated using (true);

create policy "profiles insert self"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "profiles update self only"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- (no delete: profiles are deleted via auth.users cascade)

-- ----------------------------------------------------------------------------
-- articles, purchases, sales, expenses
-- Lecture/écriture pour tous les authentifiés (business partagé)
-- ----------------------------------------------------------------------------
create policy "articles all for authenticated"
  on public.articles for all to authenticated using (true) with check (true);

create policy "purchases all for authenticated"
  on public.purchases for all to authenticated using (true) with check (true);

create policy "sales all for authenticated"
  on public.sales for all to authenticated using (true) with check (true);

create policy "expenses all for authenticated"
  on public.expenses for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- audit_log : lecture seule pour les authentifiés ; insertions par triggers (security definer)
-- ----------------------------------------------------------------------------
create policy "audit_log read for authenticated"
  on public.audit_log for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- settings : lecture pour authentifiés, update pour authentifiés
-- ----------------------------------------------------------------------------
create policy "settings read for authenticated"
  on public.settings for select to authenticated using (true);

create policy "settings update for authenticated"
  on public.settings for update to authenticated using (true) with check (true);
