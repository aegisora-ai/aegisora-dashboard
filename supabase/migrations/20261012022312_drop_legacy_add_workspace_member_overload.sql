BEGIN;

-- Remove the legacy text overload. The current API contract uses member_status.
DROP FUNCTION IF EXISTS public.add_workspace_member(
    uuid,
    uuid,
    public.workspace_role,
    text,
    uuid
);

-- Refresh PostgREST's function signature cache after commit.
NOTIFY pgrst, 'reload schema';

COMMIT;