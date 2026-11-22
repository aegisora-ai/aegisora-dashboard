-- Plan limits: make sure the table exists and carries every plan key an entitlement may use.
create table if not exists public.plan_limits (
  plan_key text primary key,
  max_decisions_per_month integer,
  max_agents integer,
  max_members integer,
  requests_per_minute integer
);

insert into public.plan_limits (plan_key, max_decisions_per_month, max_agents, max_members, requests_per_minute)
select v.plan_key, v.max_decisions_per_month, v.max_agents, v.max_members, v.requests_per_minute
from (values
  ('free',          1000,    1,    2,    60),
  ('pilot',         25000,   5,    5,    60),
  ('founder_pilot', 25000,   5,    5,    60),
  ('pro',           25000,   5,    5,    120),
  ('team',          250000,  25,   25,   300),
  ('business',      2000000, null, null, 600),
  ('enterprise',    null,    null, null, 1200)
) as v(plan_key, max_decisions_per_month, max_agents, max_members, requests_per_minute)
where not exists (select 1 from public.plan_limits p where p.plan_key = v.plan_key);