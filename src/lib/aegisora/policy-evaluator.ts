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
