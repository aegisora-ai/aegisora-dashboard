-- Require an authenticated AAL2 session for OWNER/ADMIN writes exposed via RLS.
-- Non-privileged workspace roles retain their existing role-specific access.
CREATE OR REPLACE FUNCTION public.has_role(ws uuid, roles text[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members m
    WHERE m.workspace_id = ws
      AND m.user_id = auth.uid()
      AND lower(m.role::text) = ANY (SELECT lower(role_name) FROM unnest(roles) AS role_name)
      AND (
        upper(m.role::text) NOT IN ('OWNER', 'ADMIN')
        OR coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text[]) TO authenticated, service_role;
