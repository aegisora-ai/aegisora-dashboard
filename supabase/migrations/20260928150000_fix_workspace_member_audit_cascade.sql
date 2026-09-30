-- Make workspace member audit safe during workspace ON DELETE CASCADE.
-- Normal member INSERT/UPDATE/DELETE operations still create audit events.
-- Only deletes occurring after the parent workspace is already absent are skipped.

create or replace function public.audit_workspace_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_workspace_id uuid;
  event_user_id uuid;
  event_action text;
  event_meta jsonb;
begin
  if tg_op = 'DELETE' then
    event_workspace_id := old.workspace_id;
    event_user_id := old.user_id;
    event_action := 'workspace_members.delete';
    event_meta := jsonb_build_object(
      'old_role', old.role,
      'old_status', old.status
    );

  elsif tg_op = 'INSERT' then
    event_workspace_id := new.workspace_id;
    event_user_id := new.user_id;
    event_action := 'workspace_members.insert';
    event_meta := jsonb_build_object(
      'new_role', new.role,
      'new_status', new.status
    );

  else
    event_workspace_id := new.workspace_id;
    event_user_id := new.user_id;

    if old.role is distinct from new.role then
      event_action := 'workspace_members.role_change';
    elsif old.status is distinct from new.status then
      event_action := 'workspace_members.status_change';
    else
      event_action := 'workspace_members.update';
    end if;

    event_meta := jsonb_build_object(
      'old_role', old.role,
      'new_role', new.role,
      'old_status', old.status,
      'new_status', new.status
    );
  end if;

  if event_workspace_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspaces
    where id = event_workspace_id
  ) then
    return null;
  end if;

  insert into public.audit_events
    (
      workspace_id,
      actor,
      action,
      target_type,
      target_id,
      meta
    )
  values
    (
      event_workspace_id,
      coalesce(
        auth.uid()::text,
        nullif(current_setting('aegisora.actor_id', true), ''),
        'system'
      ),
      event_action,
      'workspace_member',
      event_user_id::text,
      event_meta
    );

  return null;
end;
$$;