// SAMPLE DATA ONLY. Not connected to Aegisora Core.
import type { demoDecisions } from "@/lib/demo-data";

type DecisionState = (typeof demoDecisions)[number]["state"];

export type DemoPolicy = {
  id: string;
  name: string;
  version: string;
  agent: string;
  action: string;
  environment: string;
  decision: DecisionState;
  description: string;
  conditions: string[];
  updatedAt: string;
  matchesToday: number;
};

export const demoPolicies: DemoPolicy[] = [
  {
    id: "prod-data-protection-v1",
    name: "prod-data-protection",
    version: "v1",
    agent: "ops-assistant",
    action: "delete_records",
    environment: "production",
    decision: "BLOCK",
    description: "Blocks any destructive write against production data tables regardless of caller.",
    conditions: ["environment == production", "action in [delete_records, drop_table, truncate]", "resource.sensitivity >= high"],
    updatedAt: "2026-08-30",
    matchesToday: 3,
  },
  {
    id: "finance-transfer-review-v2",
    name: "finance-transfer-review",
    version: "v2",
    agent: "finance-operator",
    action: "external_transfer",
    environment: "production",
    decision: "ESCALATE",
    description: "Routes external transfers above the configured threshold to human approval.",
    conditions: ["action == external_transfer", "amount > 5000", "destination.verified == false"],
    updatedAt: "2026-09-10",
    matchesToday: 14,
  },
  {
    id: "staging-read-only-v1",
    name: "staging-read-only",
    version: "v1",
    agent: "report-builder",
    action: "read_report_data",
    environment: "staging",
    decision: "ALLOW",
    description: "Allows read-only report generation queries against staging datasets.",
    conditions: ["environment == staging", "action == read_report_data"],
    updatedAt: "2026-07-22",
    matchesToday: 128,
  },
  {
    id: "support-pii-mask-v3",
    name: "support-pii-mask",
    version: "v3",
    agent: "support-bot",
    action: "read_account",
    environment: "production",
    decision: "ALLOW",
    description: "Allows account lookups with automatic PII field masking applied at response time.",
    conditions: ["action == read_account", "response.fields masked = [ssn, dob, card_number]"],
    updatedAt: "2026-09-01",
    matchesToday: 0,
  },
];

export function getPolicy(id: string) {
  return demoPolicies.find((p) => p.id === id);
}