-- ============================================================
-- AEGISORA CANONICAL PRODUCTION SCHEMA BASELINE
-- Source: direct PostgreSQL production catalog
-- Production: hypbttzeqeupwdzbgwbd
-- Staging target: bvdsfwmlylnmahridalj
-- Generated: 2026-09-28T15:20:04.7050595Z
--
-- IMPORTANT:
-- This migration is intended for the staging project first.
-- It was generated from verified production DDL evidence.
-- No production database write was performed by this script.
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSION PREREQUISITES
-- ------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

-- ENUM: agent_state
DO $$ BEGIN
CREATE TYPE public.agent_state AS ENUM ('ACTIVE', 'DEGRADED', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: policy_change_status
DO $$ BEGIN
CREATE TYPE public.policy_change_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'APPLIED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: security_decision
DO $$ BEGIN
CREATE TYPE public.security_decision AS ENUM ('ALLOW', 'BLOCK', 'ESCALATE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: workspace_role
DO $$ BEGIN
CREATE TYPE public.workspace_role AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

-- TABLE: agents
CREATE TABLE IF NOT EXISTS public.agents (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
external_id text,
name text NOT NULL,
provider text,
model text,
state agent_state DEFAULT 'ACTIVE'::agent_state NOT NULL,
risk_score integer DEFAULT 0 NOT NULL,
last_seen_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL,
framework text,
description text,
source text DEFAULT 'manual'::text NOT NULL,
metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- TABLE: api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
name text NOT NULL,
prefix text NOT NULL,
key_hash text NOT NULL,
created_by uuid,
last_used_at timestamp with time zone,
revoked_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: api_rate_limits
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
bucket_key text NOT NULL,
window_started_at timestamp with time zone NOT NULL,
request_count integer DEFAULT 0 NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: approvals
CREATE TABLE IF NOT EXISTS public.approvals (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
decision_id uuid NOT NULL,
agent_id uuid,
agent_name text,
action text,
resource text,
status text DEFAULT 'pending'::text NOT NULL,
note text,
requested_at timestamp with time zone DEFAULT now() NOT NULL,
expires_at timestamp with time zone NOT NULL,
resolved_by uuid,
resolved_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: audit_events
CREATE TABLE IF NOT EXISTS public.audit_events (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
actor_user_id uuid,
event_type text DEFAULT 'system'::text NOT NULL,
resource_type text DEFAULT 'system'::text NOT NULL,
resource_id text,
summary text DEFAULT ''::text NOT NULL,
metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
actor text NOT NULL,
action text NOT NULL,
target_type text,
target_id text,
meta jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- TABLE: decisions
CREATE TABLE IF NOT EXISTS public.decisions (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
execution_id uuid,
agent_id uuid,
decision security_decision NOT NULL,
reason text NOT NULL,
risk_score integer DEFAULT 0 NOT NULL,
trace_id text NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
policy_id uuid,
agent_name text NOT NULL,
action text NOT NULL,
resource text DEFAULT ''::text NOT NULL,
input jsonb
);

-- TABLE: evidence
CREATE TABLE IF NOT EXISTS public.evidence (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
decision_id uuid,
execution_id uuid,
agent_id uuid,
action text NOT NULL,
decision security_decision NOT NULL,
trace_id text NOT NULL,
payload jsonb DEFAULT '{}'::jsonb NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
hash text GENERATED ALWAYS AS (encode(digest((payload)::text, 'sha256'::text), 'hex'::text)) STORED,
seq bigint,
prev_hash text
);

-- TABLE: executions
CREATE TABLE IF NOT EXISTS public.executions (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
agent_id uuid,
action text NOT NULL,
provider text,
model text,
decision security_decision NOT NULL,
trace_id text NOT NULL,
risk_score integer DEFAULT 0 NOT NULL,
duration_ms integer,
created_at timestamp with time zone DEFAULT now() NOT NULL,
event_id text,
state text DEFAULT 'COMPLETED'::text NOT NULL
);

-- TABLE: global_search_documents
CREATE TABLE IF NOT EXISTS public.global_search_documents (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
resource_type text NOT NULL,
resource_id text NOT NULL,
title text NOT NULL,
subtitle text DEFAULT ''::text NOT NULL,
href text NOT NULL,
search_text text NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: incidents
CREATE TABLE IF NOT EXISTS public.incidents (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
decision_id uuid,
severity text DEFAULT 'medium'::text NOT NULL,
title text NOT NULL,
status text DEFAULT 'open'::text NOT NULL,
resolved_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: policies
CREATE TABLE IF NOT EXISTS public.policies (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
name text NOT NULL,
scope text DEFAULT 'workspace'::text NOT NULL,
decision security_decision NOT NULL,
mode text DEFAULT 'ENFORCED'::text NOT NULL,
enabled boolean DEFAULT true NOT NULL,
version integer DEFAULT 1 NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL,
conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
agent_id uuid,
action_pattern text,
resource_pattern text,
priority integer DEFAULT 100 NOT NULL
);

-- TABLE: policy_audit_events
CREATE TABLE IF NOT EXISTS public.policy_audit_events (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
policy_id uuid,
change_request_id uuid,
actor_id uuid,
action text NOT NULL,
detail jsonb DEFAULT '{}'::jsonb NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: policy_change_requests
CREATE TABLE IF NOT EXISTS public.policy_change_requests (
id uuid DEFAULT gen_random_uuid() NOT NULL,
policy_id uuid NOT NULL,
workspace_id uuid NOT NULL,
requested_by uuid NOT NULL,
reviewed_by uuid,
status policy_change_status DEFAULT 'PENDING_APPROVAL'::policy_change_status NOT NULL,
reason text NOT NULL,
proposed_version integer NOT NULL,
proposed_document jsonb DEFAULT '{}'::jsonb NOT NULL,
review_note text,
created_at timestamp with time zone DEFAULT now() NOT NULL,
reviewed_at timestamp with time zone
);

-- TABLE: policy_versions
CREATE TABLE IF NOT EXISTS public.policy_versions (
id uuid DEFAULT gen_random_uuid() NOT NULL,
policy_id uuid NOT NULL,
workspace_id uuid NOT NULL,
version integer NOT NULL,
name text NOT NULL,
scope text NOT NULL,
decision security_decision NOT NULL,
mode text NOT NULL,
enabled boolean DEFAULT true NOT NULL,
conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
created_by uuid,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
id uuid NOT NULL,
full_name text,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL,
onboarded_at timestamp with time zone
);

-- TABLE: risk_rules
CREATE TABLE IF NOT EXISTS public.risk_rules (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
name text NOT NULL,
description text,
enabled boolean DEFAULT true NOT NULL,
severity text DEFAULT 'MEDIUM'::text NOT NULL,
score integer DEFAULT 10 NOT NULL,
condition jsonb DEFAULT '{}'::jsonb NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: service_account_keys
CREATE TABLE IF NOT EXISTS public.service_account_keys (
id uuid DEFAULT gen_random_uuid() NOT NULL,
service_account_id uuid NOT NULL,
workspace_id uuid NOT NULL,
name text NOT NULL,
key_prefix text NOT NULL,
key_hash text NOT NULL,
scopes jsonb DEFAULT '[]'::jsonb NOT NULL,
status text DEFAULT 'ACTIVE'::text NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
expires_at timestamp with time zone,
revoked_at timestamp with time zone,
last_used_at timestamp with time zone
);

-- TABLE: service_accounts
CREATE TABLE IF NOT EXISTS public.service_accounts (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
created_by uuid NOT NULL,
name text NOT NULL,
description text,
status text DEFAULT 'ACTIVE'::text NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL,
last_used_at timestamp with time zone
);

-- TABLE: traces
CREATE TABLE IF NOT EXISTS public.traces (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
agent_id uuid,
agent_name text,
trace_id text NOT NULL,
name text,
decision_id uuid,
status text DEFAULT 'ok'::text NOT NULL,
duration_ms integer,
spans jsonb DEFAULT '[]'::jsonb NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
url text NOT NULL,
events text[] DEFAULT ARRAY['decision.block'::text, 'decision.escalate'::text] NOT NULL,
secret text NOT NULL,
enabled boolean DEFAULT true NOT NULL,
last_status integer,
last_delivery_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: workspace_invitations
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
id uuid DEFAULT gen_random_uuid() NOT NULL,
workspace_id uuid NOT NULL,
email text NOT NULL,
role workspace_role DEFAULT 'VIEWER'::workspace_role NOT NULL,
status text DEFAULT 'PENDING'::text NOT NULL,
invited_by uuid,
created_at timestamp with time zone DEFAULT now() NOT NULL,
expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL
);

-- TABLE: workspace_members
CREATE TABLE IF NOT EXISTS public.workspace_members (
workspace_id uuid NOT NULL,
user_id uuid NOT NULL,
role workspace_role DEFAULT 'VIEWER'::workspace_role NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
status text DEFAULT 'active'::text
);

-- TABLE: workspace_settings
CREATE TABLE IF NOT EXISTS public.workspace_settings (
workspace_id uuid NOT NULL,
default_effect text DEFAULT 'BLOCK'::text NOT NULL,
auto_register_agents boolean DEFAULT true NOT NULL,
approval_expiry_hours integer DEFAULT 24 NOT NULL,
alert_on_block boolean DEFAULT true NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- TABLE: workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
id uuid DEFAULT gen_random_uuid() NOT NULL,
name text NOT NULL,
slug text NOT NULL,
created_at timestamp with time zone DEFAULT now() NOT NULL,
updated_at timestamp with time zone DEFAULT now() NOT NULL,
created_by uuid
);

-- ------------------------------------------------------------
-- CONSTRAINTS
-- ------------------------------------------------------------

-- CONSTRAINT: agents.agents_pkey
ALTER TABLE public.agents ADD CONSTRAINT agents_pkey PRIMARY KEY (id);

-- CONSTRAINT: agents.agents_risk_score_check
ALTER TABLE public.agents ADD CONSTRAINT agents_risk_score_check CHECK (risk_score >= 0 AND risk_score <= 100);

-- CONSTRAINT: agents.agents_workspace_id_external_id_key
ALTER TABLE public.agents ADD CONSTRAINT agents_workspace_id_external_id_key UNIQUE (workspace_id, external_id);

-- CONSTRAINT: agents.agents_workspace_id_fkey
ALTER TABLE public.agents ADD CONSTRAINT agents_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: agents.agents_workspace_id_name_key
ALTER TABLE public.agents ADD CONSTRAINT agents_workspace_id_name_key UNIQUE (workspace_id, name);

-- CONSTRAINT: api_keys.api_keys_created_by_fkey
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- CONSTRAINT: api_keys.api_keys_key_hash_key
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);

-- CONSTRAINT: api_keys.api_keys_pkey
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);

-- CONSTRAINT: api_keys.api_keys_workspace_id_fkey
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: api_rate_limits.api_rate_limits_pkey
ALTER TABLE public.api_rate_limits ADD CONSTRAINT api_rate_limits_pkey PRIMARY KEY (bucket_key);

-- CONSTRAINT: api_rate_limits.api_rate_limits_request_count_nonnegative
ALTER TABLE public.api_rate_limits ADD CONSTRAINT api_rate_limits_request_count_nonnegative CHECK (request_count >= 0);

-- CONSTRAINT: approvals.approvals_agent_id_fkey
ALTER TABLE public.approvals ADD CONSTRAINT approvals_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- CONSTRAINT: approvals.approvals_decision_id_fkey
ALTER TABLE public.approvals ADD CONSTRAINT approvals_decision_id_fkey FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE;

-- CONSTRAINT: approvals.approvals_pkey
ALTER TABLE public.approvals ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);

-- CONSTRAINT: approvals.approvals_resolved_by_fkey
ALTER TABLE public.approvals ADD CONSTRAINT approvals_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id);

-- CONSTRAINT: approvals.approvals_status_check
ALTER TABLE public.approvals ADD CONSTRAINT approvals_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text]));

-- CONSTRAINT: approvals.approvals_workspace_id_fkey
ALTER TABLE public.approvals ADD CONSTRAINT approvals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: audit_events.audit_events_actor_user_id_fkey
ALTER TABLE public.audit_events ADD CONSTRAINT audit_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- CONSTRAINT: audit_events.audit_events_pkey
ALTER TABLE public.audit_events ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);

-- CONSTRAINT: audit_events.audit_events_workspace_id_fkey
ALTER TABLE public.audit_events ADD CONSTRAINT audit_events_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: decisions.decisions_agent_id_fkey
ALTER TABLE public.decisions ADD CONSTRAINT decisions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- CONSTRAINT: decisions.decisions_decision_allowed
ALTER TABLE public.decisions ADD CONSTRAINT decisions_decision_allowed CHECK (decision = ANY (ARRAY['ALLOW'::security_decision, 'BLOCK'::security_decision, 'ESCALATE'::security_decision]));

-- CONSTRAINT: decisions.decisions_decision_check
ALTER TABLE public.decisions ADD CONSTRAINT decisions_decision_check CHECK (decision = ANY (ARRAY['ALLOW'::security_decision, 'BLOCK'::security_decision, 'ESCALATE'::security_decision]));

-- CONSTRAINT: decisions.decisions_execution_id_fkey
ALTER TABLE public.decisions ADD CONSTRAINT decisions_execution_id_fkey FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE;

-- CONSTRAINT: decisions.decisions_pkey
ALTER TABLE public.decisions ADD CONSTRAINT decisions_pkey PRIMARY KEY (id);

-- CONSTRAINT: decisions.decisions_policy_id_fkey
ALTER TABLE public.decisions ADD CONSTRAINT decisions_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES policies(id);

-- CONSTRAINT: decisions.decisions_risk_score_check
ALTER TABLE public.decisions ADD CONSTRAINT decisions_risk_score_check CHECK (risk_score >= 0 AND risk_score <= 100);

-- CONSTRAINT: decisions.decisions_workspace_id_fkey
ALTER TABLE public.decisions ADD CONSTRAINT decisions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: evidence.evidence_agent_id_fkey
ALTER TABLE public.evidence ADD CONSTRAINT evidence_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- CONSTRAINT: evidence.evidence_decision_allowed
ALTER TABLE public.evidence ADD CONSTRAINT evidence_decision_allowed CHECK (decision IS NULL OR (decision = ANY (ARRAY['ALLOW'::security_decision, 'BLOCK'::security_decision, 'ESCALATE'::security_decision]))) NOT VALID;

-- CONSTRAINT: evidence.evidence_decision_id_fkey
ALTER TABLE public.evidence ADD CONSTRAINT evidence_decision_id_fkey FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE SET NULL;

-- CONSTRAINT: evidence.evidence_execution_id_fkey
ALTER TABLE public.evidence ADD CONSTRAINT evidence_execution_id_fkey FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE SET NULL;

-- CONSTRAINT: evidence.evidence_pkey
ALTER TABLE public.evidence ADD CONSTRAINT evidence_pkey PRIMARY KEY (id);

-- CONSTRAINT: evidence.evidence_workspace_id_fkey
ALTER TABLE public.evidence ADD CONSTRAINT evidence_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: executions.executions_agent_id_fkey
ALTER TABLE public.executions ADD CONSTRAINT executions_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- CONSTRAINT: executions.executions_pkey
ALTER TABLE public.executions ADD CONSTRAINT executions_pkey PRIMARY KEY (id);

-- CONSTRAINT: executions.executions_risk_score_check
ALTER TABLE public.executions ADD CONSTRAINT executions_risk_score_check CHECK (risk_score >= 0 AND risk_score <= 100);

-- CONSTRAINT: executions.executions_state_check
ALTER TABLE public.executions ADD CONSTRAINT executions_state_check CHECK (state = ANY (ARRAY['PENDING'::text, 'RUNNING'::text, 'COMPLETED'::text, 'BLOCKED'::text, 'ESCALATED'::text, 'FAILED'::text]));

-- CONSTRAINT: executions.executions_workspace_id_fkey
ALTER TABLE public.executions ADD CONSTRAINT executions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: global_search_documents.global_search_documents_pkey
ALTER TABLE public.global_search_documents ADD CONSTRAINT global_search_documents_pkey PRIMARY KEY (id);

-- CONSTRAINT: global_search_documents.global_search_documents_workspace_id_fk
ALTER TABLE public.global_search_documents ADD CONSTRAINT global_search_documents_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: incidents.incidents_decision_id_fkey
ALTER TABLE public.incidents ADD CONSTRAINT incidents_decision_id_fkey FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE SET NULL;

-- CONSTRAINT: incidents.incidents_pkey
ALTER TABLE public.incidents ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);

