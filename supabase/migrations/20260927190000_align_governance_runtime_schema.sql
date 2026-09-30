-- Align the fresh-install SQL contract with fields used by the live runtime.
-- This migration is idempotent and preserves existing rows. It intentionally
-- raises on ambiguous dual columns instead of guessing which data is correct.
BEGIN;

DO $$
DECLARE c record;
BEGIN
  IF to_regclass('public.agents') IS NULL OR to_regclass('public.policies') IS NULL
     OR to_regclass('public.decisions') IS NULL OR to_regclass('public.evidence') IS NULL THEN
    RAISE EXCEPTION 'governance schema alignment requires core tables first';
  END IF;

  -- Rename the legacy agent status field without losing existing state.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agents' AND column_name='status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agents' AND column_name='state') THEN
    FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='public.agents'::regclass AND contype='c' AND pg_get_constraintdef(oid) ILIKE '%status%' LOOP
      EXECUTE format('ALTER TABLE public.agents DROP CONSTRAINT %I', c.conname);
    END LOOP;
    ALTER TABLE public.agents RENAME COLUMN status TO state;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agents' AND column_name='status')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agents' AND column_name='state') THEN
    IF EXISTS (SELECT 1 FROM public.agents WHERE upper(state) IS DISTINCT FROM upper(status)) THEN
      RAISE EXCEPTION 'agents.status and agents.state contain conflicting values; reconcile manually';
    END IF;
    ALTER TABLE public.agents ALTER COLUMN status DROP NOT NULL;
    ALTER TABLE public.agents ALTER COLUMN status DROP DEFAULT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agents' AND column_name='state') THEN
    ALTER TABLE public.agents ADD COLUMN state text;
  END IF;
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='public.agents'::regclass AND contype='c' AND pg_get_constraintdef(oid) ILIKE '%state%' LOOP
    EXECUTE format('ALTER TABLE public.agents DROP CONSTRAINT %I', c.conname);
  END LOOP;
  -- Agent state is deployment-specific:
  -- * some legacy installs use text
  -- * the hosted runtime uses public.agent_state
  --
  -- Never rewrite enum-backed values and never impose text-only enum
  -- literals on an existing deployment.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'state'
      AND udt_schema = 'pg_catalog'
      AND udt_name = 'text'
  ) THEN

    UPDATE public.agents
    SET state = CASE lower(state)
      WHEN 'active' THEN 'ACTIVE'
      WHEN 'disabled' THEN 'DISABLED'
      WHEN 'suspended' THEN 'SUSPENDED'
      ELSE state
    END;

    IF EXISTS (
      SELECT 1
      FROM public.agents
      WHERE state IS NULL
         OR upper(state) NOT IN ('ACTIVE','DISABLED','SUSPENDED')
    ) THEN
      RAISE EXCEPTION
        'agents contains an unsupported text state; reconcile it before schema alignment';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'public.agents'::regclass
        AND conname = 'agents_state_allowed'
    ) THEN
      ALTER TABLE public.agents
        ADD CONSTRAINT agents_state_allowed
        CHECK (upper(state) IN ('ACTIVE','DISABLED','SUSPENDED'));
    END IF;

  ELSE

    -- Existing enum-backed state is already constrained by its enum type.
    -- Do not add a CHECK containing literals that may not exist in that enum.
    NULL;

  END IF;

  -- Canonical runtime name for policy effects.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='policies' AND column_name='effect')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='policies' AND column_name='decision') THEN
    ALTER TABLE public.policies RENAME COLUMN effect TO decision;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='policies' AND column_name='effect')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='policies' AND column_name='decision') THEN
    IF EXISTS (SELECT 1 FROM public.policies WHERE effect IS DISTINCT FROM decision) THEN
      RAISE EXCEPTION 'policies.effect and policies.decision contain conflicting values; reconcile manually';
    END IF;
    ALTER TABLE public.policies ALTER COLUMN effect DROP NOT NULL;
    ALTER TABLE public.policies ALTER COLUMN effect DROP DEFAULT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='policies' AND column_name='decision') THEN
    RAISE EXCEPTION 'policies has neither effect nor decision column';
  END IF;
  IF EXISTS (SELECT 1 FROM public.policies WHERE decision IS NULL OR decision NOT IN ('ALLOW','BLOCK','ESCALATE')) THEN
    RAISE EXCEPTION 'policies contains an unsupported decision value';
  END IF;
  ALTER TABLE public.policies ALTER COLUMN decision SET NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.policies'::regclass AND conname='policies_decision_allowed') THEN
    ALTER TABLE public.policies ADD CONSTRAINT policies_decision_allowed CHECK (decision IN ('ALLOW','BLOCK','ESCALATE'));
  END IF;

  -- Canonical runtime name for persisted decisions.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decisions' AND column_name='effect')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decisions' AND column_name='decision') THEN
    ALTER TABLE public.decisions RENAME COLUMN effect TO decision;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decisions' AND column_name='effect')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decisions' AND column_name='decision') THEN
    IF EXISTS (SELECT 1 FROM public.decisions WHERE effect IS DISTINCT FROM decision) THEN
      RAISE EXCEPTION 'decisions.effect and decisions.decision contain conflicting values; reconcile manually';
    END IF;
    ALTER TABLE public.decisions ALTER COLUMN effect DROP NOT NULL;
    ALTER TABLE public.decisions ALTER COLUMN effect DROP DEFAULT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='decisions' AND column_name='decision') THEN
    RAISE EXCEPTION 'decisions has neither effect nor decision column';
  END IF;
  IF EXISTS (SELECT 1 FROM public.decisions WHERE decision IS NULL OR decision NOT IN ('ALLOW','BLOCK','ESCALATE')) THEN
    RAISE EXCEPTION 'decisions contains an unsupported decision value';
  END IF;
  ALTER TABLE public.decisions ALTER COLUMN decision SET NOT NULL;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.decisions'::regclass AND conname='decisions_decision_allowed') THEN
    ALTER TABLE public.decisions ADD CONSTRAINT decisions_decision_allowed CHECK (decision IN ('ALLOW','BLOCK','ESCALATE'));
  END IF;

  -- The evaluation route writes these attributes. Backfill only missing legacy
  -- fields with an explicit sentinel; never copy unreviewed historical payloads.
  ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS agent_name text;
  ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS action text;
  ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS resource text;
  ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS input jsonb;
  UPDATE public.decisions SET agent_name='unknown' WHERE agent_name IS NULL;
  UPDATE public.decisions SET action='unknown' WHERE action IS NULL;
  UPDATE public.decisions SET resource='' WHERE resource IS NULL;
  ALTER TABLE public.decisions ALTER COLUMN agent_name SET NOT NULL;
  ALTER TABLE public.decisions ALTER COLUMN action SET NOT NULL;
  ALTER TABLE public.decisions ALTER COLUMN resource SET DEFAULT '';
  ALTER TABLE public.decisions ALTER COLUMN resource SET NOT NULL;
END $$;

-- The old deployment managed this table separately; fresh installs need the
-- same server-write shape before the tenant-isolation migration is applied.
CREATE TABLE IF NOT EXISTS public.executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  action text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('ALLOW','BLOCK','ESCALATE')),
  trace_id text,
  risk_score int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS executions_ws_created ON public.executions (workspace_id, created_at DESC);

ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS execution_id uuid;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS decision text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.evidence'::regclass AND conname='evidence_execution_id_fkey') THEN
    ALTER TABLE public.evidence ADD CONSTRAINT evidence_execution_id_fkey
      FOREIGN KEY (execution_id) REFERENCES public.executions(id) ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.evidence'::regclass AND conname='evidence_agent_id_fkey') THEN
    ALTER TABLE public.evidence ADD CONSTRAINT evidence_agent_id_fkey
      FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.evidence'::regclass AND conname='evidence_decision_allowed') THEN
    ALTER TABLE public.evidence ADD CONSTRAINT evidence_decision_allowed
      CHECK (decision IS NULL OR decision IN ('ALLOW','BLOCK','ESCALATE')) NOT VALID;
  END IF;
END $$;

COMMIT;



