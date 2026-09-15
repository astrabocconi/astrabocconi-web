-- Phase 1: give the database a real role model.
--
-- Before this migration every write policy was `auth.uid() IS NOT NULL`, so any
-- account that could log in could edit or delete every guide, handout and
-- representative. There were also no write policies at all on Stella_Polare,
-- and RLS was switched off on Document.
--
-- After this migration writes are gated on named permissions held by rows in
-- public.admin_users. Anonymous read access to public content is unchanged.

begin;

-- ---------------------------------------------------------------------------
-- 1. Who is allowed to do what
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'editor' check (role in ('owner', 'editor')),
  permissions text[] not null default '{}',
  disabled    boolean not null default false,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);

comment on table public.admin_users is
  'Backoffice operators. role=owner implies every permission; editors hold an explicit permission list such as {"guides:write","stella_polare:publish"}.';

alter table public.admin_users enable row level security;

-- Helpers live in `private`, which PostgREST does not expose. In `public` they
-- would be callable by anyone holding the publishable key via /rest/v1/rpc/.
create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- SECURITY DEFINER on purpose: these run as the owner so that reading
-- admin_users from inside a policy on admin_users does not recurse. The
-- calling user's identity is checked explicitly inside the body, and
-- search_path is empty so every reference must be fully qualified.
create or replace function private.has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.disabled = false
      and (au.role = 'owner' or p_permission = any (au.permissions))
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.disabled = false
  );
$$;

revoke execute on function private.has_permission(text) from public, anon;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.has_permission(text) to authenticated;
grant execute on function private.is_admin() to authenticated;

create policy admin_users_select_admins
  on public.admin_users for select to authenticated
  using ((select private.is_admin()));

create policy admin_users_insert_managers
  on public.admin_users for insert to authenticated
  with check ((select private.has_permission('users:write')));

create policy admin_users_update_managers
  on public.admin_users for update to authenticated
  using ((select private.has_permission('users:write')))
  with check ((select private.has_permission('users:write')));

create policy admin_users_delete_managers
  on public.admin_users for delete to authenticated
  using ((select private.has_permission('users:write')));

-- ---------------------------------------------------------------------------
-- 2. Replace the blanket write policies on content tables
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated users can create Astra Polare content" on public.astra_polare_media_content;
drop policy if exists "Authenticated users can update Astra Polare content" on public.astra_polare_media_content;
drop policy if exists "Authenticated users can delete Astra Polare content" on public.astra_polare_media_content;

drop policy if exists "Authenticated users can create CLMG handouts" on public.clmg_handouts;
drop policy if exists "Authenticated users can update CLMG handouts" on public.clmg_handouts;
drop policy if exists "Authenticated users can delete CLMG handouts" on public.clmg_handouts;

drop policy if exists "Authenticated users can create Magistrali handouts" on public.magistrali_handouts;
drop policy if exists "Authenticated users can update Magistrali handouts" on public.magistrali_handouts;
drop policy if exists "Authenticated users can delete Magistrali handouts" on public.magistrali_handouts;

drop policy if exists "Authenticated users can create handouts" on public.handouts;
drop policy if exists "Authenticated users can update handouts" on public.handouts;

drop policy if exists "Authenticated users can create guides" on public.guides;
drop policy if exists "Authenticated users can update guides" on public.guides;

drop policy if exists "Authenticated users can create representatives" on public.representatives;
drop policy if exists "Authenticated users can update representatives" on public.representatives;
drop policy if exists "Authenticated users can delete representatives" on public.representatives;

drop policy if exists "Authenticated users can create PDFs" on public.pdf_files;
drop policy if exists "Authenticated users can update PDFs" on public.pdf_files;
drop policy if exists "Authenticated users can delete PDFs" on public.pdf_files;

drop policy if exists "Authenticated users can create events" on public.events;

drop policy if exists "Authenticated users can upload resources" on public.resources;
-- Dropped so that one predictable rule governs writes. Without this, an
-- operator could edit rows they uploaded without holding dispense:write.
drop policy if exists "Users can update their own resources" on public.resources;

-- Grant write on each content table to the matching permission.
do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('astra_polare_media_content', 'stella_polare'),
      ('Stella_Polare',              'stella_polare'),
      ('guides',                     'guides'),
      ('handouts',                   'dispense'),
      ('clmg_handouts',              'dispense'),
      ('magistrali_handouts',        'dispense'),
      ('pdf_files',                  'dispense'),
      ('resources',                  'dispense'),
      ('representatives',            'representatives'),
      ('events',                     'events')
    ) as v(tbl, perm)
  loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.has_permission(%L)))',
      t.perm || '_write_insert', t.tbl, t.perm || ':write');
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.has_permission(%L))) with check ((select private.has_permission(%L)))',
      t.perm || '_write_update', t.tbl, t.perm || ':write', t.perm || ':write');
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.has_permission(%L)))',
      t.perm || '_delete', t.tbl, t.perm || ':delete');
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Close the RAG corpus
-- ---------------------------------------------------------------------------

-- Document holds 27,769 embedded chunks and had RLS switched off entirely, so
-- the whole corpus was readable with the publishable key. astra-app reads it
-- server side with the secret key, which bypasses RLS, so it is unaffected.
-- No policy is added: nothing should reach this table with an anon session.
alter table public."Document" enable row level security;

commit;
