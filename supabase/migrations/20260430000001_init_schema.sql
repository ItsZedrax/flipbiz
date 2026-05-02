-- ============================================================================
-- FlipBiz — Migration 1/4: extensions, enums, tables, indexes
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMs
-- ----------------------------------------------------------------------------
create type public.article_category as enum ('sneakers', 'cards', 'watches', 'other');
create type public.article_condition as enum (
  'new_unworn',
  'new_with_tags',
  'very_good',
  'good',
  'fair',
  'poor'
);
create type public.article_status as enum ('in_stock', 'reserved', 'sold', 'returned');

-- ----------------------------------------------------------------------------
-- profiles  (1 row per auth.users row, auto-created by trigger)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            text not null unique,
  full_name           text,
  avatar_url          text,
  color               text not null default '#6366f1',
  monthly_profit_goal numeric(12, 2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- articles
-- ----------------------------------------------------------------------------
create table public.articles (
  id                       uuid primary key default gen_random_uuid(),
  created_by               uuid not null references public.profiles(id) on delete restrict,
  category                 public.article_category not null,
  name                     text not null,
  brand                    text,
  reference                text,
  serial_number            text,
  size                     text,
  colorway                 text,
  condition                public.article_condition not null default 'good',
  has_certificate          boolean not null default false,
  certificate_number       text,
  has_original_box         boolean not null default false,
  has_accessories          boolean not null default false,
  accessories_description  text,
  notes                    text,
  tags                     text[] not null default '{}',
  status                   public.article_status not null default 'in_stock',
  photos                   text[] not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index idx_articles_status on public.articles(status);
create index idx_articles_category on public.articles(category);
create index idx_articles_created_by on public.articles(created_by);
create index idx_articles_created_at on public.articles(created_at desc);
create index idx_articles_tags on public.articles using gin(tags);

-- ----------------------------------------------------------------------------
-- purchases
-- ----------------------------------------------------------------------------
create table public.purchases (
  id                   uuid primary key default gen_random_uuid(),
  article_id           uuid not null references public.articles(id) on delete cascade,
  buyer_id             uuid not null references public.profiles(id) on delete restrict,
  purchase_date        date not null,
  purchase_price       numeric(12, 2) not null check (purchase_price >= 0),
  purchase_platform    text,
  seller_name          text,
  shipping_cost_in     numeric(12, 2) not null default 0 check (shipping_cost_in >= 0),
  packaging_cost       numeric(12, 2) not null default 0 check (packaging_cost >= 0),
  authentication_cost  numeric(12, 2) not null default 0 check (authentication_cost >= 0),
  other_costs          numeric(12, 2) not null default 0 check (other_costs >= 0),
  notes                text,
  invoice_url          text,
  created_at           timestamptz not null default now(),
  -- One purchase row per article. Re-buys would create a new article.
  unique (article_id)
);

create index idx_purchases_buyer_id on public.purchases(buyer_id);
create index idx_purchases_date on public.purchases(purchase_date desc);
create index idx_purchases_platform on public.purchases(purchase_platform);

-- ----------------------------------------------------------------------------
-- sales
-- ----------------------------------------------------------------------------
create table public.sales (
  id                   uuid primary key default gen_random_uuid(),
  article_id           uuid not null references public.articles(id) on delete cascade,
  seller_id            uuid not null references public.profiles(id) on delete restrict,
  sale_date            date not null,
  sale_price           numeric(12, 2) not null check (sale_price >= 0),
  sale_platform        text,
  buyer_name           text,
  shipping_cost_out    numeric(12, 2) not null default 0 check (shipping_cost_out >= 0),
  platform_fees_pct    numeric(5, 2)  not null default 0 check (platform_fees_pct >= 0 and platform_fees_pct <= 100),
  platform_fees_amount numeric(12, 2) not null default 0 check (platform_fees_amount >= 0),
  other_fees           numeric(12, 2) not null default 0 check (other_fees >= 0),
  payment_method       text,
  tracking_number      text,
  notes                text,
  created_at           timestamptz not null default now(),
  -- One sale row per article (the final outbound transaction).
  unique (article_id)
);

create index idx_sales_seller_id on public.sales(seller_id);
create index idx_sales_date on public.sales(sale_date desc);
create index idx_sales_platform on public.sales(sale_platform);

-- ----------------------------------------------------------------------------
-- expenses (general business expenses, not per-article)
-- ----------------------------------------------------------------------------
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete restrict,
  category     text not null,
  description  text not null,
  amount       numeric(12, 2) not null check (amount >= 0),
  date         date not null,
  created_at   timestamptz not null default now()
);

create index idx_expenses_date on public.expenses(date desc);
create index idx_expenses_category on public.expenses(category);
create index idx_expenses_user_id on public.expenses(user_id);

-- ----------------------------------------------------------------------------
-- audit_log (every mutation tracked)
-- ----------------------------------------------------------------------------
create table public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  table_name  text not null,
  record_id   text not null,
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  user_id     uuid references public.profiles(id) on delete set null,
  changes     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_log_table on public.audit_log(table_name);
create index idx_audit_log_user on public.audit_log(user_id);
create index idx_audit_log_created on public.audit_log(created_at desc);

-- ----------------------------------------------------------------------------
-- settings (singleton table - id always 1)
-- ----------------------------------------------------------------------------
create table public.settings (
  id                   integer primary key default 1,
  platforms            text[] not null default array[
    'Vinted', 'eBay', 'Leboncoin', 'StockX', 'GOAT', 'Wethenew',
    'Vestiaire Collective', 'Chrono24', 'Catawiki', 'Physique', 'Autre'
  ],
  categories           text[] not null default array[
    'Emballage', 'Authentification', 'Transport', 'Abonnement',
    'Outils', 'Marketing', 'Frais bancaires', 'Autre'
  ],
  monthly_profit_goal  numeric(12, 2) not null default 2000,
  updated_at           timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into public.settings (id) values (1);
