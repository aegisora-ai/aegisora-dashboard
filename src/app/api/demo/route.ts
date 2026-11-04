import { NextResponse } from "next/server";
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { conditionsMet, decidePolicy, type Effect } from "@/lib/aegisora/policy-evaluator";
import { maskSensitiveData, maskSensitiveText } from "@/lib/aegisora/redaction";
import { buildRecord, pgJsonbText, utcStamp, verifyV2, type EvidenceRecordV2 } from "@/lib/evidence-v2";

// Public sandbox. Same decidePolicy, conditionsMet and redaction modules as /api/v1/evaluate, a fixed policy set,
// and evidence hashed with the v2 algorithm (src/lib/evidence-v2.ts). No database, no authentication, nothing is stored.
// Approvals are bound to one action: an HMAC-signed ticket carries decision id, action+input hash, requester and expiry.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WS = "demo-sandbox";
const MAX_BODY = 120_000;
const MAX_CHAIN = 40;
const HEX64 = /^[0-9a-f]{64}$/;
const APPROVAL_TTL_MS = 10 * 60_000;
// Set DEMO_TICKET_SECRET in the environment (16+ chars). Without it each server instance uses its own random secret.
const TICKET_SECRET =
  process.env.DEMO_TICKET_SECRET && process.env.DEMO_TICKET_SECRET.length >= 16
    ? process.env.DEMO_TICKET_SECRET
    : randomBytes(32).toString("hex");

type Ticket = { d: string; a: string; h: string; r: string; e: number };

function signTicket(t: Ticket): string {
  const body = Buffer.from(JSON.stringify(t), "utf8").toString("base64url");
  const mac = createHmac("sha256", TICKET_SECRET).update(body).digest("hex");
  return body + "." + mac;
}

function readTicket(token: string): Ticket | null {
  const i = token.indexOf(".");
  if (i < 1) return null;
  const body = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = createHmac("sha256", TICKET_SECRET).update(body).digest("hex");
  const a = Buffer.from(mac, "utf8");
  const e = Buffer.from(expected, "utf8");
  if (a.length !== e.length || !timingSafeEqual(a, e)) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<Ticket>;
    if (typeof t.d !== "string" || typeof t.a !== "string" || typeof t.h !== "string" || typeof t.r !== "string" || typeof t.e !== "number") return null;
    return { d: t.d, a: t.a, h: t.h, r: t.r, e: t.e };
  } catch {
    return null;
  }
}

const POLICIES: { id: string; name: string; decision: Effect; action: RegExp; conditions: unknown }[] = [
  { id: "pol_read", name: "support-read-scope", decision: "ALLOW", action: /^crm\.read_/, conditions: null },
  { id: "pol_xfer_small", name: "transfer-small", decision: "ALLOW", action: /^payments\.transfer$/, conditions: [{ field: "input.amount", op: "lte", value: 10000 }] },
  { id: "pol_xfer_big", name: "transfer-approval-limit", decision: "ESCALATE", action: /^payments\.transfer$/, conditions: [{ field: "input.amount", op: "gt", value: 10000 }] },
  { id: "pol_destructive", name: "deny-destructive-sql", decision: "BLOCK", action: /^db\.(drop|truncate|delete)_/, conditions: null },
  { id: "pol_risk", name: "block-critical-risk", decision: "BLOCK", action: /.*/, conditions: [{ field: "risk", op: "gte", value: 90 }] },
];

const hits = new Map<string, { n: number; reset: number }>();
// Per-instance limit. On serverless hosting this is best effort, not a hard guarantee.
function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 2000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const e = hits.get(ip);
  if (!e || e.reset < now) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  e.n += 1;
  return e.n > 60;
}

function bad(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null;
}

function link(b: Record<string, unknown>): { seq: number; prev: string } | null {
  const seq = b.seq;
  const prev = b.prevHash;
  if (typeof seq !== "number" || !Number.isInteger(seq) || seq < 1 || seq > MAX_CHAIN) return null;
  if (typeof prev !== "string" || (prev !== "GENESIS" && !HEX64.test(prev))) return null;
  return { seq, prev };
}

