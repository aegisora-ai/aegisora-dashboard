# Pilot customer discovery playbook

Use this process to find a narrow design-partner workflow and qualify it before promising production capability. Aegisora has no customer references or measured customer outcomes documented here.

## Who to contact

Start with the three ICPs in [pilot-icp.md](pilot-icp.md): AI-native SaaS, enterprise automation, and regulated workflows. Look for a named owner in AI/platform engineering, application security, or the business team responsible for the agent workflow. Approach the workflow owner and security reviewer together where possible.

## Qualification questions

1. Which agent is already making or preparing a consequential tool call?
2. What exact action or data change needs an allow/block/escalate decision?
3. Where can a synchronous policy check run before that action executes?
4. Which framework, identity boundary, tenant model, and deployment constraints apply?
5. What test environment and synthetic or approved data can be used?
6. Who owns the integration, security approval, rollback, and day-to-day review?
7. What measurable baseline would justify a pilot, and what result would stop it?

## Qualification gate

Proceed only when the prospect has a real workflow, an accountable technical owner, a safe test environment, a specific integration point before tool execution, and written agreement on data, retention, success criteria, and rollback. Do not connect production credentials or sensitive customer data during discovery.

Disqualify or defer requests that depend on an unverified production SLA, customer-ready SSO, dedicated/on-prem delivery, certification, data-residency guarantee, unattended tool execution, or a framework integration not yet validated.

## Pilot path

1. **Discovery:** map the action, current control, failure modes, stakeholders, and baseline.
2. **Technical fit:** run a controlled request against a non-production workspace; verify the actual API contract and failure behavior.
3. **Security and legal scope:** agree on data fields, subprocessors, retention, incident contacts, DPA/terms review, and tenant setup before any customer data is sent.
4. **Design-partner agreement:** document workflow, owner, timeline, success/stop criteria, support boundaries, and what is explicitly out of scope.
5. **Pilot:** begin with synthetic or approved low-risk inputs, then expand only after customer security approval and tested rollback.
6. **Review:** export reproducible decision/evidence counts and latency distribution; compare with the agreed baseline. Record failures and limitations as well as successes.
7. **Commercial next step:** quote production requirements only after deployment, security, legal, and support prerequisites are confirmed.

## Prospect tracking fields

Company and ICP; contact and role; agent/workflow; consequential action; tool-execution boundary; framework; deployment and data constraints; security owner; technical owner; baseline; success and stop criteria; qualification stage; open blockers; next action/date; evidence links; consent for any public reference.

## Outreach guardrails

Describe Aegisora as an enterprise runtime-control product seeking scoped design partners. Use the evidence and limitations in [one-page-pitch.md](one-page-pitch.md). Do not claim customers, production readiness, certifications, integrations, ROI, latency, or deployment models without current evidence. Never send an outbound message or publish a customer claim without the authorized human sender's review.
