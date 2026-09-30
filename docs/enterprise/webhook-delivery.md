# Webhook delivery behavior

The runtime sends HTTPS webhook events after returning the evaluation response. Each request includes the exact JSON body signed with HMAC-SHA256 in `x-aegisora-signature`. `x-aegisora-event-id` and `idempotency-key` carry the same stable decision ID across retries. Receivers should verify the HMAC over the raw request body and deduplicate on that ID.

Delivery makes at most three attempts. Network errors, HTTP 408, HTTP 429, and HTTP 5xx responses are retried with short exponential delays. Other non-2xx responses are treated as permanent failures. A final success or failure updates the webhook's last status and timestamp and attempts to write a system-attributed `audit_events` record. Event payloads pass through the shared PII/credential redactor before serialization and signing.

This implementation does not yet persist a delivery queue or schedule retries after the request process ends. A process shutdown or hosting timeout can therefore lose a pending delivery. The configured hosting platform must support Next.js post-response work for the current attempt window. A live receiver test, hosted audit-row verification, sustained retry/timeout behavior, and durable queue remain deployment validation items. See [C25 contract evidence](../../.enterprise/phase-c25-webhook-contract.json).
