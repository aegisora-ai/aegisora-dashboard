BEGIN;

CREATE OR REPLACE FUNCTION public.set_workspace_member_role(
  p_workspace_id uuid, p_user_id uuid, p_role public.workspace_role, p_actor_id uuid
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE affected integer; actor_role public.workspace_role; target_role public.workspace_role;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_workspace_id::text, 0));
  SELECT role INTO actor_role FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_actor_id AND status::text = 'active' FOR UPDATE;
  IF NOT FOUND OR actor_role::text NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'active workspace administrator required';
  END IF;
  SELECT role INTO target_role FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status::text = 'active' FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF actor_role::text = 'ADMIN' AND (
    target_role::text = 'OWNER' OR p_role::text = 'OWNER' OR
    (target_role::text = 'ADMIN' AND p_user_id <> p_actor_id) OR
    (p_role::text = 'ADMIN' AND target_role::text <> 'ADMIN')
  ) THEN
    RAISE EXCEPTION 'owner-only role change';
  END IF;
  IF target_role::text = 'OWNER' AND p_role::text <> 'OWNER' AND (
    SELECT count(*) FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND role::text = 'OWNER' AND status::text = 'active'
  ) <= 1 THEN
    RAISE EXCEPTION 'last active workspace owner cannot be demoted';
  END IF;
  PERFORM set_config('aegisora.actor_id', p_actor_id::text, true);
  UPDATE public.workspace_members
  SET role = p_role
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) TO service_role;

COMMIT;