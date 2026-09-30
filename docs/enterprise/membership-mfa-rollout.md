# Membership and MFA rollout

## Implemented application behavior

- `GET /api/v1/workspace/members` returns active workspace members to active members.
- `POST /api/v1/workspace/members` invites an email as `VIEWER` or `OPERATOR`; only an `OWNER` may invite `ADMIN` or `OWNER`. Supabase sends mail only for a newly created Auth user. Existing accounts receive a pending membership that activates on their next authenticated session.
- `PATCH /api/v1/workspace/members` changes active member roles. Only `OWNER` may grant `ADMIN`/`OWNER` or edit an `OWNER` membership.
- `DELETE /api/v1/workspace/members` removes a membership. An `ADMIN` cannot remove an `OWNER` or `ADMIN`; the final active `OWNER` is protected inside a transaction. An actor cannot remove their own membership through this endpoint.
- `POST /api/v1/workspace/members/accept` activates only invitations belonging to the authenticated user.
- Every membership insert, role/status change, and deletion writes an actor-attributed audit event in the same transaction. Authenticated clients can read membership events but cannot insert, update, delete, or truncate the audit table.
- OWNER/ADMIN RLS write permissions and team mutations require a Supabase Auth `aal2` session. TOTP enrollment and step-up verification are available from Dashboard → Identity.

## Deployment sequence

Apply in order:

1. `supabase/migrations/20260927170000_workspace_member_audit.sql`
2. `supabase/migrations/20260927174500_privileged_aal2.sql`

These migrations have passed the disposable local PostgreSQL integration checks in `.enterprise/phase-c18-local-postgres.json`. The hosted project has not received them yet. Do not count hosted RBAC, immutable audit permissions, or database-side MFA enforcement as deployed until the migrations are applied and the post-deploy checks below pass.

## Post-deploy verification

1. Start the production build with `.env.production.local` loaded, then run `node scripts/security/phase-c13-team-lifecycle.mjs`. It provisions temporary OWNER/ADMIN/OPERATOR/VIEWER/TARGET Auth users and uses real AAL1/AAL2 JWTs. Existing test accounts are used for invitations so no external invitation email is sent.
2. The script verifies role reads, AAL1 denial, owner promotion, admin limits, operator/viewer denials, invite/accept, role changes, member removal, actor IDs in `audit_events`, audit-write denial, and verified fixture cleanup. It writes a redacted result to `.enterprise/phase-c13-team-lifecycle/result.json`.
3. The disposable local PostgreSQL test covers last-OWNER rejection. If the hosted matrix is extended to exercise this guard directly, ensure it runs only in its unique temporary workspace.
4. Verify denied mutations leave all fixture rows unchanged and cleanup removes every temporary Auth user/workspace.
5. Confirm each real OWNER/ADMIN can enroll TOTP and perform a step-up after fresh sign-in. Keep MFA factor secrets out of test artifacts and logs.

Until these hosted checks pass, the database migrations remain a deployment prerequisite; the local integration test is implementation evidence, not production evidence.
