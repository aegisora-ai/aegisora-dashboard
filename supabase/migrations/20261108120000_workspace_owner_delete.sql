-- Only owners can delete a workspace. Related rows are removed by the existing ON DELETE CASCADE rules.
grant delete on public.workspaces to authenticated;

drop policy if exists workspaces_delete_owner on public.workspaces;
create policy workspaces_delete_owner on public.workspaces
  for delete to authenticated
  using (has_role(id, array['owner', 'OWNER']::text[]));