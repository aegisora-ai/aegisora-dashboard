# Production Rollback Runbook

## Trigger

Use for:
- severe production regression
- authentication failure
- security regression
- data integrity concern
- failed release

## Procedure

1. Freeze further deployments.
2. Identify current deployment.
3. Identify last known-good deployment.
4. Restore the known-good deployment.
5. Verify health endpoint.
6. Verify login.
7. Verify dashboard.
8. Verify critical APIs.
9. Verify Supabase session behavior.
10. Record incident timeline.
11. Open root-cause follow-up.

## Evidence

Every rollback drill must retain:
- deployment IDs
- timestamps
- operator
- verification results
- lessons learned
