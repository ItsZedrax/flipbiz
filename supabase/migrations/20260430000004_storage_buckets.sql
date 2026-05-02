-- ============================================================================
-- FlipBiz — Migration 4/4: Storage buckets + policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('article-photos', 'article-photos', true),
  ('avatars',        'avatars',        true),
  ('invoices',       'invoices',       false)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- article-photos : public read, authenticated write/update/delete
-- ----------------------------------------------------------------------------
create policy "article-photos read public"
  on storage.objects for select
  using (bucket_id = 'article-photos');

create policy "article-photos write authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'article-photos');

create policy "article-photos update authenticated"
  on storage.objects for update to authenticated
  using (bucket_id = 'article-photos') with check (bucket_id = 'article-photos');

create policy "article-photos delete authenticated"
  on storage.objects for delete to authenticated
  using (bucket_id = 'article-photos');

-- ----------------------------------------------------------------------------
-- avatars : public read ; chaque user gère son propre fichier (path = uid/...)
-- ----------------------------------------------------------------------------
create policy "avatars read public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars write own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- invoices : private bucket, lecture/écriture pour authentifiés
-- ----------------------------------------------------------------------------
create policy "invoices read authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'invoices');

create policy "invoices write authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'invoices');

create policy "invoices update authenticated"
  on storage.objects for update to authenticated
  using (bucket_id = 'invoices') with check (bucket_id = 'invoices');

create policy "invoices delete authenticated"
  on storage.objects for delete to authenticated
  using (bucket_id = 'invoices');