-- CONSTRAINT: incidents.incidents_severity_check
ALTER TABLE public.incidents ADD CONSTRAINT incidents_severity_check CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]));

-- CONSTRAINT: incidents.incidents_status_check
ALTER TABLE public.incidents ADD CONSTRAINT incidents_status_check CHECK (status = ANY (ARRAY['open'::text, 'resolved'::text]));

-- CONSTRAINT: incidents.incidents_workspace_id_fkey
ALTER TABLE public.incidents ADD CONSTRAINT incidents_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: policies.policies_agent_id_fkey
ALTER TABLE public.policies ADD CONSTRAINT policies_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id);

-- CONSTRAINT: policies.policies_decision_allowed
ALTER TABLE public.policies ADD CONSTRAINT policies_decision_allowed CHECK (decision = ANY (ARRAY['ALLOW'::security_decision, 'BLOCK'::security_decision, 'ESCALATE'::security_decision]));

-- CONSTRAINT: policies.policies_pkey
ALTER TABLE public.policies ADD CONSTRAINT policies_pkey PRIMARY KEY (id);

-- CONSTRAINT: policies.policies_workspace_id_fkey
ALTER TABLE public.policies ADD CONSTRAINT policies_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_audit_events.policy_audit_events_actor_id_fkey
ALTER TABLE public.policy_audit_events ADD CONSTRAINT policy_audit_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- CONSTRAINT: policy_audit_events.policy_audit_events_change_request_id_fkey
ALTER TABLE public.policy_audit_events ADD CONSTRAINT policy_audit_events_change_request_id_fkey FOREIGN KEY (change_request_id) REFERENCES policy_change_requests(id) ON DELETE SET NULL;

