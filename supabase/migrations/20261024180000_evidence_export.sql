-- Evidence export: every field needed to recompute evidence_hash_v2 outside the database.
create or replace function public.evidence_export(ws uuid)
returns table(
  seq bigint,
  id uuid,
  workspace_id uuid,
  decision_id uuid,
  action text,
  decision text,
  trace_id text,
  prev_hash text,
  hash text,
  hash_version integer,
  created_at_utc text,
  payload_text text
)
language sql
stable
security definer
set search_path to 'public', 'extensions'
as $function$
  select
    e.seq::bigint,
    e.id,
    e.workspace_id,
    e.decision_id,
    e.action,
    e.decision::text,
    e.trace_id,
    e.prev_hash,
    e.hash,
    e.hash_version::integer,
    to_char(e.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    e.payload::text
  from public.evidence e
  where e.workspace_id = ws
  order by e.seq
$function$;

revoke execute on function public.evidence_export(uuid) from public, anon, authenticated;
grant execute on function public.evidence_export(uuid) to service_role;