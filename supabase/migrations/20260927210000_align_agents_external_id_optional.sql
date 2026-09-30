-- Aegisora governance schema alignment
-- external_id identifies an upstream/customer agent when provided.
-- It is intentionally optional for manual/onboarding/auto-discovered agents.

begin;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'agents'
      and column_name = 'external_id'
  ) then
    alter table public.agents
      alter column external_id drop not null;
  else
    raise exception 'Expected public.agents.external_id column is missing';
  end if;
end $$;

comment on column public.agents.external_id is
  'Optional customer/upstream agent identifier. Null is valid for manually created or auto-discovered agents.';

commit;