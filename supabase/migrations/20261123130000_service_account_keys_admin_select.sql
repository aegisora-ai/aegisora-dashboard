begin;

drop policy if exists service_account_keys_member_select on public.service_account_keys;

create policy service_account_keys_admin_select
  on public.service_account_keys
  for select
  to authenticated
  using (public.can_manage_workspace(workspace_id));

commit;
