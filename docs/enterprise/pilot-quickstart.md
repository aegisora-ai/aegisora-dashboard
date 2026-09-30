# Aegisora pilot quickstart

**Scope:** authenticated, non-production evaluation of a customer-owned agent workflow. This guide describes the current product boundary; it does not imply production availability, an SLA, compliance certification, or that Aegisora executes customer tools.

## Before you begin

- Use a supported deployment with the correct Supabase project configured. Confirm the project ref and required migrations with the deployment owner.
- Create an account, verify the email, and create a workspace from the onboarding page.
- Enroll TOTP MFA before privileged workspace configuration. Supported workspace roles are `OWNER`, `ADMIN`, `OPERATOR`, and `VIEWER`.
- Use synthetic data in a non-production environment. Never put an API key in frontend code or a browser request.

## Configure a governed workflow

1. In **Agents**, register the agent name and framework identifier. Avoid personal data and credentials in identifiers; descriptive metadata is redacted before storage.
2. In **Policies**, create a narrow rule for the exact agent, action, and resource pattern. Choose `ALLOW`, `BLOCK`, or `ESCALATE`; unmatched actions use the workspace default.
3. In **API keys**, create a workspace key and store it in a server-side secret manager. Aegisora stores only the key hash.
4. From your server-side agent/tool integration, submit a request to the evaluation endpoint:

```sh
curl --fail-with-body --silent --show-error \
  -X POST "$AEGISORA_BASE_URL/api/v1/evaluate" \
  -H "Authorization: Bearer $AEGISORA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent":"finance-operator","action":"invoice.read","resource":"invoice:sample-001","input":{"environment":"pilot"}}'
```

The response includes the decision effect and persisted record identifiers. Keep the request server-side; redact response identifiers before sharing logs outside the pilot team.

## Enforce the result in your integration

- Continue the customer-owned action only when the result is `ALLOW`.
- Do not execute on `BLOCK`.
- Pause and require the customer's human reviewer on `ESCALATE`; escalation is not approval.
- Aegisora records decisions and evidence. It does not execute your external tool action or make a denied action safe if your integration ignores the result.

## Verify the pilot evidence

For the same request, inspect **Decisions**, **Traces**, **Evidence**, and **Audit** in the workspace. Confirm that the workspace, agent, effect, timestamp, and evidence hash correspond to the API response. Exercise one explicit block and escalation using synthetic data before considering any broader test.

## Known limits

This repository does not establish production uptime monitoring, a verified hosted migration set, Stripe checkout or invoicing, a service-level agreement, SSO, or certification. Webhook delivery uses bounded in-process retries and is not a durable queue. Confirm the open gates in [enterprise readiness](enterprise-readiness.md) and [the pilot onboarding runbook](enterprise-onboarding-runbook.md) before customer production data or traffic is considered.