-- CONSTRAINT: policy_audit_events.policy_audit_events_pkey
ALTER TABLE public.policy_audit_events ADD CONSTRAINT policy_audit_events_pkey PRIMARY KEY (id);

-- CONSTRAINT: policy_audit_events.policy_audit_events_policy_id_fkey
ALTER TABLE public.policy_audit_events ADD CONSTRAINT policy_audit_events_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL;

-- CONSTRAINT: policy_audit_events.policy_audit_events_workspace_id_fkey
ALTER TABLE public.policy_audit_events ADD CONSTRAINT policy_audit_events_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_change_requests.policy_change_requests_pkey
ALTER TABLE public.policy_change_requests ADD CONSTRAINT policy_change_requests_pkey PRIMARY KEY (id);

-- CONSTRAINT: policy_change_requests.policy_change_requests_policy_id_fkey
ALTER TABLE public.policy_change_requests ADD CONSTRAINT policy_change_requests_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_change_requests.policy_change_requests_requested_by_fkey
ALTER TABLE public.policy_change_requests ADD CONSTRAINT policy_change_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_change_requests.policy_change_requests_reviewed_by_fkey
ALTER TABLE public.policy_change_requests ADD CONSTRAINT policy_change_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- CONSTRAINT: policy_change_requests.policy_change_requests_workspace_id_fkey
ALTER TABLE public.policy_change_requests ADD CONSTRAINT policy_change_requests_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_versions.policy_versions_created_by_fkey
ALTER TABLE public.policy_versions ADD CONSTRAINT policy_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- CONSTRAINT: policy_versions.policy_versions_pkey
ALTER TABLE public.policy_versions ADD CONSTRAINT policy_versions_pkey PRIMARY KEY (id);

-- CONSTRAINT: policy_versions.policy_versions_policy_id_fkey
ALTER TABLE public.policy_versions ADD CONSTRAINT policy_versions_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE;

-- CONSTRAINT: policy_versions.policy_versions_policy_id_version_key
ALTER TABLE public.policy_versions ADD CONSTRAINT policy_versions_policy_id_version_key UNIQUE (policy_id, version);

-- CONSTRAINT: policy_versions.policy_versions_workspace_id_fkey
ALTER TABLE public.policy_versions ADD CONSTRAINT policy_versions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: profiles.profiles_id_fkey
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- CONSTRAINT: profiles.profiles_pkey
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- CONSTRAINT: risk_rules.risk_rules_pkey
ALTER TABLE public.risk_rules ADD CONSTRAINT risk_rules_pkey PRIMARY KEY (id);

