export const runtimeStages: string[][] = [
  ["REQUEST", "An agent proposes an action against a tool, system or resource.", "Request record"],
  ["CONTEXT", "Workspace, identity, access and environment are resolved. Security analysis runs on the request.", "Resolved context"],
  ["POLICY", "The applicable policy is evaluated against the request.", "Policy result"],
  ["RISK", "A risk level (LOW, MEDIUM, HIGH, CRITICAL) is assessed from the action and its context.", "Risk assessment"],
  ["DECISION", "ALLOW, BLOCK or ESCALATE is resolved.", "Decision ID"],
  ["ENFORCEMENT", "The execution gate opens, stops or pauses.", "Enforcement status"],
  ["EXECUTION", "The action runs in the environment, or it does not.", "Execution ID"],
  ["EVIDENCE", "The decision chain is recorded for audit.", "Evidence and audit IDs"],
];