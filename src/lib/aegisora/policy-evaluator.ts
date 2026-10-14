export type Effect = "ALLOW" | "BLOCK" | "ESCALATE";

export type PolicyCandidate = {
  id: string;
  name: string;
  decision: Effect;
};

export type DecisionResult = {
  effect: Effect;
  reason: string;
  policyId: string | null;
};

/** Deterministic policy precedence; caller supplies only authenticated, matched policies. */
export function decidePolicy(input: {
  agentFound: boolean;
  agentState: string | null;
  defaultEffect: Effect;
  policies: readonly PolicyCandidate[];
}): DecisionResult {
  if (!input.agentFound) {
    return { effect: "BLOCK", reason: "Unknown agent and auto-registration is disabled.", policyId: null };
  }
  if (input.agentState === "DISABLED" || input.agentState === "SUSPENDED") {
    return { effect: "BLOCK", reason: "Agent is suspended.", policyId: null };
  }

  const hit = (input.policies.find((policy) => policy.decision === "BLOCK")
    ?? input.policies.find((policy) => policy.decision === "ESCALATE")
    ?? input.policies.find((policy) => policy.decision === "ALLOW"));
  if (!hit) {
    return { effect: input.defaultEffect, reason: `No policy matched. Workspace default is ${input.defaultEffect}.`, policyId: null };
  }
  return {
    effect: hit.decision,
    reason: `Matched policy "${hit.name}" (${hit.decision}).`,
    policyId: hit.id,
  };
}

type ConditionContext = { risk: number; input: unknown };

function readField(ctx: ConditionContext, field: string): unknown {
  if (field === "risk") return ctx.risk;
  if (!field.startsWith("input.")) return undefined;
  let cur: unknown = ctx.input;
  for (const part of field.slice(6).split(".")) {
    if (cur && typeof cur === "object" && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

/**
 * All conditions must hold (AND). Format: [{ field: "risk" | "input.<path>", op, value }].
 * Malformed condition or missing field => fail closed: BLOCK/ESCALATE policies apply, ALLOW policies do not.
 */
export function conditionsMet(conditions: unknown, ctx: ConditionContext, decision: Effect): boolean {
  if (conditions === null || conditions === undefined) return true;
  const failClosed = decision !== "ALLOW";
  if (!Array.isArray(conditions)) return failClosed;
  for (const raw of conditions) {
    const c = raw as { field?: unknown; op?: unknown; value?: unknown } | null;
    if (!c || typeof c.field !== "string" || typeof c.op !== "string") return failClosed;
    const actual = readField(ctx, c.field);
    if (actual === undefined || actual === null) return failClosed;
    let ok: boolean;
    if (c.op === "in") {
      if (!Array.isArray(c.value)) return failClosed;
      ok = c.value.some((x) => String(x) === String(actual));
    } else if (c.op === "eq" || c.op === "neq") {
      const a = toNum(actual);
      const b = toNum(c.value);
      const same = a !== null && b !== null ? a === b : String(actual) === String(c.value);
      ok = c.op === "eq" ? same : !same;
    } else if (c.op === "gt" || c.op === "gte" || c.op === "lt" || c.op === "lte") {
      const a = toNum(actual);
      const b = toNum(c.value);
      if (a === null || b === null) return failClosed;
      ok = c.op === "gt" ? a > b : c.op === "gte" ? a >= b : c.op === "lt" ? a < b : a <= b;
    } else {
      return failClosed;
    }
    if (!ok) return false;
  }
  return true;
}