-- CONSTRAINT: risk_rules.risk_rules_score_check
ALTER TABLE public.risk_rules ADD CONSTRAINT risk_rules_score_check CHECK (score >= 0 AND score <= 100);

-- CONSTRAINT: risk_rules.risk_rules_workspace_id_fkey
ALTER TABLE public.risk_rules ADD CONSTRAINT risk_rules_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: service_account_keys.service_account_keys_key_hash_key
ALTER TABLE public.service_account_keys ADD CONSTRAINT service_account_keys_key_hash_key UNIQUE (key_hash);

-- CONSTRAINT: service_account_keys.service_account_keys_pkey
ALTER TABLE public.service_account_keys ADD CONSTRAINT service_account_keys_pkey PRIMARY KEY (id);

-- CONSTRAINT: service_account_keys.service_account_keys_service_account_id_fk
ALTER TABLE public.service_account_keys ADD CONSTRAINT service_account_keys_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES service_accounts(id) ON DELETE CASCADE;

-- CONSTRAINT: service_account_keys.service_account_keys_status_check
ALTER TABLE public.service_account_keys ADD CONSTRAINT service_account_keys_status_check CHECK (status = ANY (ARRAY['ACTIVE'::text, 'REVOKED'::text, 'EXPIRED'::text]));

-- CONSTRAINT: service_account_keys.service_account_keys_workspace_id_fkey
ALTER TABLE public.service_account_keys ADD CONSTRAINT service_account_keys_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: service_accounts.service_accounts_created_by_fkey
ALTER TABLE public.service_accounts ADD CONSTRAINT service_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

-- CONSTRAINT: service_accounts.service_accounts_pkey
ALTER TABLE public.service_accounts ADD CONSTRAINT service_accounts_pkey PRIMARY KEY (id);

-- CONSTRAINT: service_accounts.service_accounts_status_check
ALTER TABLE public.service_accounts ADD CONSTRAINT service_accounts_status_check CHECK (status = ANY (ARRAY['ACTIVE'::text, 'DISABLED'::text, 'REVOKED'::text]));

-- CONSTRAINT: service_accounts.service_accounts_workspace_id_fkey
ALTER TABLE public.service_accounts ADD CONSTRAINT service_accounts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: traces.traces_agent_id_fkey
ALTER TABLE public.traces ADD CONSTRAINT traces_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL;

-- CONSTRAINT: traces.traces_pkey
ALTER TABLE public.traces ADD CONSTRAINT traces_pkey PRIMARY KEY (id);

-- CONSTRAINT: traces.traces_workspace_id_fkey
ALTER TABLE public.traces ADD CONSTRAINT traces_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: webhooks.webhooks_pkey
ALTER TABLE public.webhooks ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);

-- CONSTRAINT: webhooks.webhooks_url_check
ALTER TABLE public.webhooks ADD CONSTRAINT webhooks_url_check CHECK (url ~ '^https://'::text);

-- CONSTRAINT: webhooks.webhooks_workspace_id_fkey
ALTER TABLE public.webhooks ADD CONSTRAINT webhooks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: workspace_invitations.workspace_invitations_invited_by_fkey
ALTER TABLE public.workspace_invitations ADD CONSTRAINT workspace_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- CONSTRAINT: workspace_invitations.workspace_invitations_pkey
ALTER TABLE public.workspace_invitations ADD CONSTRAINT workspace_invitations_pkey PRIMARY KEY (id);

-- CONSTRAINT: workspace_invitations.workspace_invitations_workspace_id_fkey
ALTER TABLE public.workspace_invitations ADD CONSTRAINT workspace_invitations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: workspace_members.workspace_members_pkey
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (workspace_id, user_id);

-- CONSTRAINT: workspace_members.workspace_members_user_id_fkey
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- CONSTRAINT: workspace_members.workspace_members_workspace_id_fkey
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: workspace_settings.workspace_settings_approval_expiry_hours_che
ALTER TABLE public.workspace_settings ADD CONSTRAINT workspace_settings_approval_expiry_hours_check CHECK (approval_expiry_hours >= 1 AND approval_expiry_hours <= 720);

-- CONSTRAINT: workspace_settings.workspace_settings_default_effect_check
ALTER TABLE public.workspace_settings ADD CONSTRAINT workspace_settings_default_effect_check CHECK (default_effect = ANY (ARRAY['ALLOW'::text, 'BLOCK'::text, 'ESCALATE'::text]));

-- CONSTRAINT: workspace_settings.workspace_settings_pkey
ALTER TABLE public.workspace_settings ADD CONSTRAINT workspace_settings_pkey PRIMARY KEY (workspace_id);

-- CONSTRAINT: workspace_settings.workspace_settings_workspace_id_fkey
ALTER TABLE public.workspace_settings ADD CONSTRAINT workspace_settings_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- CONSTRAINT: workspaces.workspaces_created_by_fkey
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- CONSTRAINT: workspaces.workspaces_pkey
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);

-- CONSTRAINT: workspaces.workspaces_slug_key
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_slug_key UNIQUE (slug);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------

-- INDEX: agents.idx_agents_last_seen
CREATE INDEX idx_agents_last_seen ON public.agents USING btree (workspace_id, last_seen_at DESC);

-- INDEX: agents.idx_agents_workspace
CREATE INDEX idx_agents_workspace ON public.agents USING btree (workspace_id);

-- INDEX: agents.idx_agents_workspace_id
CREATE INDEX idx_agents_workspace_id ON public.agents USING btree (workspace_id);

-- INDEX: audit_events.audit_ws_created
CREATE INDEX audit_ws_created ON public.audit_events USING btree (workspace_id, created_at DESC);

-- INDEX: audit_events.idx_audit_events_workspace
CREATE INDEX idx_audit_events_workspace ON public.audit_events USING btree (workspace_id, created_at DESC);

-- INDEX: decisions.decisions_ws_created
CREATE INDEX decisions_ws_created ON public.decisions USING btree (workspace_id, created_at DESC);

-- INDEX: decisions.idx_decisions_trace_created
CREATE INDEX idx_decisions_trace_created ON public.decisions USING btree (trace_id, created_at DESC);

-- INDEX: decisions.idx_decisions_workspace_created
CREATE INDEX idx_decisions_workspace_created ON public.decisions USING btree (workspace_id, created_at DESC);

-- INDEX: decisions.idx_decisions_workspace_decision
CREATE INDEX idx_decisions_workspace_decision ON public.decisions USING btree (workspace_id, decision);

-- INDEX: decisions.idx_decisions_workspace_id
CREATE INDEX idx_decisions_workspace_id ON public.decisions USING btree (workspace_id);

-- INDEX: evidence.idx_evidence_trace_created
CREATE INDEX idx_evidence_trace_created ON public.evidence USING btree (trace_id, created_at DESC);

