drop policy if exists api_keys_delete on public.api_keys;
create policy api_keys_delete on public.api_keys
  for delete to authenticated
  using (
    revoked_at is not null
    and has_role(workspace_id, ARRAY['OWNER'::text, 'ADMIN'::text])
  );
