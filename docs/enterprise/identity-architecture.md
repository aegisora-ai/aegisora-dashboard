# Identity federation boundary

Status: SSO is not configured or verified for a customer tenant. This document records the integration boundary and deployment prerequisites; it is not a claim that SAML or OIDC login is available in the current deployment.

## Authorization boundary

- Supabase Auth authenticates the human and supplies the stable user UUID used by Aegisora.
- `workspace_members` is the source of workspace membership, active status, and the `OWNER`, `ADMIN`, `OPERATOR`, and `VIEWER` role.
- Authorization reads membership from trusted server-side data for each protected operation. Role and workspace claims from an identity provider or browser are not authorization inputs.
- A future SAML or OIDC provider must federate into Supabase Auth and map its subject to the same Supabase user UUID. It must not own Aegisora workspace roles.
- This boundary allows identity providers to change without changing the workspace authorization model or tenant data keys.

## Provider configuration required before an SSO pilot

1. Confirm the customer's IdP protocol, issuer, entity/client ID, signing keys or certificate, and required claims.
2. Configure the provider in the Supabase project and confirm the project's plan supports the required SSO feature.
3. Register exact callback and logout URLs; configure allowed redirect URLs for the Aegisora deployment.
4. Agree on domain ownership and account linking. Do not auto-provision privileged roles from email domains or unverified IdP claims.
5. Create an initial OWNER through the controlled onboarding process; subsequent role changes use the server authorization boundary.
6. Validate login, logout, disabled-user behavior, provider outage, and membership removal with the customer's IdP before enabling production access.

## Current status

No customer IdP configuration, SAML assertion, OIDC callback, or production SSO login has been tested. Until those steps are complete, customers use the configured Supabase Auth methods and SSO must be described as planned/configuration-dependent.
