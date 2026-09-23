-- Home page content, and the groundwork for editing dispense from the backoffice.
--
-- 1. `notices`: the strip under the hero. Zero live rows means no strip at all.
-- 2. `site_sections`: one row per editable home page block, keyed by name. The
--    conference block is the first; its shape lives in src/lib/site-content.ts.
-- 3. Audit trail on the three handout tables, now that people write to them.
-- 4. Storage policies for `dispense-uploads`, gated like the other buckets.

begin;

-- ---------------------------------------------------------------------------
-- 1. Notices
-- ---------------------------------------------------------------------------

create table if not exists public.notices (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  tone        text not null default 'info' check (tone in ('info', 'important', 'urgent')),
  -- [{ "label": "Iscriviti", "url": "https://...", "style": "primary" | "secondary" }]
  buttons     jsonb not null default '[]'::jsonb check (jsonb_typeof(buttons) = 'array'),
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null,
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.notices enable row level security;

-- Two permissive policies, never one combined expression: anon must not
-- evaluate a private.* call. See HANDOVER.
drop policy if exists notices_select_public on public.notices;
create policy notices_select_public
  on public.notices for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

drop policy if exists notices_select_writers on public.notices;
create policy notices_select_writers
  on public.notices for select to authenticated
  using ((select private.has_permission('site:write')));

drop policy if exists site_write_insert on public.notices;
create policy site_write_insert
  on public.notices for insert to authenticated
  with check ((select private.has_permission('site:write')));

drop policy if exists site_write_update on public.notices;
create policy site_write_update
  on public.notices for update to authenticated
  using ((select private.has_permission('site:write')))
  with check ((select private.has_permission('site:write')));

drop policy if exists site_delete on public.notices;
create policy site_delete
  on public.notices for delete to authenticated
  using ((select private.has_permission('site:delete')));

drop trigger if exists notices_touch on public.notices;
create trigger notices_touch
  before update on public.notices
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Site sections
-- ---------------------------------------------------------------------------

create table if not exists public.site_sections (
  key         text primary key check (key ~ '^[a-z0-9_]+$'),
  data        jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  is_visible  boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

alter table public.site_sections enable row level security;

drop policy if exists site_sections_select_public on public.site_sections;
create policy site_sections_select_public
  on public.site_sections for select to anon, authenticated
  using (is_visible);

drop policy if exists site_sections_select_writers on public.site_sections;
create policy site_sections_select_writers
  on public.site_sections for select to authenticated
  using ((select private.has_permission('site:write')));

drop policy if exists site_write_insert on public.site_sections;
create policy site_write_insert
  on public.site_sections for insert to authenticated
  with check ((select private.has_permission('site:write')));

drop policy if exists site_write_update on public.site_sections;
create policy site_write_update
  on public.site_sections for update to authenticated
  using ((select private.has_permission('site:write')))
  with check ((select private.has_permission('site:write')));

drop trigger if exists site_sections_touch on public.site_sections;
create trigger site_sections_touch
  before update on public.site_sections
  for each row execute function private.touch_updated_at();

-- Hidden until someone fills it in, so the home page never shows placeholder copy.
insert into public.site_sections (key, data, is_visible)
values ('conference', '{}'::jsonb, false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Audit
-- ---------------------------------------------------------------------------

-- site_sections is keyed by `key`, not `id`, so the record id falls back to it.
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

  v_record_id := coalesce(v_row ->> 'id', v_row ->> 'key', v_row ->> 'user_id', '');
  v_summary := coalesce(
    v_row ->> 'title',
    v_row ->> 'name',
    v_row ->> 'filename',
    v_row ->> 'key',
    ''
  );

  if (v_old is not null and (v_old ->> 'status') is distinct from (v_row ->> 'status')) then
    v_summary := v_summary || ' (' || coalesce(v_old ->> 'status', '') ||
                 ' -> ' || coalesce(v_row ->> 'status', '') || ')';
  end if;

  if (v_old is not null and (v_old ->> 'is_active') is distinct from (v_row ->> 'is_active')) then
    v_summary := v_summary || ' (attivo: ' || coalesce(v_row ->> 'is_active', '') || ')';
  end if;

  if (v_old is not null and (v_old ->> 'is_visible') is distinct from (v_row ->> 'is_visible')) then
    v_summary := v_summary || ' (visibile: ' || coalesce(v_row ->> 'is_visible', '') || ')';
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

do $$
declare
  t text;
begin
  foreach t in array array['notices', 'site_sections', 'handouts', 'clmg_handouts', 'magistrali_handouts']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function private.log_content_change()',
      t || '_audit', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. dispense-uploads storage
-- ---------------------------------------------------------------------------

-- PDFs go under handouts/, clmg/ and magistrali/; covers under thumbs/<kind>/.
-- The read policy is what lets an upsert overwrite an existing cover.
drop policy if exists dispense_objects_read on storage.objects;
create policy dispense_objects_read
  on storage.objects for select to authenticated
  using (bucket_id = 'dispense-uploads');

drop policy if exists dispense_objects_write on storage.objects;
create policy dispense_objects_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dispense-uploads'
    and (select private.has_permission('dispense:write'))
  );

drop policy if exists dispense_objects_update on storage.objects;
create policy dispense_objects_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'dispense-uploads'
    and (select private.has_permission('dispense:write'))
  );

drop policy if exists dispense_objects_delete on storage.objects;
create policy dispense_objects_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'dispense-uploads'
    and (select private.has_permission('dispense:delete'))
  );

-- ---------------------------------------------------------------------------
-- 5. images/site/ for home page imagery
-- ---------------------------------------------------------------------------

-- The images bucket is otherwise gated on representatives:write. Home page
-- editors get their own folder rather than the whole bucket.
drop policy if exists images_site_objects_write on storage.objects;
create policy images_site_objects_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'site'
    and (select private.has_permission('site:write'))
  );

commit;