-- INDEX: evidence.idx_evidence_workspace_created
CREATE INDEX idx_evidence_workspace_created ON public.evidence USING btree (workspace_id, created_at DESC);

-- INDEX: evidence.idx_evidence_workspace_id
CREATE INDEX idx_evidence_workspace_id ON public.evidence USING btree (workspace_id);

-- INDEX: executions.executions_ws_created
CREATE INDEX executions_ws_created ON public.executions USING btree (workspace_id, created_at DESC);

-- INDEX: executions.idx_executions_trace_created
CREATE INDEX idx_executions_trace_created ON public.executions USING btree (trace_id, created_at DESC);

-- INDEX: executions.idx_executions_trace_id
CREATE INDEX idx_executions_trace_id ON public.executions USING btree (trace_id);

-- INDEX: executions.idx_executions_workspace_created
CREATE INDEX idx_executions_workspace_created ON public.executions USING btree (workspace_id, created_at DESC);

-- INDEX: executions.idx_executions_workspace_id
CREATE INDEX idx_executions_workspace_id ON public.executions USING btree (workspace_id);

-- INDEX: executions.idx_executions_workspace_state
CREATE INDEX idx_executions_workspace_state ON public.executions USING btree (workspace_id, state);

-- INDEX: global_search_documents.idx_search_documents_workspace
CREATE INDEX idx_search_documents_workspace ON public.global_search_documents USING btree (workspace_id);

-- INDEX: policies.idx_policies_workspace
CREATE INDEX idx_policies_workspace ON public.policies USING btree (workspace_id);

-- INDEX: policies.idx_policies_workspace_id
CREATE INDEX idx_policies_workspace_id ON public.policies USING btree (workspace_id);

-- INDEX: policy_audit_events.idx_policy_audit_workspace
CREATE INDEX idx_policy_audit_workspace ON public.policy_audit_events USING btree (workspace_id, created_at DESC);

-- INDEX: policy_change_requests.idx_policy_change_requests_policy
CREATE INDEX idx_policy_change_requests_policy ON public.policy_change_requests USING btree (policy_id, created_at DESC);

-- INDEX: policy_change_requests.idx_policy_change_requests_workspace
CREATE INDEX idx_policy_change_requests_workspace ON public.policy_change_requests USING btree (workspace_id, created_at DESC);

-- INDEX: policy_versions.idx_policy_versions_policy
CREATE INDEX idx_policy_versions_policy ON public.policy_versions USING btree (policy_id, version DESC);

-- INDEX: risk_rules.idx_risk_rules_workspace
CREATE INDEX idx_risk_rules_workspace ON public.risk_rules USING btree (workspace_id, created_at DESC);

-- INDEX: service_account_keys.service_account_keys_prefix_idx
CREATE INDEX service_account_keys_prefix_idx ON public.service_account_keys USING btree (key_prefix);

-- INDEX: service_account_keys.service_account_keys_service_account_id_id
CREATE INDEX service_account_keys_service_account_id_idx ON public.service_account_keys USING btree (service_account_id);

-- INDEX: service_account_keys.service_account_keys_status_idx
CREATE INDEX service_account_keys_status_idx ON public.service_account_keys USING btree (status);

-- INDEX: service_account_keys.service_account_keys_workspace_id_idx
CREATE INDEX service_account_keys_workspace_id_idx ON public.service_account_keys USING btree (workspace_id);

-- INDEX: service_accounts.service_accounts_workspace_id_idx
CREATE INDEX service_accounts_workspace_id_idx ON public.service_accounts USING btree (workspace_id);

-- INDEX: traces.traces_ws_created
CREATE INDEX traces_ws_created ON public.traces USING btree (workspace_id, created_at DESC);

-- INDEX: workspace_invitations.idx_workspace_invitations_workspace
CREATE INDEX idx_workspace_invitations_workspace ON public.workspace_invitations USING btree (workspace_id, created_at DESC);

-- INDEX: workspace_members.idx_workspace_members_user
CREATE INDEX idx_workspace_members_user ON public.workspace_members USING btree (user_id);

-- INDEX: workspace_members.idx_workspace_members_workspace_id
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members USING btree (workspace_id);

-- ------------------------------------------------------------
-- FUNCTIONS
-- ------------------------------------------------------------

-- FUNCTION: accept_workspace_invites/25771
CREATE OR REPLACE FUNCTION public.accept_workspace_invites(p_user_id uuid, p_actor_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$

;

-- FUNCTION: add_workspace_member/25769
CREATE OR REPLACE FUNCTION public.add_workspace_member(p_workspace_id uuid, p_user_id uuid, p_role workspace_role, p_status member_status, p_actor_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$

;

-- FUNCTION: approval_stamp/25555
CREATE OR REPLACE FUNCTION public.approval_stamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.status in ('approved','rejected') and old.status = 'pending' then
    new.resolved_by := auth.uid();
    new.resolved_at := now();
  end if;
  return new;
end $function$

;

-- FUNCTION: audit_change/25557
CREATE OR REPLACE FUNCTION public.audit_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  ws uuid;
  rid uuid;
begin
  if tg_op = 'DELETE' then
    ws := old.workspace_id;
    rid := old.id;
  else
    ws := new.workspace_id;
    rid := new.id;
  end if;

  if ws is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspaces
    where id = ws
  ) then
    return null;
  end if;

  insert into public.audit_events (
    workspace_id,
    actor,
    action,
    target_type,
    target_id
  )
  values (
    ws,
    coalesce(auth.uid()::text, 'system'),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    rid::text
  );

  return null;
end
$function$

;

-- FUNCTION: audit_workspace_member_change/25765
CREATE OR REPLACE FUNCTION public.audit_workspace_member_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  event_workspace_id uuid;
  event_user_id uuid;
  event_action text;
  event_meta jsonb;
begin
  if tg_op = 'DELETE' then
    event_workspace_id := old.workspace_id;
    event_user_id := old.user_id;
    event_action := 'workspace_members.delete';
    event_meta := jsonb_build_object(
      'old_role', old.role,
      'old_status', old.status
    );

  elsif tg_op = 'INSERT' then
    event_workspace_id := new.workspace_id;
    event_user_id := new.user_id;
    event_action := 'workspace_members.insert';
    event_meta := jsonb_build_object(
      'new_role', new.role,
      'new_status', new.status
    );

  else
    event_workspace_id := new.workspace_id;
    event_user_id := new.user_id;

    if old.role is distinct from new.role then
      event_action := 'workspace_members.role_change';
    elsif old.status is distinct from new.status then
      event_action := 'workspace_members.status_change';
    else
      event_action := 'workspace_members.update';
    end if;

    event_meta := jsonb_build_object(
      'old_role', old.role,
      'new_role', new.role,
      'old_status', old.status,
      'new_status', new.status
    );
  end if;

  if event_workspace_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspaces
    where id = event_workspace_id
  ) then
    return null;
  end if;

  insert into public.audit_events (
    workspace_id,
    actor,
    action,
    target_type,
    target_id,
    meta
  )
  values (
    event_workspace_id,
    coalesce(
      auth.uid()::text,
      nullif(current_setting('aegisora.actor_id', true), ''),
      'system'
    ),
    event_action,
    'workspace_member',
    event_user_id::text,
    event_meta
  );

  return null;
