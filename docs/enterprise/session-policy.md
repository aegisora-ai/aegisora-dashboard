# Authentication session policy

Status: application cookie settings are explicit; the hosted Supabase Auth lifetime settings and credential-backed expiry behavior still require deployment verification.

## Application behavior

- Browser, server, and proxy clients share the Supabase SSR cookie policy in `src/lib/supabase/cookie-options.ts`.
- Cookies are scoped to `/`, use `SameSite=Lax`, set `Secure` in production, and expire after seven days unless refreshed by Supabase Auth.
- The cookie name remains the Supabase SSR default to avoid invalidating existing sessions during this change.
- Cookies are not `HttpOnly`: the browser Supabase client must read and refresh its session. This means an XSS flaw could access browser-held session data; CSP and XSS prevention remain required controls.
- The browser client uses Supabase SSR cookie storage rather than an application-owned localStorage token store. API requests authenticate bearer tokens server-side.
- Server-side API clients disable session persistence and automatic refresh. They do not keep user tokens between requests.
- Sign-out must use Supabase Auth so session cookies are cleared through the shared SSR adapter.

## Deployment settings to verify

1. Set the Supabase Auth access-token lifetime and refresh-token inactivity limit to the approved enterprise policy. These project settings are not available from this repository audit.
2. Confirm refresh-token rotation/reuse detection and session revocation behavior in the hosted project.
3. Confirm HTTPS-only production and staging origins, exact redirect allowlists, and cookie `Secure` attributes in browser responses.
4. Test expiry, refresh, sign-out, password reset, and account disablement using a real user in the production-equivalent staging project.

Do not advertise a hard maximum authenticated session duration until the hosted Auth lifetime and refresh behavior have been verified.
