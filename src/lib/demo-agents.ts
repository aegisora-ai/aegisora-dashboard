// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type AgentStatus = "ACTIVE" | "PAUSED" | "DISABLED";

export type DemoAgent = {
  id: string;
  name: string;
  description: string;
  environment: string;
  status: AgentStatus;
  owner: string;
  requestsToday: number;
  allowRate: number;
  avgRiskScore: number;
  lastActive: string;
  createdAt: string;
  activityTrend: number[];
};

export const demoAgents: DemoAgent[] = [
  {
    id: "finance-operator",
    name: "finance-operator",
    description: "Handles outbound transfers, invoice reconciliation, and payout approvals.",
    environment: "production",
    status: "ACTIVE",
    owner: "platform-team",
    requestsToday: 412,
    allowRate: 86.4,
    avgRiskScore: 2.4,
    lastActive: "2026-09-21 22:20:15Z",
    createdAt: "2026-06-02",
    activityTrend: [180, 210, 260, 240, 300, 340, 320, 360, 390, 370, 400, 412],
  },
  {
    id: "ops-assistant",
    name: "ops-assistant",
    description: "Internal tooling assistant for infrastructure and data operations tasks.",
    environment: "production",
    status: "ACTIVE",
    owner: "infra-team",
    requestsToday: 288,
    allowRate: 91.2,
    avgRiskScore: 3.1,
    lastActive: "2026-09-21 21:40:02Z",
    createdAt: "2026-05-14",
    activityTrend: [120, 140, 130, 160, 150, 190, 210, 200, 230, 250, 260, 288],
  },
  {
    id: "report-builder",
    name: "report-builder",
    description: "Generates scheduled and ad hoc analytics reports from staging data sources.",
    environment: "staging",
    status: "ACTIVE",
    owner: "data-team",
    requestsToday: 940,
    allowRate: 99.1,
    avgRiskScore: 0.6,
    lastActive: "2026-09-21 19:52:03Z",
    createdAt: "2026-04-01",
    activityTrend: [600, 650, 700, 680, 720, 760, 800, 820, 860, 900, 910, 940],
  },
  {
    id: "support-bot",
    name: "support-bot",
    description: "Customer-facing assistant with read access to account and ticket data.",
    environment: "production",
    status: "PAUSED",
    owner: "support-team",
    requestsToday: 0,
    allowRate: 94.7,
    avgRiskScore: 1.8,
    lastActive: "2026-09-20 09:12:41Z",
    createdAt: "2026-03-19",
    activityTrend: [340, 360, 380, 350, 330, 300, 260, 200, 140, 60, 0, 0],
  },
];

export function getAgent(id: string) {
  return demoAgents.find((a) => a.id === id);
}