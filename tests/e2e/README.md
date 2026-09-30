# Aegisora E2E Tests

## Required environment

Set:

- BASE_URL
- E2E_EMAIL
- E2E_PASSWORD

Never commit credentials.

## Required journeys

- login
- German login
- signup
- German signup
- password reset
- invitation
- workspace creation
- first policy
- first decision
- evidence inspection

Tests that require external systems must fail when explicitly enabled rather than silently claiming success.
