begin;

-- 1) workspace sahipleri workspace'i silebilsin (DELETE politikasi eksikti)
drop policy if exists workspaces_delete on public.workspaces;
create policy workspaces_delete on public.workspaces
  for delete to authenticated
  using (public.has_role(id, array['OWNER']));

-- 2) workspace tamamen silinirken son sahip uyeliginin cascade ile silinmesine izin ver
create or replace function public.guard_workspace_member_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  actor uuid := auth.uid();
  ws uuid;
  actor_is_owner boolean;
begin
  if actor is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  if tg_op = 'DELETE' then ws := old.workspace_id; else ws := new.workspace_id; end if;

  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = actor
      and upper(m.role::text) = 'OWNER'
      and coalesce(m.status::text, 'active') = 'active'
  ) into actor_is_owner;

  if tg_op = 'INSERT' then
    if upper(new.role::text) = 'OWNER' and not actor_is_owner
       and exists (select 1 from public.workspace_members m where m.workspace_id = new.workspace_id) then
      raise exception 'only an owner can grant the owner role' using errcode = '42501';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.workspace_id is distinct from old.workspace_id or new.user_id is distinct from old.user_id then
      raise exception 'membership keys are immutable' using errcode = '42501';
    end if;
    if not actor_is_owner
       and (upper(old.role::text) = 'OWNER' or upper(new.role::text) = 'OWNER')
       and (old.role is distinct from new.role or old.status is distinct from new.status) then
      raise exception 'only an owner can change an owner membership' using errcode = '42501';
    end if;
    if upper(old.role::text) = 'OWNER'
       and (upper(new.role::text) <> 'OWNER' or coalesce(new.status::text, 'active') <> 'active')
       and not exists (
         select 1 from public.workspace_members m
         where m.workspace_id = old.workspace_id and m.user_id <> old.user_id
           and upper(m.role::text) = 'OWNER' and coalesce(m.status::text, 'active') = 'active'
       ) then
      raise exception 'a workspace needs at least one active owner' using errcode = '42501';
    end if;
    return new;
  end if;

  -- DELETE: workspace satiri zaten silindiyse (cascade) serbest birak
  if not exists (select 1 from public.workspaces w where w.id = old.workspace_id) then
    return old;
  end if;

  if upper(old.role::text) = 'OWNER' then
    if not actor_is_owner then
      raise exception 'only an owner can remove an owner' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.workspace_members m
      where m.workspace_id = old.workspace_id and m.user_id <> old.user_id
        and upper(m.role::text) = 'OWNER' and coalesce(m.status::text, 'active') = 'active'
    ) then
      raise exception 'a workspace needs at least one active owner' using errcode = '42501';
    end if;
  end if;
  return old;
end;
$function$;

commit;

select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'workspaces' order by policyname;