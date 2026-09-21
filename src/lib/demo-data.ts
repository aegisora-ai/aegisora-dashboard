import type {
  ApprovalStatus,
  DecisionState,
  RiskLevel,
} from "@/components/aegisora/state-badge";

// SAMPLE DATA ONLY. Not connected to Aegisora Core.
// Replace with server-side queries once the data layer exists.

export type DemoDecision = {
  id: string;
  traceId: string;
  executionId: string;
  evidenceId: string;
  auditId: string;
  timestamp: string;
  workspace: string;
  agent: string;
  action: string;
  target: string;
  environment: string;
  policy: string;
  policyVersion: string;
  risk: RiskLevel;
  riskFactors: string[];
  state: DecisionState;
  reason: string;
  enforcement: string;
  execution: string;
  approval?: {
    id: string;
    status: ApprovalStatus;
    requiredRole: string;
  };
};

export const demoDecisions: DemoDecision[] = [
  {
    id: "dec_01J8XQ4M2K",
    traceId: "trc_7f3a91c2",
    executionId: "exe_5b10d8e4",
    evidenceId: "evd_a24c07f1",
    auditId: "aud_3e9b62d0",
    timestamp: "2026-09-21 22:14:07Z",
    workspace: "demo-workspace",
    agent: "finance-operator",
    action: "external_transfer",
    target: "external account (amount above threshold)",
    environment: "production",
    policy: "transfer-threshold",
    policyVersion: "v4",
    risk: "HIGH",
    riskFactors: [
      "Action moves value to an external destination",
      "Environment is production",
      "Amount exceeds the elevated threshold defined in the policy",
    ],
    state: "ESCALATE",
    reason:
      "Policy requires human authorization for external transfers above the elevated threshold in production.",
    enforcement: "Execution gate closed. Request paused pending approval.",
    execution: "PAUSED: awaiting approval",
    approval: {
      id: "apr_9d41e7a3",
      status: "PENDING",
      requiredRole: "approvals.manage",
    },
  },
  {
    id: "dec_01J8XQ3H7P",
    traceId: "trc_2c88d10b",
    executionId: "exe_71e4a9c6",
    evidenceId: "evd_6b30f2a9",
    auditId: "aud_c1d47e85",
    timestamp: "2026-09-21 22:11:52Z",
    workspace: "demo-workspace",
    agent: "report-builder",
    action: "read_report_data",
    target: "analytics.reports (read-only)",
    environment: "staging",
    policy: "read-only-reporting",
    policyVersion: "v2",
    risk: "LOW",
    riskFactors: [
      "Read-only action",
      "Non-production environment",
      "Target is within the agent's bound scope",
    ],
    state: "ALLOW",
    reason: "Action matches an allowed rule and no risk condition was raised.",
    enforcement: "Execution gate open. Request forwarded.",
    execution: "EXECUTED",
  },
  {
    id: "dec_01J8XQ2B9T",
    traceId: "trc_e05b7a14",
    executionId: "exe_0a92c3d7",
    evidenceId: "evd_f81d5c30",
    auditId: "aud_74a0b9e2",
    timestamp: "2026-09-21 22:08:31Z",
    workspace: "demo-workspace",
    agent: "ops-assistant",
    action: "delete_records",
    target: "customers table (bulk delete)",
    environment: "production",
    policy: "prod-data-protection",
    policyVersion: "v1",
    risk: "CRITICAL",
    riskFactors: [
      "Destructive bulk operation",
      "Environment is production",
      "Action is prohibited for this agent by policy",
    ],
    state: "BLOCK",
    reason: "Bulk deletion in production is prohibited by policy.",
    enforcement: "Execution gate closed. Request denied.",
    execution: "NOT EXECUTED",
  },
];

export function getDecision(id: string) {
  return demoDecisions.find((d) => d.id === id);
}