-- ============================================================
-- AEGISORA
-- Phase 3.11 - Executions Tenant Isolation
--
-- Purpose:
--   Bring the existing live public.executions table into the
--   enterprise tenant-isolation model.
--
-- Important:
--   This migration does NOT create or recreate executions.
--   The table already exists in the live database.
--
-- Security model:
--   - authenticated workspace members may SELECT executions
--     belonging to their workspace.
--   - direct authenticated writes are intentionally not exposed.
--   - server-side service-role execution remains responsible for
--     runtime writes.
-- ============================================================

DO $$
BEGIN
    IF to_regclass('public.executions') IS NULL THEN
        RAISE EXCEPTION
            'Aegisora Phase 3.11: public.executions does not exist';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'executions'
          AND column_name = 'workspace_id'
    ) THEN
        RAISE EXCEPTION
            'Aegisora Phase 3.11: public.executions.workspace_id does not exist';
    END IF;
END
$$;

ALTER TABLE public.executions
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.executions
    FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS executions_select_member
    ON public.executions;

CREATE POLICY executions_select_member
    ON public.executions
    FOR SELECT
    TO authenticated
    USING (
        public.is_member(workspace_id)
    );

REVOKE ALL
    ON TABLE public.executions
    FROM anon;

REVOKE ALL
    ON TABLE public.executions
    FROM authenticated;

GRANT SELECT
    ON TABLE public.executions
    TO authenticated;

-- Server-side service-role writes remain outside the
-- authenticated client contract.
