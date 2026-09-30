# Production-Equivalent Staging Runbook

## Required separation

- separate Vercel project/environment
- separate Supabase project/database
- separate secrets
- separate OAuth/SSO configuration
- production-like environment variables
- production-like monitoring

## Required checks

- login
- signup
- password reset
- invitation
- workspace creation
- API authorization
- RLS
- governance
- webhooks
- billing test mode
- error monitoring

Production secrets must never be reused in staging.
