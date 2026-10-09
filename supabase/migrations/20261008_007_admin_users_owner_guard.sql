-- Close a privilege escalation in admin_users.
--
-- The RLS policies from 001 let anyone holding users:write insert, update or
-- delete any admin_users row, so an editor with that permission could set
-- role = 'owner' on their own row straight through PostgREST and hold every
-- permission. The backoffice actions already refuse this; this trigger makes
-- the database refuse it too.
--
-- Rule: only an owner may create an owner, change anyone's role, or modify or
-- delete an owner's row. The secret key (auth.uid() is null) is exempt, so the
-- bootstrap route and maintenance scripts keep working.

begin;

create or replace function private.guard_admin_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_is_owner boolean;
begin
  if v_uid is null then
    return coalesce(new, old);
  end if;

  select exists (
    select 1 from public.admin_users
    where user_id = v_uid and role = 'owner' and disabled = false
  ) into v_is_owner;

  if v_is_owner then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' and new.role = 'owner' then
    raise exception 'only an owner can create an owner' using errcode = '42501';
  elsif tg_op = 'UPDATE' and (old.role = 'owner' or new.role is distinct from old.role) then
    raise exception 'only an owner can change roles or edit an owner' using errcode = '42501';
  elsif tg_op = 'DELETE' and old.role = 'owner' then
    raise exception 'only an owner can delete an owner' using errcode = '42501';
  end if;

  return coalesce(new, old);
end;
$$;

revoke execute on function private.guard_admin_users() from public, anon;

drop trigger if exists admin_users_guard on public.admin_users;
create trigger admin_users_guard
  before insert or update or delete on public.admin_users
  for each row execute function private.guard_admin_users();

commit;
