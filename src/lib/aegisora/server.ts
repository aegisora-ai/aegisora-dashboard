import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { maskSensitiveData } from "@/lib/aegisora/redaction";
import { deliverSignedWebhook } from "@/lib/aegisora/webhook-delivery";

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export class ApiError extends Error {
  status: number;
  code: string;
  headers?: HeadersInit;

  constructor(status: number, code: string, message: string, headers?: HeadersInit) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

let cached: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ApiError(500, "server_misconfigured", "Server is missing Supabase credentials.");
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export function fail(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json(
      { error: { code: e.code, message: e.message } },
      {
        status: e.status,
        headers: e.headers,
      }
    );
  }

  console.error("[aegisora]", e);

  return NextResponse.json(
    { error: { code: "internal_error", message: "Unexpected server error." } },
    { status: 500 }
  );
}
type RateLimitResult = {
  allowed: boolean;
  limit_value: number;
  remaining: number;
  reset_at: string;
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_IP = 120;
const RATE_LIMIT_API_KEY = 60;
const RATE_LIMIT_FAILED_AUTH = 10;

function requestClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cloudflareIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  return "unknown";
}

async function consumeRateLimit(
  bucketKey: string,
  limit: number
): Promise<RateLimitResult> {
  const db = admin();

  const { data, error } = await db.rpc("consume_api_rate_limit", {
    p_bucket_key: bucketKey,
    p_limit: limit,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  if (
    !row ||
    typeof row.allowed !== "boolean" ||
    typeof row.limit_value !== "number" ||
    typeof row.remaining !== "number" ||
    typeof row.reset_at !== "string"
  ) {
    throw new Error("Invalid rate-limit RPC response.");
  }

  return {
    allowed: row.allowed,
    limit_value: row.limit_value,
    remaining: row.remaining,
    reset_at: row.reset_at,
  };
}

function rateLimitError(result: RateLimitResult): ApiError {
  const resetMs = new Date(result.reset_at).getTime() - Date.now();
  const retryAfter = Math.max(1, Math.ceil(resetMs / 1000));
  const resetEpoch = Math.ceil(new Date(result.reset_at).getTime() / 1000);

  return new ApiError(
    429,
    "rate_limited",
    "Too many requests. Retry later.",
    {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": String(result.limit_value),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(resetEpoch),
    }
  );
}

async function enforceIpRateLimit(req: Request): Promise<void> {
  const ip = requestClientIp(req);
  const bucketKey = `ip:${sha256(ip)}`;

  const result = await consumeRateLimit(bucketKey, RATE_LIMIT_IP);

  if (!result.allowed) {
    throw rateLimitError(result);
  }
}

async function enforceFailedAuthRateLimit(req: Request): Promise<void> {
  const ip = requestClientIp(req);
  const bucketKey = `failed-auth:${sha256(ip)}`;

  const result = await consumeRateLimit(bucketKey, RATE_LIMIT_FAILED_AUTH);

  if (!result.allowed) {
    throw rateLimitError(result);
  }
}

async function enforceApiKeyRateLimit(rawApiKey: string): Promise<void> {
  const bucketKey = `api-key:${sha256(rawApiKey)}`;

  const result = await consumeRateLimit(bucketKey, RATE_LIMIT_API_KEY);

  if (!result.allowed) {
    throw rateLimitError(result);
  }
}

export async function authenticate(req: Request): Promise<{ workspaceId: string; keyId: string }> {
  await enforceIpRateLimit(req);

  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(aeg_live_[a-f0-9]{48})$/.exec(h);

  if (!m) {
    await enforceFailedAuthRateLimit(req);
    throw new ApiError(
      401,
      "unauthorized",
      "Missing or malformed API key. Send 'Authorization: Bearer aeg_live_...'."
    );
  }

  const db = admin();

  const { data, error } = await db
    .from("api_keys")
    .select("id, workspace_id")
    .eq("key_hash", sha256(m[1]))
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    await enforceFailedAuthRateLimit(req);
    throw new ApiError(
      401,
      "unauthorized",
      "Invalid or revoked API key."
    );
  }

  await enforceApiKeyRateLimit(m[1]);

  await db
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    workspaceId: data.workspace_id as string,
    keyId: data.id as string,
  };
}
export async function readJson(req: Request, maxBytes = 65536): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new ApiError(413, "payload_too_large", `Body exceeds ${maxBytes} bytes.`);
  try {
    const v: unknown = JSON.parse(text);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch {
    /* fallthrough */
  }
  throw new ApiError(400, "invalid_json", "Body must be a JSON object.");
}

export function str(v: unknown, field: string, max: number, required = true): string | null {
  if (v === undefined || v === null || v === "") {
    if (required) throw new ApiError(400, "invalid_request", `'${field}' is required.`);
    return null;
  }
  if (typeof v !== "string" || v.length > max) {
    throw new ApiError(400, "invalid_request", `'${field}' must be a string up to ${max} characters.`);
  }
  return v;
}

export function matches(pattern: string | null | undefined, value: string): boolean {
  if (pattern === null || pattern === undefined || pattern === "") return true;
  const body = pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp("^" + body + "$", "i").test(value);
}

function isSafeUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    const h = url.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h === "[::1]") return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function deliverWebhooks(workspaceId: string, event: string, data: unknown): Promise<void> {
  const db = admin();
  const { data: hooks, error } = await db.from("webhooks").select("id,url,secret,events").eq("workspace_id", workspaceId).eq("enabled", true);
  if (error) throw error;
  const eventId = data && typeof data === "object" && "decision_id" in data && typeof data.decision_id === "string"
    ? data.decision_id
    : randomUUID();
  const body = JSON.stringify(maskSensitiveData({ event, event_id: eventId, data, sent_at: new Date().toISOString() }));

  await Promise.allSettled((hooks ?? [])
    .filter((hook) => Array.isArray(hook.events) && hook.events.includes(event) && isSafeUrl(hook.url))
    .map(async (hook) => {
      const result = await deliverSignedWebhook({ url: hook.url, event, eventId, secret: hook.secret, body });
      const deliveredAt = new Date().toISOString();
      const { error: updateError } = await db.from("webhooks")
        .update({ last_status: result.status, last_delivery_at: deliveredAt })
        .eq("id", hook.id).eq("workspace_id", workspaceId);
      if (updateError) console.error("[aegisora] Webhook delivery status update failed.");

      const { error: auditError } = await db.from("audit_events").insert({
        workspace_id: workspaceId,
        actor: "system:webhook-delivery",
        action: result.delivered ? "webhook.delivery.success" : "webhook.delivery.failed",
        target_type: "webhook",
        target_id: hook.id,
        meta: { event, event_id: eventId, attempts: result.attempts, status: result.status, delivered: result.delivered },
      });
      if (auditError) console.error("[aegisora] Webhook delivery audit write failed.");
    }));
}
