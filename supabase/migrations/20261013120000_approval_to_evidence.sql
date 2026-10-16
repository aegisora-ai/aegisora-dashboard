-- approval_to_evidence: production'da elle eklenmisti, repoya alindi.
create or replace function public.approval_to_evidence()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare d record;
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    select trace_id, decision into d from public.decisions where id = new.decision_id;
    insert into public.evidence (workspace_id, decision_id, agent_id, trace_id, action, decision, payload)
    values (
      new.workspace_id, new.decision_id, new.agent_id,
      coalesce(d.trace_id, ''), new.action, coalesce(d.decision, 'ESCALATE'),
      jsonb_build_object(
        'event', 'approval.resolved',
        'approval_id', new.id,
        'action', new.action,
        'resource', new.resource,
        'effect', upper(new.status),
        'agent_name', new.agent_name,
        'resolved_by', new.resolved_by,
        'resolved_at', coalesce(new.resolved_at, now()),
        'note', new.note
      )
    );
  end if;
  return new;
end $function$;

drop trigger if exists approvals_evidence_trg on public.approvals;
create trigger approvals_evidence_trg after update on public.approvals
  for each row execute function public.approval_to_evidence();