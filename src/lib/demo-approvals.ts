import type { ApprovalStatus, RiskLevel } from "@/components/aegisora/state-badge";

// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type DemoApproval = {
  id: string;
  decisionId?: string;
  evidenceId?: string;
  agent: string;
  action: string;
  target: string;
  environment: string;
  policy: string;
  risk: RiskLevel;
  reason: string;
  requestedAt: string;
  requiredPermission: string;
  status: ApprovalStatus;
  resolution?: string;
  resolvedAt?: string;
};

export const demoApprovals: DemoApproval[] = [
  {
    id: "apr_9d41e7a3",
    decisionId: "dec_01J8XQ4M2K",
    evidenceId: "evd_a24c07f1",
    agent: "finance-operator",
    action: "external_transfer",
    target: "external account (amount above threshold)",
    environment: "production",
    policy: "transfer-threshold-v4",
    risk: "HIGH",
    reason: "Policy requires human authorization for external transfers above the elevated threshold in production.",
    requestedAt: "2026-09-21 22:14:07Z",
    requiredPermission: "approvals.manage",
    status: "PENDING",
  },
  {
    id: "apr_2b78e4c1",
    agent: "ops-assistant",
    action: "modify_permissions",
    target: "workspace roles (grant admin)",
    environment: "production",
    policy: "access-change-control-v1",
    risk: "HIGH",
    reason: "Granting administrative rights requires human authorization.",
    requestedAt: "2026-09-21 20:41:12Z",
    requiredPermission: "approvals.manage",
    status: "APPROVED",
    resolution: "Approved after review of the requested role change.",
    resolvedAt: "2026-09-21 20:52:40Z",
  },
  {
    id: "apr_7e03d5a9",
    agent: "finance-operator",
    action: "external_transfer",
    target: "external account (amount above threshold)",
    environment: "production",
    policy: "transfer-threshold-v4",
    risk: "MEDIUM",
    reason: "Transfer above the elevated threshold requires human authorization.",
    requestedAt: "2026-09-21 18:03:55Z",
    requiredPermission: "approvals.manage",
    status: "EXPIRED",
    resolution: "No resolution before the approval window closed. Execution did not proceed.",
    resolvedAt: "2026-09-21 19:03:55Z",
  },
];

export function getApproval(id: string) {
  return demoApprovals.find((a) => a.id === id);
}