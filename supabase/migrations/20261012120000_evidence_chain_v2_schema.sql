-- Evidence zincir semasi (seq, hash_version, v2 chain, guard, truncate korumasi).
-- Production'da elle eklenmisti, repoya alindi.
alter table public.evidence add column if not exists seq bigint;
alter table public.evidence add column if not exists hash_version smallint not null default 1;

drop trigger if exists evidence_immutable_trg on public.evidence;

update public.evidence e
set seq = r.rn
from (
  select id, row_number() over (partition by workspace_id order by created_at, id) as rn
  from public.evidence
) r
where e.id = r.id and e.seq is null;

create or replace function public.evidence_chain()
returns trigger
language plpgsql
as $function$
declare prev_seq bigint; prev text;
begin
  perform pg_advisory_xact_lock(hashtext(new.workspace_id::text));
  select e.seq, e.hash into prev_seq, prev from public.evidence e
    where e.workspace_id = new.workspace_id order by e.seq desc limit 1;
  new.seq := coalesce(prev_seq, 0) + 1;
  new.prev_hash := coalesce(prev, 'GENESIS');
  new.hash_version := 2;
  new.hash := public.evidence_hash_v2(new);
  return new;
end
$function$;

create or replace function public.evidence_guard()
returns trigger
language plpgsql
as $function$
begin
  if tg_op = 'UPDATE' then
    if new.id = old.id
       and new.workspace_id = old.workspace_id
       and new.decision_id is not distinct from old.decision_id
       and new.trace_id is not distinct from old.trace_id
       and new.action is not distinct from old.action
       and new.decision is not distinct from old.decision
       and new.payload is not distinct from old.payload
       and new.created_at = old.created_at
       and new.seq = old.seq
       and new.prev_hash is not distinct from old.prev_hash
       and new.hash is not distinct from old.hash
       and new.hash_version = old.hash_version
       and (new.agent_id is not distinct from old.agent_id
            or (new.agent_id is null and pg_trigger_depth() > 1))
       and (new.execution_id is not distinct from old.execution_id
            or (new.execution_id is null and pg_trigger_depth() > 1))
    then
      return new;
    end if;
    raise exception 'evidence is append-only';
  end if;
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;
  raise exception 'evidence is append-only';
end
$function$;

create or replace function public.evidence_no_truncate_fn()
returns trigger
language plpgsql
as $function$
begin
  raise exception 'evidence is append-only: TRUNCATE not allowed';
end
$function$;

create or replace function public.evidence_no_truncate()
returns trigger
language plpgsql
as $function$
begin raise exception 'evidence is append-only: TRUNCATE not allowed'; end
$function$;

drop trigger if exists evidence_chain_trg on public.evidence;
create trigger evidence_chain_trg before insert on public.evidence
  for each row execute function public.evidence_chain();

drop trigger if exists evidence_guard_trg on public.evidence;
create trigger evidence_guard_trg before update or delete on public.evidence
  for each row execute function public.evidence_guard();

drop trigger if exists evidence_no_truncate on public.evidence;
create trigger evidence_no_truncate before truncate on public.evidence
  for each statement execute function public.evidence_no_truncate_fn();

drop trigger if exists evidence_no_truncate_trg on public.evidence;
create trigger evidence_no_truncate_trg before truncate on public.evidence
  for each statement execute function public.evidence_no_truncate();