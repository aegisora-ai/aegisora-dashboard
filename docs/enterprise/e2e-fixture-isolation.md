# Live E2E fixture isolation

The credential-backed security E2E scripts require a dedicated disposable Supabase project. Set these process environment variables to that project before invoking `npm run test:enterprise:agent-api` or the C19/C20 evaluation E2E:

- `AEGISORA_E2E_SUPABASE_URL`
- `AEGISORA_E2E_SUPABASE_ANON_KEY`
- `AEGISORA_E2E_SUPABASE_SERVICE_ROLE_KEY`

The scripts do not fall back to the application's `.env.local` or `.env.production.local` Supabase credentials. Their local Next.js process receives the dedicated project's URL and keys as well. The fixture result must verify every workspace and Auth user is absent before it can pass.

The C19/C20 evaluation E2E writes append-only evidence, so its workspace cannot be removed through the service-role REST API. Do not run it until the disposable project's owner has a working database-level fixture purge/restore procedure and can verify the project contains no leftover test data afterward. Current deployment credentials do not meet that prerequisite.
