# Aegisora enterprise pilot overview

**Stage:** seeking design partners for a scoped pilot. Production deployment, customer outcomes, and performance claims are not yet verified.

## The problem

Autonomous agents can call tools and change business data faster than teams can review each action. Existing controls often focus on model input/output and do not provide a consistent decision and evidence point immediately before execution.

## What Aegisora is building

A runtime decision service that evaluates an agent action with workspace policy and returns an `ALLOW`, `BLOCK`, or `ESCALATE` outcome. The API includes tenant-scoped keys, workspace ownership checks, rate limiting, and persisted decisions/evidence paths. Role-controlled workspace membership is implemented and has a real Supabase JWT authorization test.

The pilot question is whether a customer's agent framework can call this decision boundary before a sensitive tool action and consume the result safely. The customer retains responsibility for ensuring tools only execute after an allowed decision.

## Current evidence

- C11 workspace ownership check: cross-workspace access was rejected with HTTP 404.
- C12 API rate limits: repeated authenticated and failed-authentication requests reached the configured limits and received HTTP 429.
- C01 authentication: a temporary confirmed Supabase Auth account completed real Chromium sign-in and dashboard redirect; account deletion and absence were verified.
- C02 workspace creation: a real authenticated Supabase workspace-creation RPC succeeded; test workspace and user were deleted and absence verified.
- C15 MFA step-up: real Supabase TOTP enrollment and browser AAL1-to-AAL2 verification passed; a team mutation using fresh AAL1 returned 403 `mfa_required`; fixtures were removed and verified.
- Membership and AAL2 SQL migrations pass a disposable local PostgreSQL integration run. They are not yet applied to the hosted project, so database-enforced audit/MFA and the full hosted role matrix are not claimed.
- Local typecheck, lint, production build, and 10 locale/auth-page smoke checks passed. Lint currently reports two warnings.

These are local and configured-project checks. They are not a production deployment, customer pilot, independent security assessment, SLA, or performance benchmark.

## Pilot scope

Start with one non-production workflow, one agent framework, one workspace, and a small set of explicit policies. Agree on the data fields, retention, failure behavior, operator owner, success criteria, and rollback before connecting tools. The commercial working draft is in [paid-pilot-offer.md](paid-pilot-offer.md); fee, currency, tax, and payment terms require a signed quote.

## Deployment status

No customer production deployment is verified. The hosted database migrations must be applied and retested before privileged team changes use the new audited/RLS flow. Managed-cloud operations, dedicated VPC/on-prem delivery, SSO, external monitoring, and production recovery remain deployment-dependent or planned; confirm each in the pilot agreement rather than assuming availability.

## Evidence before expansion

Record actual evaluated requests, decisions, policy coverage, failure behavior, latency distribution, operator effort, and customer-approved outcomes. Publish customer names, quotations, and metrics only with written approval and reproducible evidence.
