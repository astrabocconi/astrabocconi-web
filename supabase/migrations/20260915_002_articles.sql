-- Phase 2: Stella Polare articles become data.
--
-- The old site hardcoded eleven articles as individual .tsx files with
-- hardcoded routes, so publishing needed a developer and a deploy. This table
-- is what replaces that. The legacy public."Stella_Polare" table is left alone;
-- it holds two rows of external links and is not the article store.

begin;

create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  category     text,
  excerpt      text,
  author       text,
  cover_url    text,
  body_html    text not null default '',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) on delete set null,
  updated_by   uuid references auth.users (id) on delete set null
);

comment on table public.articles is
  'Stella Polare articles. body_html is sanitised in the application before it is written.';

-- The public list filters on status and orders by published_at.
create index if not exists articles_published_idx
  on public.articles (published_at desc)
  where status = 'published';

alter table public.articles enable row level security;

-- Readers see published articles. Anyone who can write them also sees drafts.
create policy articles_select_published
  on public.articles for select to anon, authenticated
  using (
    status = 'published'
    or (select private.has_permission('stella_polare:write'))
  );

create policy articles_insert
  on public.articles for insert to authenticated
  with check ((select private.has_permission('stella_polare:write')));

create policy articles_update
  on public.articles for update to authenticated
  using ((select private.has_permission('stella_polare:write')))
  with check ((select private.has_permission('stella_polare:write')));

create policy articles_delete
  on public.articles for delete to authenticated
  using ((select private.has_permission('stella_polare:delete')));

-- ---------------------------------------------------------------------------
-- Audit trail
-- ---------------------------------------------------------------------------

-- Handover is the whole point of the backoffice, so every content change needs
-- to be attributable to a person after the committee turns over.
create table if not exists public.content_audit (
  id          bigserial primary key,
  table_name  text not null,
  record_id   text not null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  actor_id    uuid,
  actor_email text,
  summary     text,
  changed_at  timestamptz not null default now()
);

create index if not exists content_audit_record_idx
  on public.content_audit (table_name, record_id, changed_at desc);

alter table public.content_audit enable row level security;

-- Readable by any operator, written only by the trigger below. There is
-- deliberately no insert, update or delete policy: the log is append only from
-- the application's point of view.
create policy content_audit_select_admins
  on public.content_audit for select to authenticated
  using ((select private.is_admin()));

create or replace function private.log_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_record_id text;
  v_summary   text;
begin
  if (tg_op = 'DELETE') then
    v_record_id := old.id::text;
    v_summary := coalesce(old.title, '');
  else
    v_record_id := new.id::text;
    v_summary := coalesce(new.title, '');
    if (tg_op = 'UPDATE' and old.status is distinct from new.status) then
      v_summary := v_summary || ' (' || old.status || ' -> ' || new.status || ')';
    end if;
  end if;

  insert into public.content_audit
    (table_name, record_id, action, actor_id, actor_email, summary)
  values (
    tg_table_name,
    v_record_id,
    lower(tg_op),
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    v_summary
  );

  return null;
end;
$$;

revoke execute on function private.log_content_change() from public, anon;

drop trigger if exists articles_audit on public.articles;
create trigger articles_audit
  after insert or update or delete on public.articles
  for each row execute function private.log_content_change();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
  before update on public.articles
  for each row execute function private.touch_updated_at();

commit;
