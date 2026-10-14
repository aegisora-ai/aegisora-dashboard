# Aeri preview setup

Aeri is added as a standalone page at `/aeri`. The initial release includes a CSS-animated blue orb, typed messages over an active Realtime voice session, microphone mute, disconnect, and a server route that creates an ephemeral Realtime credential only after the Supabase user is authenticated.

## Required server environment

- `OPENAI_API_KEY` — a server-side OpenAI API key. Never prefix it with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_URL` — the existing Aegisora Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the existing public Supabase key.

Optional:
- `AERI_REALTIME_MODEL` — defaults to `gpt-realtime-2.1`; change it if that model is not enabled for the OpenAI project.
- `AERI_REALTIME_VOICE` — defaults to `marin`.

Add these to the local `.env.local` using your editor or your existing secrets manager. Do not paste secret API keys into chat, source code, or client-side variables. Restart the Next.js server after changing environment variables.

## Route and safety boundaries

- The page is available at `/aeri` (or under the app's locale-root route if the locale segment is configured as the root layout).
- `/api/aeri/token` requires a Supabase-authenticated user and returns a temporary Realtime credential. The permanent OpenAI key remains on the server.
- This preview is a conversational voice UI. It does not yet access workspace audit records, policies, or execution tools. Those integrations must be connected through existing server-side Aegisora authorization and workspace isolation before production use.
- Add a shared-store per-user rate limit before exposing voice sessions broadly in production. Do not treat an in-memory rate limit as sufficient for multi-instance hosting.

## First verification

1. Sign in to Aegisora.
2. Open `/aeri`.
3. Click **Start voice** and grant microphone access.
4. Say a short test phrase; confirm audio responses and the orb's speaking state.
5. Try mute, text send, and **End session**.
6. If the endpoint returns `401`, the page's Supabase session is not being recognized; check the existing auth cookies and environment configuration rather than disabling authentication.