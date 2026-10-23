begin;

-- 1) is_workspace_member: durum kontrolu ekle (is_member ile ayni davranis)
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql stable security definer
set search_path to 'pg_catalog', 'public'
as $fn$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and coalesce(wm.status::text, 'active') = 'active'
  );
$fn$;

-- 2) Davetle OWNER yukseltmesini kapat
drop policy if exists "workspace managers create invitations" on public.workspace_invitations;
drop policy if exists "workspace managers update invitations" on public.workspace_invitations;

create policy "workspace managers create invitations" on public.workspace_invitations
  for insert to authenticated
  with check (
    can_manage_workspace(workspace_id)
    and (role <> 'OWNER' or has_role(workspace_id, ARRAY['OWNER'::text]))
  );

create policy "workspace managers update invitations" on public.workspace_invitations
  for update to authenticated
  using (
    can_manage_workspace(workspace_id)
    and (role <> 'OWNER' or has_role(workspace_id, ARRAY['OWNER'::text]))
  )
  with check (
    can_manage_workspace(workspace_id)
    and (role <> 'OWNER' or has_role(workspace_id, ARRAY['OWNER'::text]))
  );

-- 3) Anon'un calistirabildigi fonksiyonlari kapat (trigger ve extension fonksiyonlari haric)
do $do$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype <> 'trigger'::regtype
      and has_function_privilege('anon', p.oid, 'EXECUTE')
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated, service_role', r.sig);
  end loop;
end
$do$;

alter default privileges in schema public revoke execute on functions from anon;
alter default privileges revoke execute on functions from public;

commit;