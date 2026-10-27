"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { VerdictPill, type VerdictName } from "@/components/aegisora/verdict-pill";

type Sample = {
  id: string;
  action: string;
  agent: string;
  context: string;
  policy: string | null;
  verdict: VerdictName;
  reason: string;
  evidence: string;
};

/* Illustrative sample data. Not read from a live workspace. */
const SAMPLES: Sample[] = [
  {
    id: "read-ticket",
    action: "crm.read_ticket",
    agent: "support-agent",
    context: "Ticket 4821 in the support queue",
    policy: "support-read-scope",
    verdict: "ALLOW",
    reason: "Within the read scope granted to support-agent.",
    evidence: "9c41f2...e07a",
  },
  {
    id: "transfer",
    action: "payments.transfer",
    agent: "finance-agent",
    context: "Amount: $48,000",
    policy: "transfer-approval-limit",
    verdict: "ESCALATE",
    reason: "The amount is above the approval limit. A person must approve before the action runs.",
    evidence: "b27d10...4f93",
  },
  {
    id: "drop-table",
    action: "db.drop_table",
    agent: "code-agent",
    context: "Target: users",
    policy: "deny-destructive-sql",
    verdict: "BLOCK",
    reason: "Destructive action denied by policy.",
    evidence: "e15a8c...71d0",
  },
  {
    id: "bank-export",
    action: "vendors.export_bank_details",
    agent: "ops-agent",
    context: "Bulk export from a scheduled job",
    policy: null,
    verdict: "BLOCK",
    reason: "No matching policy. The default is BLOCK.",
    evidence: "0d6f3b...c8a2",
  },
];

export function DecisionDemo() {
  const [selectedId, setSelectedId] = useState<string>(SAMPLES[0].id);
  const active = SAMPLES.find((s) => s.id === selectedId) ?? SAMPLES[0];

  const rows: [string, string, boolean][] = [
    ["Action", active.action, true],
    ["Agent", active.agent, false],
    ["Context", active.context, false],
    ["Matched policy", active.policy ?? "None", true],
    ["Reason", active.reason, false],
    ["Evidence hash", active.evidence, true],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div role="group" aria-label="Sample actions" className="grid content-start gap-3">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === active.id}
            onClick={() => setSelectedId(s.id)}
            className="grid gap-1 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-accent"
          >
            <span className="font-mono text-sm font-medium break-all text-foreground">{s.action}</span>
            <span className="text-sm text-muted-foreground">{s.agent}</span>
          </button>
        ))}
      </div>

      <Card aria-live="polite" className="p-0">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <VerdictPill verdict={active.verdict} />
            <span className="text-xs text-muted-foreground">Sample decision</span>
          </div>
          <dl className="grid gap-4">
            {rows.map(([label, value, mono]) => (
              <div key={label} className="grid gap-1 border-b pb-4 last:border-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className={"text-sm break-words text-foreground" + (mono ? " font-mono" : "")}>{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}