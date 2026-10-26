"use client";

import { useState } from "react";

type Verdict = "ALLOW" | "ESCALATE" | "BLOCK";

type Sample = {
  id: string;
  action: string;
  agent: string;
  context: string;
  policy: string | null;
  verdict: Verdict;
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
  const tone = active.verdict.toLowerCase();

  return (
    <div className="hm-demo">
      <div className="hm-demo-list" role="group" aria-label="Sample actions">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="hm-demo-item"
            aria-pressed={s.id === active.id}
            onClick={() => setSelectedId(s.id)}
          >
            <span className="hm-demo-action">{s.action}</span>
            <span className="hm-demo-agent">{s.agent}</span>
          </button>
        ))}
      </div>

      <div className="hm-demo-panel" aria-live="polite">
        <div className="hm-demo-head">
          <span className={"hm-verdict hm-verdict--" + tone}>{active.verdict}</span>
          <span className="hm-demo-note">Sample decision</span>
        </div>
        <dl className="hm-demo-dl">
          <div>
            <dt>Action</dt>
            <dd>{active.action}</dd>
          </div>
          <div>
            <dt>Agent</dt>
            <dd>{active.agent}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{active.context}</dd>
          </div>
          <div>
            <dt>Matched policy</dt>
            <dd>{active.policy ?? "None"}</dd>
          </div>
          <div>
            <dt>Reason</dt>
            <dd>{active.reason}</dd>
          </div>
          <div>
            <dt>Evidence hash</dt>
            <dd className="hm-demo-hash">{active.evidence}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}