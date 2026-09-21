// SAMPLE DATA ONLY. Not connected to Aegisora Core.
import type { RiskLevel } from "@/components/aegisora/state-badge";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export type DemoIncident = {
  id: string;
  title: string;
  summary: string;
  severity: RiskLevel;
  status: IncidentStatus;
  agent: string;
  decisionId?: string;
  openedAt: string;
  resolvedAt?: string;
  timeline: { at: string; label: string }[];
};

export const demoIncidents: DemoIncident[] = [
  {
    id: "inc_7a2c9f01",
    title: "Repeated BLOCK on delete_records by ops-assistant",
    summary: "ops-assistant attempted delete_records against production three times within an hour, each blocked by prod-data-protection-v1.",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    agent: "ops-assistant",
    decisionId: "dec_01J8XQ4M2L",
    openedAt: "2026-09-21 21:40:02Z",
    timeline: [
      { at: "2026-09-21 21:12:08Z", label: "First blocked attempt recorded" },
      { at: "2026-09-21 21:31:44Z", label: "Second blocked attempt recorded" },
      { at: "2026-09-21 21:40:02Z", label: "Threshold exceeded, incident opened automatically" },
    ],
  },
  {
    id: "inc_4e18b370",
    title: "Escalation queue backing up for finance-operator",
    summary: "Approval resolution time for finance-operator transfers exceeded the expected window, risking automatic expiry.",
    severity: "HIGH",
    status: "OPEN",
    agent: "finance-operator",
    decisionId: "dec_01J8XQ4M2K",
    openedAt: "2026-09-21 22:20:15Z",
    timeline: [
      { at: "2026-09-21 22:14:07Z", label: "Approval apr_9d41e7a3 created" },
      { at: "2026-09-21 22:20:15Z", label: "Resolution window warning threshold reached" },
    ],
  },
  {
    id: "inc_9c5f1e22",
    title: "Unusual read volume from report-builder",
    summary: "report-builder read volume in staging exceeded its typical range. No policy violation, flagged for review.",
    severity: "MEDIUM",
    status: "RESOLVED",
    agent: "report-builder",
    openedAt: "2026-09-20 14:02:40Z",
    resolvedAt: "2026-09-20 15:10:12Z",
    timeline: [
      { at: "2026-09-20 14:02:40Z", label: "Volume anomaly detected" },
      { at: "2026-09-20 14:20:00Z", label: "Reviewed by workspace owner" },
      { at: "2026-09-20 15:10:12Z", label: "Marked resolved: expected reporting run" },
    ],
  },
];

export function getIncident(id: string) {
  return demoIncidents.find((i) => i.id === id);
}