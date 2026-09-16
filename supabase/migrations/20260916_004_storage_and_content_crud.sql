-- Phase 2 continued: make guides and representatives manageable, and fix two
-- gaps found while wiring them up.
--
-- 1. storage.objects has RLS on but only carries policies for the
--    dispense-uploads bucket, so uploading a Stella Polare cover from the
--    backoffice was denied. The seeded covers went in with the secret key,
--    which bypasses RLS, so the gap did not show up until now.
-- 2. The guides select policy is `is_active = true`, so the backoffice could
--    never see a deactivated guide in order to reactivate it. Same shape as
--    the drafts problem on articles, and fixed the same way, with a second
--    permissive policy rather than by widening the public one.

begin;

-- ---------------------------------------------------------------------------
-- 1. Storage
-- ---------------------------------------------------------------------------

-- Gated on the same permission as the matching table, so an editor who may not
-- publish guides cannot drop files into the guides bucket either.
drop policy if exists stella_polare_objects_read on storage.objects;
create policy stella_polare_objects_read
  on storage.objects for select to authenticated
  using (bucket_id = 'stella_polare');

drop policy if exists stella_polare_objects_write on storage.objects;
create policy stella_polare_objects_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'stella_polare'
    and (select private.has_permission('stella_polare:write'))
  );

drop policy if exists stella_polare_objects_update on storage.objects;
create policy stella_polare_objects_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'stella_polare'
    and (select private.has_permission('stella_polare:write'))
  );

drop policy if exists stella_polare_objects_delete on storage.objects;
create policy stella_polare_objects_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'stella_polare'
    and (select private.has_permission('stella_polare:delete'))
  );

drop policy if exists guides_objects_read on storage.objects;
create policy guides_objects_read
  on storage.objects for select to authenticated
  using (bucket_id = 'guides');

drop policy if exists guides_objects_write on storage.objects;
create policy guides_objects_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'guides'
    and (select private.has_permission('guides:write'))
  );

drop policy if exists guides_objects_update on storage.objects;
create policy guides_objects_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'guides'
    and (select private.has_permission('guides:write'))
  );

drop policy if exists guides_objects_delete on storage.objects;
create policy guides_objects_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'guides'
    and (select private.has_permission('guides:delete'))
  );

-- ---------------------------------------------------------------------------
-- 2. Let guide editors see deactivated guides
-- ---------------------------------------------------------------------------

drop policy if exists guides_select_writers on public.guides;
create policy guides_select_writers
  on public.guides for select to authenticated
  using ((select private.has_permission('guides:write')));

-- Same problem on resources, whose public policy is `is_public = true`.
drop policy if exists resources_select_writers on public.resources;
create policy resources_select_writers
  on public.resources for select to authenticated
  using ((select private.has_permission('dispense:write')));

-- ---------------------------------------------------------------------------
-- 3. Audit trail for guides and representatives
-- ---------------------------------------------------------------------------

-- The original function read new.title directly, which does not exist on every
-- table. Go through jsonb so one trigger function covers any content table.
create or replace function private.log_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row       jsonb;
  v_old       jsonb;
  v_record_id text;
  v_summary   text;
begin
  if (tg_op = 'DELETE') then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
    if (tg_op = 'UPDATE') then v_old := to_jsonb(old); end if;
  end if;

  v_record_id := coalesce(v_row ->> 'id', v_row ->> 'user_id', '');
  v_summary := coalesce(
    v_row ->> 'title',
    v_row ->> 'name',
    v_row ->> 'filename',
    ''
  );

  if (v_old is not null and (v_old ->> 'status') is distinct from (v_row ->> 'status')) then
    v_summary := v_summary || ' (' || coalesce(v_old ->> 'status', '') ||
                 ' -> ' || coalesce(v_row ->> 'status', '') || ')';
  end if;

  if (v_old is not null and (v_old ->> 'is_active') is distinct from (v_row ->> 'is_active')) then
    v_summary := v_summary || ' (attivo: ' || coalesce(v_row ->> 'is_active', '') || ')';
  end if;

  insert into public.content_audit
    (table_name, record_id, action, actor_id, actor_email, summary)
  values (
    tg_table_name, v_record_id, lower(tg_op),
    (select auth.uid()), (select auth.jwt() ->> 'email'), v_summary
  );

  return null;
end;
$$;

revoke execute on function private.log_content_change() from public, anon;

drop trigger if exists guides_audit on public.guides;
create trigger guides_audit
  after insert or update or delete on public.guides
  for each row execute function private.log_content_change();

drop trigger if exists representatives_audit on public.representatives;
create trigger representatives_audit
  after insert or update or delete on public.representatives
  for each row execute function private.log_content_change();

-- guides.updated_at is not maintained by anything today.
drop trigger if exists guides_touch on public.guides;
create trigger guides_touch
  before update on public.guides
  for each row execute function private.touch_updated_at();

commit;
