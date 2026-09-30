BEGIN;

-- Hosted compatibility: some existing deployments store membership status
-- as text and do not define public.member_status. Preserve the RPC contract
-- without changing existing workspace_members.status data.
DO $$
BEGIN
  IF to_regtype('public.member_status') IS NULL THEN
    CREATE DOMAIN public.member_status AS text
      CHECK (VALUE IN ('active', 'invited'));
  END IF;
END
$$;
-- Record membership lifecycle and role changes in the same transaction.
-- Audit rows are retained if a member is removed; the actor, target and role
-- transition are captured without copying PII into the event metadata.

CREATE OR REPLACE FUNCTION public.audit_workspace_member_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_workspace_id uuid;
  event_user_id uuid;
  event_action text;
  event_meta jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    event_workspace_id := OLD.workspace_id;
    event_user_id := OLD.user_id;
    event_action := 'workspace_members.delete';
    event_meta := jsonb_build_object('old_role', OLD.role, 'old_status', OLD.status);
  ELSIF TG_OP = 'INSERT' THEN
    event_workspace_id := NEW.workspace_id;
    event_user_id := NEW.user_id;
    event_action := 'workspace_members.insert';
    event_meta := jsonb_build_object('new_role', NEW.role, 'new_status', NEW.status);
  ELSE
    event_workspace_id := NEW.workspace_id;
    event_user_id := NEW.user_id;
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      event_action := 'workspace_members.role_change';
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      event_action := 'workspace_members.status_change';
    ELSE
      event_action := 'workspace_members.update';
    END IF;
    event_meta := jsonb_build_object(
      'old_role', OLD.role, 'new_role', NEW.role,
      'old_status', OLD.status, 'new_status', NEW.status
    );
  END IF;

  -- During workspace ON DELETE CASCADE, the parent workspace may already
  -- be absent when workspace_members DELETE triggers execute. Do not create
  -- an audit row with a dangling workspace_id during that cleanup path.
  IF event_workspace_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = event_workspace_id
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.audit_events
    (workspace_id, actor, action, target_type, target_id, meta)
  VALUES
    (event_workspace_id, coalesce(auth.uid()::text, nullif(current_setting('aegisora.actor_id', true), ''), 'system'), event_action,
     'workspace_member', event_user_id::text, event_meta);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS workspace_members_audit_trg ON public.workspace_members;
CREATE TRIGGER workspace_members_audit_trg
AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
FOR EACH ROW EXECUTE FUNCTION public.audit_workspace_member_change();

-- Audit events are append-only to authenticated clients. Service-role access
-- remains available to incident response and retention jobs.
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_events FROM anon, authenticated;
GRANT SELECT ON public.audit_events TO authenticated;

DROP POLICY IF EXISTS audit_events_select_member ON public.audit_events;
CREATE POLICY audit_events_select_member ON public.audit_events
FOR SELECT TO authenticated
USING (public.is_member(workspace_id));

-- Service-side membership mutations set the authenticated actor in a
-- transaction-local setting; the trigger above writes the audit row in that
-- same transaction. Public clients cannot execute these RPCs.
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
    (p_role::text = 'ADMIN' AND target_role::text <> 'ADMIN')
  ) THEN
    RAISE EXCEPTION 'owner-only role change';
  END IF;
  PERFORM set_config('aegisora.actor_id', p_actor_id::text, true);
  UPDATE public.workspace_members
  SET role = p_role
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND status = 'active';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_workspace_member(
  p_workspace_id uuid, p_user_id uuid, p_role public.workspace_role,
  p_status public.member_status, p_actor_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE actor_role public.workspace_role;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_workspace_id::text, 0));
  SELECT role INTO actor_role FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_actor_id AND status::text = 'active' FOR UPDATE;
  IF NOT FOUND OR actor_role::text NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'active workspace administrator required';
  END IF;
  IF actor_role::text = 'ADMIN' AND p_role::text NOT IN ('OPERATOR', 'VIEWER') THEN
    RAISE EXCEPTION 'only owners may invite administrators';
  END IF;
  PERFORM set_config('aegisora.actor_id', p_actor_id::text, true);
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (p_workspace_id, p_user_id, p_role, p_status);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_workspace_member(
  p_workspace_id uuid, p_user_id uuid, p_actor_id uuid
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_role public.workspace_role; actor_role public.workspace_role; affected integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_workspace_id::text, 0));
  SELECT role INTO actor_role FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_actor_id AND status::text = 'active' FOR UPDATE;
  IF NOT FOUND OR actor_role::text NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'active workspace administrator required';
  END IF;
  SELECT role INTO target_role FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF actor_role::text = 'ADMIN' AND target_role::text IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'only owners may remove administrators';
  END IF;
  IF target_role::text = 'OWNER' AND (
    SELECT count(*) FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND role::text = 'OWNER' AND status::text = 'active'
  ) <= 1 THEN
    RAISE EXCEPTION 'last active workspace owner cannot be removed';
  END IF;
  PERFORM set_config('aegisora.actor_id', p_actor_id::text, true);
  DELETE FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = p_user_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_workspace_invites(p_user_id uuid, p_actor_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE affected integer;
BEGIN
  IF p_user_id IS DISTINCT FROM p_actor_id THEN
    RAISE EXCEPTION 'invite acceptance actor must match the invited user';
  END IF;
  PERFORM set_config('aegisora.actor_id', p_actor_id::text, true);
  UPDATE public.workspace_members SET status = 'active'
  WHERE user_id = p_user_id AND status = 'invited';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_workspace_member(uuid, uuid, public.workspace_role, public.member_status, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_workspace_member(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_workspace_invites(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_workspace_member_role(uuid, uuid, public.workspace_role, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_workspace_member(uuid, uuid, public.workspace_role, public.member_status, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_workspace_member(uuid, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invites(uuid, uuid) TO service_role;

COMMIT;

