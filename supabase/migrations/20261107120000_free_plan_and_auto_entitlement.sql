-- Free plan: allow the 'free' plan key and 'free' billing mode,
-- and give every newly created workspace a free entitlement automatically.
-- Existing workspaces are not touched.

alter table public.workspace_entitlements
  drop constraint if exists workspace_entitlements_plan_check;
alter table public.workspace_entitlements
  add constraint workspace_entitlements_plan_check
  check (plan_key in ('free', 'founder_pilot', 'pilot', 'team', 'business', 'enterprise'));

alter table public.workspace_entitlements
  drop constraint if exists workspace_entitlements_mode_check;
alter table public.workspace_entitlements
  add constraint workspace_entitlements_mode_check
  check (billing_mode in ('free', 'one_time_pilot', 'subscription'));

create or replace function public.grant_free_entitlement()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.workspace_entitlements (workspace_id, plan_key, status, billing_mode)
  values (new.id, 'free', 'active', 'free')
  on conflict (workspace_id) do nothing;
  return new;
end;
$$;

revoke all on function public.grant_free_entitlement() from public, anon, authenticated;

drop trigger if exists trg_workspaces_grant_free_entitlement on public.workspaces;
create trigger trg_workspaces_grant_free_entitlement
  after insert on public.workspaces
  for each row execute function public.grant_free_entitlement();