import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { conditionsMet, decidePolicy, type Effect } from "@/lib/aegisora/policy-evaluator";
import { maskSensitiveData, maskSensitiveText } from "@/lib/aegisora/redaction";
import { buildRecord, pgJsonbText, utcStamp, verifyV2, type EvidenceRecordV2 } from "@/lib/evidence-v2";

// Public sandbox. Same decidePolicy, conditionsMet and redaction modules as /api/v1/evaluate, a fixed policy set,
// and evidence hashed with the v2 algorithm (src/lib/evidence-v2.ts). No database, no authentication, nothing is stored.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WS = "demo-sandbox";
const MAX_BODY = 60_000;
const MAX_CHAIN = 40;
const HEX64 = /^[0-9a-f]{64}$/;

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
  return e.n > 40;
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
    const payload = { agent_name: agent, action: safeAction, decision: d.effect, reason, policy_id: d.policyId, risk_score: r, input: safeInput };
    const record = buildRecord({
      seq: l.seq,
      id: randomUUID(),
      workspace_id: WS,
      decision_id: randomUUID(),
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
      approval_required: d.effect === "ESCALATE",
      redacted: JSON.stringify(safeInput) !== JSON.stringify(input),
      record,
    });
  }

  if (b.op === "resolve") {
    const l = link(b);
    const decisionId = str(b.decisionId, 64);
    const traceId = str(b.traceId, 64);
    const action = str(b.action, 200);
    if (!l || !decisionId || !traceId || !action) return bad(400, "invalid_request", "Missing or invalid fields.");
    const verdict = b.approve === true ? "APPROVED" : "REJECTED";
    const record = buildRecord({
      seq: l.seq,
      id: randomUUID(),
      workspace_id: WS,
      decision_id: decisionId,
      action: maskSensitiveText(action),
      decision: verdict,
      trace_id: traceId,
      prev_hash: l.prev,
      created_at_utc: utcStamp(),
      payload_text: pgJsonbText({ resolves: decisionId, approver: "demo-reviewer" }),
    });
    return NextResponse.json({ record });
  }

  if (b.op === "verify") {
    const chain = b.chain;
    if (!Array.isArray(chain) || chain.length < 1 || chain.length > MAX_CHAIN) return bad(400, "invalid_request", "'chain' must hold 1 to " + MAX_CHAIN + " records.");
    const clean: EvidenceRecordV2[] = [];
    for (const raw of chain) {
      const r = raw as Record<string, unknown> | null;
      if (!r || typeof r !== "object" || typeof r.seq !== "number" || !Number.isInteger(r.seq) || typeof r.hash_version !== "number") return bad(400, "invalid_request", "Malformed record.");
      for (const k of ["id", "workspace_id", "decision_id", "action", "decision", "trace_id", "prev_hash", "hash", "created_at_utc", "payload_text"]) {
        if (typeof r[k] !== "string") return bad(400, "invalid_request", "Malformed record.");
      }
      clean.push({
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
    return NextResponse.json(verifyV2(clean));
  }

  return bad(400, "invalid_op", "'op' must be evaluate, resolve or verify.");
}