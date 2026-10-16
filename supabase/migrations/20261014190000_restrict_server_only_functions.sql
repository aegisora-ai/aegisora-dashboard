-- Server-only RPCs: take caller-supplied actor/bucket ids, so only service_role may call them.
begin;

revoke execute on function public.accept_workspace_invites(uuid, uuid) from public, anon, authenticated;
grant  execute on function public.accept_workspace_invites(uuid, uuid) to service_role;

revoke execute on function public.add_workspace_member(uuid, uuid, public.workspace_role, public.member_status, uuid) from public, anon, authenticated;
grant  execute on function public.add_workspace_member(uuid, uuid, public.workspace_role, public.member_status, uuid) to service_role;

revoke execute on function public.remove_workspace_member(uuid, uuid, uuid) from public, anon, authenticated;
grant  execute on function public.remove_workspace_member(uuid, uuid, uuid) to service_role;

revoke execute on function public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) from public, anon, authenticated;
grant  execute on function public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) to service_role;

revoke execute on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant  execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

revoke execute on function public.touch_agent(uuid, uuid) from public, anon, authenticated;
grant  execute on function public.touch_agent(uuid, uuid) to service_role;

revoke execute on function public.evidence_verify_core(uuid) from public, anon, authenticated;
grant  execute on function public.evidence_verify_core(uuid) to service_role;

-- Trigger functions are never meant to be called as RPC.
revoke execute on function public.approval_to_evidence() from public, anon, authenticated;
revoke execute on function public.audit_change() from public, anon, authenticated;
revoke execute on function public.audit_workspace_member_change() from public, anon, authenticated;
revoke execute on function public.evidence_chain() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.snapshot_policy_version() from public, anon, authenticated;

commit;
-- Rollback: grant execute on the functions above back to authenticated.