end;
$function$

;

-- FUNCTION: can_manage_workspace/18041
CREATE OR REPLACE FUNCTION public.can_manage_workspace(target_workspace uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.role in ('OWNER', 'ADMIN')
  );
$function$

;

-- FUNCTION: consume_api_rate_limit/25751
CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(p_bucket_key text, p_limit integer, p_window_seconds integer)
 RETURNS TABLE(allowed boolean, limit_value integer, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
    v_now timestamptz := clock_timestamp();
    v_started timestamptz;
    v_count integer;
    v_reset timestamptz;
begin
    if p_bucket_key is null or length(trim(p_bucket_key)) = 0 then
        raise exception 'bucket key is required';
    end if;

    if p_limit <= 0 then
        raise exception 'limit must be positive';
    end if;

    if p_window_seconds <= 0 then
        raise exception 'window must be positive';
    end if;

    insert into public.api_rate_limits (
        bucket_key,
        window_started_at,
        request_count,
        updated_at
    )
    values (
        p_bucket_key,
        v_now,
        0,
        v_now
    )
    on conflict (bucket_key) do nothing;

    select
        arl.window_started_at,
        arl.request_count
    into
        v_started,
        v_count
    from public.api_rate_limits arl
    where arl.bucket_key = p_bucket_key
    for update;

    if v_now >= v_started + make_interval(secs => p_window_seconds) then
        v_started := v_now;
        v_count := 0;

        update public.api_rate_limits
        set
            window_started_at = v_started,
            request_count = 0,
            updated_at = v_now
        where bucket_key = p_bucket_key;
    end if;

    v_reset := v_started + make_interval(secs => p_window_seconds);

    if v_count >= p_limit then
        update public.api_rate_limits
        set updated_at = v_now
        where bucket_key = p_bucket_key;

        return query
        select
            false,
            p_limit,
            0,
            v_reset;

        return;
    end if;

    v_count := v_count + 1;

    update public.api_rate_limits
    set
        request_count = v_count,
        updated_at = v_now
    where bucket_key = p_bucket_key;

    return query
    select
        true,
        p_limit,
        greatest(p_limit - v_count, 0),
        v_reset;
end;
$function$

;

-- FUNCTION: create_api_key/25554
CREATE OR REPLACE FUNCTION public.create_api_key(ws uuid, key_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare raw text;
begin
  if not public.has_role(ws, array['owner','admin','developer']) then raise exception 'forbidden'; end if;
  raw := 'aeg_live_' || encode(gen_random_bytes(24), 'hex');
  insert into public.api_keys (workspace_id, name, prefix, key_hash, created_by)
  values (ws, coalesce(nullif(btrim(key_name), ''), 'default'), substr(raw, 1, 13), encode(digest(raw, 'sha256'), 'hex'), auth.uid());
  return raw;
end $function$

;

-- FUNCTION: create_workspace/25666
CREATE OR REPLACE FUNCTION public.create_workspace(workspace_name text, workspace_slug text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  new_id uuid;
begin
  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, auth.uid())
  returning id into new_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_id, auth.uid(), 'OWNER', 'active');

  return new_id;
end;
$function$

;

-- FUNCTION: enterprise_set_updated_at/18140
CREATE OR REPLACE FUNCTION public.enterprise_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$

;

-- FUNCTION: evidence_chain/25549
CREATE OR REPLACE FUNCTION public.evidence_chain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare prev_seq bigint; prev text;
begin
  perform pg_advisory_xact_lock(hashtext(new.workspace_id::text));
  select e.seq, e.hash into prev_seq, prev from public.evidence e
    where e.workspace_id = new.workspace_id order by e.seq desc limit 1;
  new.seq := coalesce(prev_seq, 0) + 1;
  new.prev_hash := coalesce(prev, 'GENESIS');
  new.hash := encode(digest(new.prev_hash || '|' || new.id::text || '|' || coalesce(new.decision_id::text, '') || '|' || new.payload::text, 'sha256'), 'hex');
  return new;
end $function$

;

-- FUNCTION: evidence_immutable/25551
CREATE OR REPLACE FUNCTION public.evidence_immutable()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin raise exception 'evidence is append-only'; end $function$

;

-- FUNCTION: handle_new_user/17702
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  company text := nullif(btrim(new.raw_user_meta_data ->> 'company'), '');
  ws_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  if company is not null then
    insert into public.workspaces (name, slug, created_by)
    values (
      company,
      coalesce(nullif(btrim(regexp_replace(lower(company), '[^a-z0-9]+', '-', 'g'), '-'), ''), 'workspace')
        || '-' || substr(replace(new.id::text, '-', ''), 1, 6),
      new.id
    )
    returning id into ws_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (ws_id, new.id, 'OWNER');
  end if;

  return new;
end;
$function$

;

-- FUNCTION: has_role/25412
CREATE OR REPLACE FUNCTION public.has_role(ws uuid, roles text[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$

;

-- FUNCTION: is_member/25411
CREATE OR REPLACE FUNCTION public.is_member(ws uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    select exists (
        select 1
        from public.workspace_members m
        where m.workspace_id = ws
          and m.user_id = auth.uid()
    );
$function$

;

-- FUNCTION: is_workspace_member/17685
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
    select exists (
        select 1
        from public.workspace_members wm
        where wm.workspace_id = target_workspace
          and wm.user_id = auth.uid()
    );
$function$

;

-- FUNCTION: remove_workspace_member/25770
CREATE OR REPLACE FUNCTION public.remove_workspace_member(p_workspace_id uuid, p_user_id uuid, p_actor_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$

;

-- FUNCTION: set_workspace_member_role/25768
CREATE OR REPLACE FUNCTION public.set_workspace_member_role(p_workspace_id uuid, p_user_id uuid, p_role workspace_role, p_actor_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$

;

-- FUNCTION: snapshot_policy_version/18049
CREATE OR REPLACE FUNCTION public.snapshot_policy_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.policy_versions (
    policy_id,
    workspace_id,
    version,
    name,
    scope,
    decision,
    mode,
    enabled,
    conditions,
    metadata,
    created_by
  )
  values (
    new.id,
    new.workspace_id,
    new.version,
    new.name,
    new.scope,
    new.decision,
    new.mode,
    new.enabled,
    coalesce(new.conditions, '[]'::jsonb),
    coalesce(new.metadata, '{}'::jsonb),
    auth.uid()
  )
  on conflict (policy_id, version) do nothing;

  return new;
end;
$function$

;

-- FUNCTION: touch_agent/17708
CREATE OR REPLACE FUNCTION public.touch_agent(target_agent uuid, target_workspace uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.agents
  set
    last_seen_at = now(),
    state = case
      when state = 'DISABLED' then state
      else 'ACTIVE'
    end,
    updated_at = now()
  where id = target_agent
    and workspace_id = target_workspace;
$function$

;

-- FUNCTION: verify_evidence_chain/25553
CREATE OR REPLACE FUNCTION public.verify_evidence_chain(ws uuid)
 RETURNS TABLE(total bigint, broken bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
begin
  if not public.is_member(ws) then raise exception 'forbidden'; end if;
  return query
  with o as (
    select e.*, lag(e.hash) over (order by e.seq) as exp_prev from public.evidence e where e.workspace_id = ws
  )
  select count(*)::bigint,
    (count(*) filter (where o.prev_hash is distinct from coalesce(o.exp_prev, 'GENESIS')
      or o.hash is distinct from encode(digest(o.prev_hash || '|' || o.id::text || '|' || coalesce(o.decision_id::text, '') || '|' || o.payload::text, 'sha256'), 'hex')))::bigint
  from o;
end $function$

;

-- FUNCTION: workspace_role/17686
CREATE OR REPLACE FUNCTION public.workspace_role(target_workspace uuid)
 RETURNS workspace_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = target_workspace
    and wm.user_id = auth.uid()
  limit 1;
$function$

;

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------

-- TRIGGER: agents.agents_audit_trg
CREATE TRIGGER agents_audit_trg AFTER INSERT OR DELETE OR UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: api_keys.api_keys_audit_trg
CREATE TRIGGER api_keys_audit_trg AFTER INSERT OR DELETE OR UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: approvals.approval_stamp_trg
CREATE TRIGGER approval_stamp_trg BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION approval_stamp();

-- TRIGGER: approvals.approvals_audit_trg
CREATE TRIGGER approvals_audit_trg AFTER INSERT OR DELETE OR UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: evidence.evidence_chain_trg
CREATE TRIGGER evidence_chain_trg BEFORE INSERT ON evidence FOR EACH ROW EXECUTE FUNCTION evidence_chain();

-- TRIGGER: evidence.evidence_immutable_trg
CREATE TRIGGER evidence_immutable_trg BEFORE DELETE OR UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION evidence_immutable();

-- TRIGGER: global_search_documents.search_documents_set_updated_at
CREATE TRIGGER search_documents_set_updated_at BEFORE UPDATE ON global_search_documents FOR EACH ROW EXECUTE FUNCTION enterprise_set_updated_at();

-- TRIGGER: incidents.incidents_audit_trg
CREATE TRIGGER incidents_audit_trg AFTER INSERT OR DELETE OR UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: policies.policies_audit_trg
CREATE TRIGGER policies_audit_trg AFTER INSERT OR DELETE OR UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: policies.policies_snapshot_version
CREATE TRIGGER policies_snapshot_version AFTER INSERT OR UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION snapshot_policy_version();

-- TRIGGER: risk_rules.risk_rules_set_updated_at
CREATE TRIGGER risk_rules_set_updated_at BEFORE UPDATE ON risk_rules FOR EACH ROW EXECUTE FUNCTION enterprise_set_updated_at();

-- TRIGGER: webhooks.webhooks_audit_trg
CREATE TRIGGER webhooks_audit_trg AFTER INSERT OR DELETE OR UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION audit_change();

-- TRIGGER: workspace_members.workspace_members_audit_trg
CREATE TRIGGER workspace_members_audit_trg AFTER INSERT OR DELETE OR UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION audit_workspace_member_change();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

-- RLS: agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents FORCE ROW LEVEL SECURITY;

-- RLS: api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;

-- RLS: api_rate_limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits FORCE ROW LEVEL SECURITY;

-- RLS: approvals
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals FORCE ROW LEVEL SECURITY;

-- RLS: audit_events
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

-- RLS: decisions
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions FORCE ROW LEVEL SECURITY;

-- RLS: evidence
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence FORCE ROW LEVEL SECURITY;

-- RLS: executions
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions FORCE ROW LEVEL SECURITY;

-- RLS: global_search_documents
ALTER TABLE public.global_search_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_search_documents FORCE ROW LEVEL SECURITY;

-- RLS: incidents
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents FORCE ROW LEVEL SECURITY;

-- RLS: policies
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies FORCE ROW LEVEL SECURITY;

-- RLS: policy_audit_events
ALTER TABLE public.policy_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_audit_events FORCE ROW LEVEL SECURITY;

-- RLS: policy_change_requests
ALTER TABLE public.policy_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_change_requests FORCE ROW LEVEL SECURITY;

-- RLS: policy_versions
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_versions FORCE ROW LEVEL SECURITY;

-- RLS: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- RLS: risk_rules
ALTER TABLE public.risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_rules FORCE ROW LEVEL SECURITY;

-- RLS: service_account_keys
ALTER TABLE public.service_account_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_account_keys FORCE ROW LEVEL SECURITY;

-- RLS: service_accounts
ALTER TABLE public.service_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_accounts FORCE ROW LEVEL SECURITY;

-- RLS: traces
ALTER TABLE public.traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traces FORCE ROW LEVEL SECURITY;

-- RLS: webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks FORCE ROW LEVEL SECURITY;

-- RLS: workspace_invitations
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations FORCE ROW LEVEL SECURITY;

-- RLS: workspace_members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;

-- RLS: workspace_settings
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings FORCE ROW LEVEL SECURITY;

-- RLS: workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- RLS POLICIES
-- ------------------------------------------------------------

-- POLICY: agents.agents_select
CREATE POLICY agents_select ON public.agents AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: agents.agents_write
CREATE POLICY agents_write ON public.agents AS PERMISSIVE FOR ALL TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text]));

-- POLICY: agents.workspace agents readable by members
CREATE POLICY "workspace agents readable by members" ON public.agents AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: api_keys.api_keys_revoke
CREATE POLICY api_keys_revoke ON public.api_keys AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text]));

-- POLICY: api_keys.api_keys_select
CREATE POLICY api_keys_select ON public.api_keys AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text]));

