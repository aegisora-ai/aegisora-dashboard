-- evidence_verify_core(ws) has no membership check. It is only meant to be called by
--   * public.verify_evidence_chain(ws)  (SECURITY DEFINER, checks is_member first), and
--   * the service-role export route (/api/v1/workspace/evidence/export).
-- Default privileges let anon/authenticated call it through PostgREST for any workspace UUID.
revoke execute on function public.evidence_verify_core(uuid) from public, anon, authenticated;
grant execute on function public.evidence_verify_core(uuid) to service_role;

-- Check (expect anon=false, authenticated=false, service_role=true):
-- select has_function_privilege('anon', 'public.evidence_verify_core(uuid)', 'execute') as anon,
--        has_function_privilege('authenticated', 'public.evidence_verify_core(uuid)', 'execute') as authenticated,
--        has_function_privilege('service_role', 'public.evidence_verify_core(uuid)', 'execute') as service_role;
