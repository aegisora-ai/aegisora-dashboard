-- Align the repo with production: 'pro' is a valid plan key for entitlements.
alter table public.workspace_entitlements
  drop constraint if exists workspace_entitlements_plan_check;
alter table public.workspace_entitlements
  add constraint workspace_entitlements_plan_check
  check (plan_key in ('free', 'pro', 'founder_pilot', 'pilot', 'team', 'business', 'enterprise'));