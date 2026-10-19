# Aegisora Deployment Guide

This guide covers a first deployment on Vercel or Docker. Read "Known limits" before promising anything to a customer.

## 1. Prerequisites
- Node.js 24, npm
- A Supabase project (empty)
- Supabase CLI (`npx supabase`)
- Stripe account (only if billing is enabled)

## 2. Environment variables
Copy `.env.example` to `.env.local` (local) or set the same names in your host. Required for the API:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to the browser)
- `NEXT_PUBLIC_BASE_URL`
Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`.
Self-hosted behind proxies: `AEGISORA_TRUSTED_PROXY_HOPS` (see section 5).

## 3. Database
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```
Run the dry-run first and check that only the migrations you expect are listed. Migrations live in `supabase/migrations`.

## 4. Run
Vercel: import the repository, set the variables, deploy. `vercel.json` sets security headers.
Docker:
```bash
docker build -t aegisora .
docker run --env-file .env.local -p 3000:3000 aegisora
```
The Docker image has not been build-tested in our pipeline yet. Security headers from `vercel.json` do not apply in Docker; set them on your reverse proxy.

## 5. Client IP and rate limits
The API limits requests per API key (60/min), per IP (120/min) and per IP for failed authentication (10/min). On Vercel the default is correct. If you run behind your own proxies, set `AEGISORA_TRUSTED_PROXY_HOPS` to the number of trusted proxies, otherwise a client can send its own `x-forwarded-for` and evade the per-IP limits. The per-API-key limit is not affected.

## 6. Verify after deploy
```bash
curl https://<your-host>/api/v1/health
node scripts/verify-chain-db.mjs
node scripts/security/verify-policy-and-redaction.mjs
```
Expected: health returns `ok: true`; evidence chain reports `bozuk: 0`.

## 7. Automated tests (disposable test project only, never production)
```bash
npm run test:e2e:isolation
npm run test:e2e:entitlement
```
These scripts refuse to run unless the E2E environment variables point to the disposable test project.

## 8. Known limits
- No SSO (SAML/OIDC) yet.
- Approvals need one human with MFA (AAL2); dual approval is not implemented.
- Rate limiting and webhook delivery are not covered by a load test.
- Latency figures were measured against a local server and are not an SLO.