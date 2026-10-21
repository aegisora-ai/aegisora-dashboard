begin;

revoke execute on function public.create_api_key(uuid, text)   from public, anon;
revoke execute on function public.verify_evidence_chain(uuid)  from public, anon;
revoke execute on function public.can_manage_workspace(uuid)   from public, anon;
revoke execute on function public.is_member(uuid)              from public, anon;
revoke execute on function public.is_workspace_member(uuid)    from public, anon;
revoke execute on function public.workspace_role(uuid)         from public, anon;
revoke execute on function public.evidence_field(text)         from public, anon;
revoke execute on function public.evidence_hash_v2(evidence)   from public, anon;
revoke execute on function public.approval_stamp()             from public, anon;
revoke execute on function public.approvals_resolve_guard()    from public, anon;
revoke execute on function public.enterprise_set_updated_at()  from public, anon;
revoke execute on function public.evidence_guard()             from public, anon;
revoke execute on function public.evidence_immutable()         from public, anon;
revoke execute on function public.evidence_no_truncate()       from public, anon;
revoke execute on function public.evidence_no_truncate_fn()    from public, anon;

revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;

alter default privileges for role postgres in schema public revoke execute on functions from anon;
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres revoke execute on functions from public;

commit;