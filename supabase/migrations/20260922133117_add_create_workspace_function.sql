-- ---------- atomik workspace olusturma (owner uyeligi ile birlikte) ----------
create or replace function public.create_workspace(workspace_name text, workspace_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, auth.uid())
  returning id into new_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_id, auth.uid(), 'owner', 'active');

  return new_id;
end;
$$;
