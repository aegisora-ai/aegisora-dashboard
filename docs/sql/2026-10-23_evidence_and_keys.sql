begin;

-- 1) Dashboard dogrulamasi tek kaynaktan (evidence_verify_core) calissin
create or replace function public.verify_evidence_chain(ws uuid)
returns table(total bigint, broken bigint)
language plpgsql stable security definer
set search_path to 'public', 'extensions'
as $fn$
begin
  if not public.is_member(ws) then raise exception 'forbidden'; end if;
  return query select c.total, c.broken from public.evidence_verify_core(ws) c;
end
$fn$;

-- 2) service_account_keys: key_hash tarayicidan okunamasin (sunucu service_role ile okur)
revoke select on public.service_account_keys from authenticated;
grant select (id, service_account_id, workspace_id, name, key_prefix, scopes, status,
              created_at, expires_at, revoked_at, last_used_at)
  on public.service_account_keys to authenticated;

commit;