-- POLICY: approvals.approvals_resolve
CREATE POLICY approvals_resolve ON public.approvals AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'analyst'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'analyst'::text]));

-- POLICY: approvals.approvals_select
CREATE POLICY approvals_select ON public.approvals AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: audit_events.audit_events_select
CREATE POLICY audit_events_select ON public.audit_events AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: audit_events.audit_events_select_member
CREATE POLICY audit_events_select_member ON public.audit_events AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: audit_events.workspace members read audit events
CREATE POLICY "workspace members read audit events" ON public.audit_events AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: decisions.decisions_select
CREATE POLICY decisions_select ON public.decisions AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: decisions.workspace decisions readable by members
CREATE POLICY "workspace decisions readable by members" ON public.decisions AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: evidence.evidence_select_member
CREATE POLICY evidence_select_member ON public.evidence AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: executions.executions_select_member
CREATE POLICY executions_select_member ON public.executions AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: global_search_documents.workspace members read search documents
CREATE POLICY "workspace members read search documents" ON public.global_search_documents AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: incidents.incidents_resolve
CREATE POLICY incidents_resolve ON public.incidents AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'analyst'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'analyst'::text]));

-- POLICY: incidents.incidents_select
CREATE POLICY incidents_select ON public.incidents AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: policies.policies_select
CREATE POLICY policies_select ON public.policies AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: policies.policies_write
CREATE POLICY policies_write ON public.policies AS PERMISSIVE FOR ALL TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text]));

