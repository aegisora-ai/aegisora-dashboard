// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type TraceStageStatus = "done" | "skipped";

export type DemoTrace = {
  id: string;
  decisionId: string;
  agent: string;
  action: string;
  environment: string;
  outcome: "ALLOW" | "BLOCK" | "ESCALATE";
  durationMs: number;
  startedAt: string;
  stages: { name: string; status: TraceStageStatus; durationMs: number }[];
};

export const demoTraces: DemoTrace[] = [
  {
    id: "trc_9a41c7e2",
    decisionId: "dec_01J8XQ4M2K",
    agent: "finance-operator",
    action: "external_transfer",
    environment: "production",
    outcome: "ESCALATE",
    durationMs: 184,
    startedAt: "2026-09-21 22:14:07Z",
    stages: [
      { name: "REQUEST", status: "done", durationMs: 4 },
      { name: "CONTEXT", status: "done", durationMs: 22 },
      { name: "POLICY", status: "done", durationMs: 31 },
      { name: "RISK", status: "done", durationMs: 40 },
      { name: "DECISION", status: "done", durationMs: 12 },
      { name: "ENFORCEMENT", status: "done", durationMs: 9 },
      { name: "EXECUTION", status: "skipped", durationMs: 0 },
      { name: "EVIDENCE", status: "done", durationMs: 66 },
    ],
  },
  {
    id: "trc_6b30f2a9",
    decisionId: "dec_01J8XQ4M2J",
    agent: "report-builder",
    action: "read_report_data",
    environment: "staging",
    outcome: "ALLOW",
    durationMs: 61,
    startedAt: "2026-09-21 19:52:03Z",
    stages: [
      { name: "REQUEST", status: "done", durationMs: 2 },
      { name: "CONTEXT", status: "done", durationMs: 8 },
      { name: "POLICY", status: "done", durationMs: 11 },
      { name: "RISK", status: "done", durationMs: 9 },
      { name: "DECISION", status: "done", durationMs: 4 },
      { name: "ENFORCEMENT", status: "done", durationMs: 3 },
      { name: "EXECUTION", status: "done", durationMs: 18 },
      { name: "EVIDENCE", status: "done", durationMs: 6 },
    ],
  },
  {
    id: "trc_f81d5c30",
    decisionId: "dec_01J8XQ4M2L",
    agent: "ops-assistant",
    action: "delete_records",
    environment: "production",
    outcome: "BLOCK",
    durationMs: 47,
    startedAt: "2026-09-21 21:12:08Z",
    stages: [
      { name: "REQUEST", status: "done", durationMs: 3 },
      { name: "CONTEXT", status: "done", durationMs: 10 },
      { name: "POLICY", status: "done", durationMs: 14 },
      { name: "RISK", status: "done", durationMs: 11 },
      { name: "DECISION", status: "done", durationMs: 5 },
      { name: "ENFORCEMENT", status: "done", durationMs: 4 },
      { name: "EXECUTION", status: "skipped", durationMs: 0 },
      { name: "EVIDENCE", status: "done", durationMs: 0 },
    ],
  },
];

export function getTrace(id: string) {
  return demoTraces.find((t) => t.id === id);
}