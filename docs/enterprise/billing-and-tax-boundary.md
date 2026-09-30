# Billing, provisioning, and tax boundary

**Status:** no connected billing provider, online checkout, metered usage ledger, invoice generation, or tax calculation is verified in this repository.

## Current commercial boundary

- Public pricing describes a scoped pilot and does not promise a self-service tier or checkout.
- Do not represent dashboard sample data as customer usage, plan, or invoices.
- A paid pilot may proceed only after a written agreement states scope, term, support, data handling, price, invoice schedule, and provisioning steps.
- No subscription should be activated and no payment details should be collected through this application today.

## Before billing launch

1. Select and configure a payment provider and test-mode webhook endpoint.
2. Verify webhook signatures, event idempotency, retries, duplicate delivery, failed payment, refund, and subscription cancellation in test mode.
3. Define the source of truth for usage events, workspace attribution, limits, and invoice reconciliation.
4. Have tax counsel/accounting determine registrations, customer location evidence, VAT/GST/sales-tax treatment, invoice fields, reverse-charge handling, and required records for each selling jurisdiction.
5. Implement and test tax ID collection/validation and invoice display only after the chosen provider and tax policy are configured.
6. Reconcile provider invoices against Aegisora usage and the signed customer contract before enabling automated provisioning.

## Enterprise quote to provision

For a manual design-partner quote, record the named customer sponsor, workflow and environment, deployment assumptions, security/legal prerequisites, pilot term and fee, usage scope, support boundary, success/stop criteria, invoicing entity, tax review, and acceptance/signature. Provision only the agreed non-production workspace after the agreement and owner are recorded. This runbook is a process boundary, not evidence that a contract, tax, or billing system is live.