function cleanChain(chain: unknown): EvidenceRecordV2[] | null {
  if (!Array.isArray(chain) || chain.length < 1 || chain.length > MAX_CHAIN) return null;
  const out: EvidenceRecordV2[] = [];
  for (const raw of chain) {
    const r = raw as Record<string, unknown> | null;
    if (!r || typeof r !== "object" || typeof r.seq !== "number" || !Number.isInteger(r.seq) || typeof r.hash_version !== "number") return null;
    for (const k of ["id", "workspace_id", "decision_id", "action", "decision", "trace_id", "prev_hash", "hash", "created_at_utc", "payload_text"]) {
      if (typeof r[k] !== "string") return null;
    }
    out.push({
      seq: r.seq,
      id: r.id as string,
      workspace_id: r.workspace_id as string,
      decision_id: r.decision_id as string,
      action: r.action as string,
      decision: r.decision as string,
      trace_id: r.trace_id as string,
      prev_hash: r.prev_hash as string,
      hash: r.hash as string,
      hash_version: r.hash_version,
      created_at_utc: r.created_at_utc as string,
      payload_text: r.payload_text as string,
    });
  }
  return out;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return bad(429, "rate_limited", "Too many sandbox requests. Wait a minute and try again.");

  const text = await req.text();
  if (text.length > MAX_BODY) return bad(413, "too_large", "Request is too large.");
  let b: Record<string, unknown>;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    b = parsed as Record<string, unknown>;
  } catch {
    return bad(400, "invalid_json", "Body must be a JSON object.");
  }

  if (b.op === "evaluate") {
    const l = link(b);
    if (!l) return bad(400, "invalid_chain_position", "Invalid seq or prevHash.");
    const agent = str(b.agent, 120);
    const action = str(b.action, 200);
    if (!agent || !action) return bad(400, "invalid_request", "'agent' and 'action' are required.");
    if (maskSensitiveText(agent) !== agent) return bad(400, "invalid_request", "'agent' must be a non-sensitive identifier, not personal data or a credential.");
    const risk = b.risk === undefined ? 0 : b.risk;
    if (typeof risk !== "number" || !Number.isFinite(risk) || risk < 0 || risk > 100) return bad(400, "invalid_request", "'risk' must be a number between 0 and 100.");
    const input = b.input && typeof b.input === "object" && !Array.isArray(b.input) ? b.input : null;
    if (input && JSON.stringify(input).length > 2000) return bad(400, "invalid_request", "'input' is too large.");

    const r = Math.round(risk);
    const matched = POLICIES.filter((p) => p.action.test(action) && conditionsMet(p.conditions, { risk: r, input }, p.decision));
    const d = decidePolicy({
      agentFound: true,
      agentState: "ACTIVE",
      defaultEffect: "BLOCK",
      policies: matched.map((p) => ({ id: p.id, name: p.name, decision: p.decision })),
    });
    const safeInput = maskSensitiveData(input);
    const safeAction = maskSensitiveText(action);
    const reason = maskSensitiveText(d.reason);
    const escalate = d.effect === "ESCALATE";
    const decisionId = randomUUID();
    const expiresAtMs = Date.now() + APPROVAL_TTL_MS;
    const argsHash = createHash("sha256").update(pgJsonbText({ action: safeAction, input: safeInput }), "utf8").digest("hex");
    const payload: Record<string, unknown> = { agent_name: agent, action: safeAction, decision: d.effect, reason, policy_id: d.policyId, risk_score: r, input: safeInput };
    if (escalate) {
      payload.args_hash = argsHash;
      payload.approval_expires_at = new Date(expiresAtMs).toISOString();
    }
    const record = buildRecord({
      seq: l.seq,
      id: randomUUID(),
      workspace_id: WS,
      decision_id: decisionId,
      action: safeAction,
      decision: d.effect,
      trace_id: randomUUID(),
      prev_hash: l.prev,
      created_at_utc: utcStamp(),
      payload_text: pgJsonbText(payload),
    });
    return NextResponse.json({
      effect: d.effect,
      reason,
      policy_id: d.policyId,
      approval_required: escalate,
      redacted: JSON.stringify(safeInput) !== JSON.stringify(input),
      approval: escalate
        ? {
            ticket: signTicket({ d: decisionId, a: safeAction, h: argsHash, r: agent, e: expiresAtMs }),
            args_hash: argsHash,
            expires_at: new Date(expiresAtMs).toISOString(),
            requester: agent,
          }
        : null,
      record,
    });
  }

  if (b.op === "resolve") {
    const l = link(b);
    const decisionId = str(b.decisionId, 64);
    const approver = str(b.approver, 120);
    const token = str(b.ticket, 2000);
    const chain = cleanChain(b.chain);
    if (!l || !decisionId || !approver || !token || !chain) return bad(400, "invalid_request", "Missing or invalid fields.");

    const t = readTicket(token);
    if (!t || t.d !== decisionId) return bad(403, "invalid_ticket", "Blocked: this approval ticket is not valid for this request.");
    if (Date.now() > t.e) return bad(403, "approval_expired", "Blocked: this approval request has expired.");
    if (approver.toLowerCase() === t.r.toLowerCase()) return bad(403, "separation_of_duties", "Blocked: the requester cannot approve its own request.");

    const check = verifyV2(chain);
    if (check.broken > 0) return bad(409, "chain_broken", "Blocked: the evidence chain failed verification, so nothing can be recorded on it.");
    const sorted = [...chain].sort((x, y) => x.seq - y.seq);
    const tip = sorted[sorted.length - 1];
    if (l.seq !== sorted.length + 1 || l.prev !== tip.hash) return bad(409, "chain_position", "The evidence chain position does not match.");

    const esc = sorted.find((r) => r.decision_id === decisionId && r.decision === "ESCALATE");
    if (!esc || esc.action !== t.a) return bad(403, "invalid_ticket", "Blocked: no matching escalation exists for this approval.");
    const used = sorted.some((r) => r.decision_id === decisionId && (r.decision === "APPROVED" || r.decision === "REJECTED"));
    if (used) return bad(409, "already_resolved", "Blocked: this approval was already used. Approvals are single-use.");

    const verdict = b.approve === true ? "APPROVED" : "REJECTED";
    const record = buildRecord({
      seq: l.seq,
      id: randomUUID(),
      workspace_id: WS,
      decision_id: decisionId,
      action: esc.action,
      decision: verdict,
      trace_id: esc.trace_id,
      prev_hash: l.prev,
      created_at_utc: utcStamp(),
      payload_text: pgJsonbText({ resolves: decisionId, approver, requester: t.r, args_hash: t.h }),
    });
    return NextResponse.json({ record });
  }

  if (b.op === "verify") {
    const clean = cleanChain(b.chain);
    if (!clean) return bad(400, "invalid_request", "'chain' must hold 1 to " + MAX_CHAIN + " valid records.");
    return NextResponse.json(verifyV2(clean));
  }

  return bad(400, "invalid_op", "'op' must be evaluate, resolve or verify.");
}