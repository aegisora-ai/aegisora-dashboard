-- Evidence hash fix.
-- Bug: evidence.hash was GENERATED ALWAYS AS sha256(payload), overriding the v2 hash set by evidence_chain().
-- Fix: make hash a plain column; mark pre-existing rows as legacy (hash_version = 0);
-- verify legacy rows by sha256(payload) and new rows (version >= 2) by evidence_hash_v2.
-- The append-only guard is disabled for one statement inside this transaction, only to relabel hash_version.
begin;

do $$
begin
  if exists (
    select 1 from pg_attribute
    where attrelid = 'public.evidence'::regclass and attname = 'hash' and attgenerated = 's'
  ) then
    alter table public.evidence alter column hash drop expression;
    alter table public.evidence disable trigger evidence_guard_trg;
    update public.evidence set hash_version = 0;
    alter table public.evidence enable trigger evidence_guard_trg;
  end if;
end $$;

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
      or o.hash is distinct from case when o.hash_version >= 2 then o.h2
           else encode(digest(o.payload::text, 'sha256'), 'hex') end
    ))::bigint
  from o
$function$;

commit;

-- Kontrol
select 'dogrulanan_toplam' as kontrol, coalesce(sum(v.total), 0)::text as sonuc
from (select distinct workspace_id from public.evidence) w, lateral public.evidence_verify_core(w.workspace_id) v
union all
select 'bozuk_toplam', coalesce(sum(v.broken), 0)::text
from (select distinct workspace_id from public.evidence) w, lateral public.evidence_verify_core(w.workspace_id) v
union all
select 'hash_versiyon_' || hash_version::text, count(*)::text from public.evidence group by hash_version
union all
select 'hash_kolonu_hala_generated', exists (
  select 1 from pg_attribute where attrelid = 'public.evidence'::regclass and attname = 'hash' and attgenerated = 's'
)::text;