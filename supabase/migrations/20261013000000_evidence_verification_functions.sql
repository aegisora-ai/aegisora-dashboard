-- Evidence hash/verify fonksiyonlari: production'da elle eklenmisti, repoya alindi.
create or replace function public.evidence_field(v text)
returns text
language sql
immutable
as $function$
  select case when v is null then '~' else octet_length(v)::text || ':' || v end
$function$;

create or replace function public.evidence_hash_v2(r public.evidence)
returns text
language sql
immutable
set search_path to 'public', 'extensions'
as $function$
  select encode(digest(convert_to(concat_ws('|', 'v2',
    public.evidence_field(r.prev_hash),
    public.evidence_field(r.workspace_id::text),
    public.evidence_field(r.seq::text),
    public.evidence_field(r.id::text),
    public.evidence_field(r.decision_id::text),
    public.evidence_field(r.action),
    public.evidence_field(r.decision::text),
    public.evidence_field(r.trace_id),
    public.evidence_field(to_char(r.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')),
    public.evidence_field(r.payload::text)
  ), 'UTF8'), 'sha256'), 'hex')
$function$;

create or replace function public.evidence_verify_core(ws uuid)
returns table(total bigint, broken bigint)
language sql
stable security definer
set search_path to 'public', 'extensions'
as $function$
  with o as (
    select e.*,
           lag(e.hash) over (order by e.seq) as exp_prev,
           row_number() over (order by e.seq) as rn,
           public.evidence_hash_v2(e) as h2
    from public.evidence e where e.workspace_id = ws
  )
  select count(*)::bigint,
    (count(*) filter (where
         o.prev_hash is distinct from coalesce(o.exp_prev, 'GENESIS')
      or o.seq is distinct from o.rn
      or o.hash is distinct from case when o.hash_version = 2 then o.h2
           else encode(digest(o.prev_hash || '|' || o.id::text || '|' || coalesce(o.decision_id::text, '') || '|' || o.payload::text, 'sha256'), 'hex') end
    ))::bigint
  from o
$function$;