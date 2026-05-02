-- ============================================================================
-- FlipBiz — Migration 3/4: vue article_profit + triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VIEW article_profit : calcul automatique du profit/ROI/durée de détention
-- ----------------------------------------------------------------------------
create or replace view public.article_profit as
with cost as (
  select
    p.article_id,
    p.purchase_price,
    (p.purchase_price + p.shipping_cost_in + p.packaging_cost
      + p.authentication_cost + p.other_costs) as total_cost,
    p.buyer_id,
    p.purchase_date
  from public.purchases p
),
revenue as (
  select
    s.article_id,
    s.sale_price,
    s.platform_fees_amount,
    (s.sale_price - s.shipping_cost_out - s.platform_fees_amount - s.other_fees)
      as net_revenue,
    s.seller_id,
    s.sale_date
  from public.sales s
)
select
  a.id                              as article_id,
  a.name                            as name,
  a.category                        as category,
  a.status                          as status,
  c.buyer_id                        as buyer_id,
  r.seller_id                       as seller_id,
  c.purchase_price                  as purchase_price,
  c.total_cost                      as total_cost,
  r.sale_price                      as sale_price,
  r.platform_fees_amount            as platform_fees_amount,
  r.net_revenue                     as net_revenue,
  case when r.net_revenue is not null and c.total_cost is not null
       then r.net_revenue - c.total_cost
       else null end                as net_profit,
  case when r.net_revenue is not null and c.total_cost is not null and c.total_cost > 0
       then ((r.net_revenue - c.total_cost) / c.total_cost) * 100
       else null end                as roi_pct,
  case when r.sale_date is not null and c.purchase_date is not null
       then (r.sale_date - c.purchase_date)
       else null end                as days_held,
  c.purchase_date                   as purchase_date,
  r.sale_date                       as sale_date
from public.articles a
left join cost    c on c.article_id = a.id
left join revenue r on r.article_id = a.id;

-- ----------------------------------------------------------------------------
-- FUNCTION + TRIGGER : auto-update articles.updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- FUNCTION + TRIGGER : auto-create profile when user signs up
-- Reads metadata.username/full_name/color from the signup payload.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  username_value text;
  fallback_username text;
begin
  fallback_username := split_part(new.email, '@', 1);
  username_value := coalesce(
    new.raw_user_meta_data ->> 'username',
    fallback_username
  );

  -- if username is taken, append a short suffix
  if exists (select 1 from public.profiles where username = username_value) then
    username_value := username_value || '-' || substr(new.id::text, 1, 6);
  end if;

  insert into public.profiles (id, username, full_name, color)
  values (
    new.id,
    username_value,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'color', '#6366f1')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- FUNCTION + TRIGGER : when a sale is recorded, mark article as sold
-- ----------------------------------------------------------------------------
create or replace function public.mark_article_sold()
returns trigger language plpgsql as $$
begin
  update public.articles
     set status = 'sold', updated_at = now()
   where id = new.article_id and status <> 'sold';
  return new;
end;
$$;

create trigger sales_mark_article_sold
  after insert on public.sales
  for each row execute function public.mark_article_sold();

-- ----------------------------------------------------------------------------
-- FUNCTION + TRIGGER : audit_log generic tracker
-- ----------------------------------------------------------------------------
create or replace function public.audit_changes()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  v_user uuid := auth.uid();
  v_record_id text;
  v_changes jsonb;
begin
  if tg_op = 'DELETE' then
    v_record_id := old.id::text;
    v_changes := to_jsonb(old);
  elsif tg_op = 'UPDATE' then
    v_record_id := new.id::text;
    v_changes := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  else
    v_record_id := new.id::text;
    v_changes := to_jsonb(new);
  end if;

  insert into public.audit_log (table_name, record_id, action, user_id, changes)
  values (tg_table_name, v_record_id, tg_op, v_user, v_changes);

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger articles_audit  after insert or update or delete on public.articles  for each row execute function public.audit_changes();
create trigger purchases_audit after insert or update or delete on public.purchases for each row execute function public.audit_changes();
create trigger sales_audit     after insert or update or delete on public.sales     for each row execute function public.audit_changes();
create trigger expenses_audit  after insert or update or delete on public.expenses  for each row execute function public.audit_changes();

-- Grant select on the view to authenticated users
grant select on public.article_profit to authenticated;