-- POLICY: policies.workspace policies readable by members
CREATE POLICY "workspace policies readable by members" ON public.policies AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: policy_audit_events.workspace policy audit readable
CREATE POLICY "workspace policy audit readable" ON public.policy_audit_events AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: policy_change_requests.workspace change requests manageable
CREATE POLICY "workspace change requests manageable" ON public.policy_change_requests AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((can_manage_workspace(workspace_id) AND (requested_by = auth.uid())));

-- POLICY: policy_change_requests.workspace change requests readable
CREATE POLICY "workspace change requests readable" ON public.policy_change_requests AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: policy_change_requests.workspace change requests reviewable
CREATE POLICY "workspace change requests reviewable" ON public.policy_change_requests AS PERMISSIVE FOR UPDATE TO authenticated USING (can_manage_workspace(workspace_id)) WITH CHECK (can_manage_workspace(workspace_id));

-- POLICY: policy_versions.workspace policy versions readable
CREATE POLICY "workspace policy versions readable" ON public.policy_versions AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: profiles.users can read own profile
CREATE POLICY "users can read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((id = auth.uid()));

-- POLICY: profiles.users can update own profile
CREATE POLICY "users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));

-- POLICY: risk_rules.workspace managers write risk rules
CREATE POLICY "workspace managers write risk rules" ON public.risk_rules AS PERMISSIVE FOR ALL TO authenticated USING (can_manage_workspace(workspace_id)) WITH CHECK (can_manage_workspace(workspace_id));

-- POLICY: risk_rules.workspace members read risk rules
CREATE POLICY "workspace members read risk rules" ON public.risk_rules AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(workspace_id));

-- POLICY: service_account_keys.service_account_keys_admin_delete
CREATE POLICY service_account_keys_admin_delete ON public.service_account_keys AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_account_keys.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_account_keys.service_account_keys_admin_insert
CREATE POLICY service_account_keys_admin_insert ON public.service_account_keys AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_account_keys.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_account_keys.service_account_keys_admin_update
CREATE POLICY service_account_keys_admin_update ON public.service_account_keys AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_account_keys.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_account_keys.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_account_keys.service_account_keys_member_select
CREATE POLICY service_account_keys_member_select ON public.service_account_keys AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_account_keys.workspace_id) AND (wm.user_id = auth.uid())))));

-- POLICY: service_accounts.service_accounts_admin_delete
CREATE POLICY service_accounts_admin_delete ON public.service_accounts AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_accounts.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_accounts.service_accounts_admin_insert
CREATE POLICY service_accounts_admin_insert ON public.service_accounts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_accounts.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_accounts.service_accounts_admin_update
CREATE POLICY service_accounts_admin_update ON public.service_accounts AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_accounts.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_accounts.workspace_id) AND (wm.user_id = auth.uid()) AND (wm.role = ANY (ARRAY['OWNER'::workspace_role, 'ADMIN'::workspace_role]))))));

-- POLICY: service_accounts.service_accounts_member_select
CREATE POLICY service_accounts_member_select ON public.service_accounts AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM workspace_members wm
  WHERE ((wm.workspace_id = service_accounts.workspace_id) AND (wm.user_id = auth.uid())))));

-- POLICY: traces.traces_select
CREATE POLICY traces_select ON public.traces AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: webhooks.webhooks_select
CREATE POLICY webhooks_select ON public.webhooks AS PERMISSIVE FOR SELECT TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text, 'developer'::text]));

-- POLICY: webhooks.webhooks_write
CREATE POLICY webhooks_write ON public.webhooks AS PERMISSIVE FOR ALL TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text]));

-- POLICY: workspace_invitations.workspace managers create invitations
CREATE POLICY "workspace managers create invitations" ON public.workspace_invitations AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_manage_workspace(workspace_id));

-- POLICY: workspace_invitations.workspace managers read invitations
CREATE POLICY "workspace managers read invitations" ON public.workspace_invitations AS PERMISSIVE FOR SELECT TO authenticated USING (can_manage_workspace(workspace_id));

-- POLICY: workspace_invitations.workspace managers update invitations
CREATE POLICY "workspace managers update invitations" ON public.workspace_invitations AS PERMISSIVE FOR UPDATE TO authenticated USING (can_manage_workspace(workspace_id)) WITH CHECK (can_manage_workspace(workspace_id));

-- POLICY: workspace_members.members can read own membership
CREATE POLICY "members can read own membership" ON public.workspace_members AS PERMISSIVE FOR SELECT TO authenticated USING ((user_id = auth.uid()));

-- POLICY: workspace_settings.settings_write
CREATE POLICY settings_write ON public.workspace_settings AS PERMISSIVE FOR ALL TO authenticated USING (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text])) WITH CHECK (has_role(workspace_id, ARRAY['owner'::text, 'admin'::text]));

-- POLICY: workspace_settings.workspace_settings_select
CREATE POLICY workspace_settings_select ON public.workspace_settings AS PERMISSIVE FOR SELECT TO authenticated USING (is_member(workspace_id));

-- POLICY: workspaces.workspace members can read workspaces
CREATE POLICY "workspace members can read workspaces" ON public.workspaces AS PERMISSIVE FOR SELECT TO authenticated USING (is_workspace_member(id));

-- POLICY: workspaces.workspaces_update
CREATE POLICY workspaces_update ON public.workspaces AS PERMISSIVE FOR UPDATE TO authenticated USING (has_role(id, ARRAY['owner'::text, 'admin'::text])) WITH CHECK (has_role(id, ARRAY['owner'::text, 'admin'::text]));

-- ------------------------------------------------------------
-- PUBLIC SCHEMA USAGE GRANTS
-- Source: production schema privilege evidence
-- ------------------------------------------------------------


-- ------------------------------------------------------------
-- TABLE PRIVILEGES
-- Source: information_schema.table_privileges
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- COLUMN PRIVILEGES
-- Source: information_schema.column_privileges
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- BASELINE CONTRACT NOTE
-- ------------------------------------------------------------
-- Production routine privileges observed : 0
-- Production default privilege rows     : 0
-- Production public sequences           : 0
--
-- Routine EXECUTE grants are intentionally NOT synthesized
-- here because information_schema.routine_privileges does
-- not expose the complete PostgreSQL function signature.
-- They will be captured from pg_proc/proacl separately.
--
-- Default ACL rows are preserved as evidence and will also
-- be converted from pg_default_acl in a follow-up migration.
-- ============================================================

