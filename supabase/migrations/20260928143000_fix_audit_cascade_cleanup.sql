-- Prevent workspace ON DELETE CASCADE from creating
-- audit_events rows that reference an already-deleted workspace.
-- Normal tenant-scoped audit writes remain unchanged.

create or replace function public.audit_change() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws uuid;
  rid uuid;
begin
  if tg_op = 'DELETE' then
    ws := old.workspace_id;
    rid := old.id;
  else
    ws := new.workspace_id;
    rid := new.id;
  end if;

  if ws is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspaces
    where id = ws
  ) then
    return null;
  end if;

  insert into public.audit_events (
    workspace_id,
    actor,
    action,
    target_type,
    target_id
  )
  values (
    ws,
    coalesce(auth.uid()::text, 'system'),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    rid::text
  );

  return null;
end
$$;