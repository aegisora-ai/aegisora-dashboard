# Enterprise Onboarding Runbook

**Status:** operator runbook for a scoped, non-production design-partner pilot. It is not evidence that a customer has been onboarded or that production controls are deployed.

## Qualification

Record:

- customer industry and company size
- deployment model and data residency
- agent frameworks and identity requirements
- security requirements and data classification
- named technical owner and rollback contact
- written success criteria, stop criteria, fee, term, invoice schedule, and signed order form
- customer-approved data scope; use synthetic data until hosted deployment and data terms are verified

## Provisioning

1. Confirm the approved deployment target, Supabase project ref, data region, backup, rollback path, and runtime secret inventory. Do not apply migrations to a project whose ref does not match the approved target.
2. Create the customer workspace from authenticated onboarding. Verify that the signed-in user is its `OWNER`.
3. Configure authentication and enroll TOTP MFA. Verify hosted MFA and workspace-membership migrations before inviting customer users.
4. Assign only supported roles: `OWNER`, `ADMIN`, `OPERATOR`, and `VIEWER`. There is no `MEMBER` role. Verify role changes and actor-attributed audit events on the target deployment.
5. Register the agent, configure a narrowly scoped policy, and create a workspace API key. Store that key in the customer's secret manager; never put it in browser code, tickets, or logs.
6. Use synthetic data in the customer's non-production environment. Send one controlled request to `POST /api/v1/evaluate`; verify the returned effect and matching decision, trace, and evidence records.
7. Continue the customer-owned action only when the result is `ALLOW`. Aegisora records governance decisions; it does not execute the customer's external tool action.
8. Verify `BLOCK` and `ESCALATE`. The customer's integration must stop on `BLOCK` and pause for human review on `ESCALATE`; escalation is not approval.
9. Verify workspace isolation, API rate limits, webhook signature and delivery behavior, evidence immutability, export, retention, deletion, and rollback on the approved deployment.
10. Do not connect production traffic or sensitive customer data until deployment-dependent gates in [enterprise readiness](enterprise-readiness.md) are closed and the customer's written security/data review is complete.

## Handoff

Provide the customer with the verified architecture, security documents, support/escalation contacts, rollback process, and measured success criteria. Record who accepted each item and the exact deployment revision.

## Stop conditions

Stop provisioning and keep the workspace on synthetic data if the runtime project differs from the approved target, a required migration is missing, MFA or role checks fail, tenant isolation is uncertain, audit/evidence verification fails, webhook failures are invisible, or signed scope/data terms are incomplete. Record the issue and do not bypass the control to finish onboarding.
