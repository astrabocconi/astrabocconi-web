-- The combined select policy called private.has_permission() for every reader,
-- including anonymous ones, which have no EXECUTE on it. Postgres evaluates the
-- whole USING expression before short circuiting helps, so every anonymous read
-- failed with "permission denied for function has_permission".
--
-- Split it in two. Permissive policies are OR'd, so an operator still sees
-- drafts through the second one, and anonymous readers never touch the
-- function at all.

begin;

drop policy if exists articles_select_published on public.articles;

create policy articles_select_published
  on public.articles for select to anon, authenticated
  using (status = 'published');

create policy articles_select_drafts_for_writers
  on public.articles for select to authenticated
  using ((select private.has_permission('stella_polare:write')));

commit;
