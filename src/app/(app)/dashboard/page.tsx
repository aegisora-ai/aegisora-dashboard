import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { DecisionsTable } from "@/components/aegisora/decisions-table";
import { ApprovalBadge, DecisionBadge, RiskIndicator } from "@/components/aegisora/state-badge";
import { demoApprovals } from "@/lib/demo-approvals";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const count = (s: string) => demoDecisions.filter((d) => d.state === s).length;
  const pending = demoApprovals.filter((a) => a.status === "PENDING");
  const latest = demoDecisions[0];

  const kpis = [
    { label: "Decisions", value: demoDecisions.length, note: "in this sample", tone: "" },
    { label: "Allowed", value: count("ALLOW"), note: "gate open", tone: "text-allow" },
    { label: "Blocked", value: count("BLOCK"), note: "gate closed", tone: "text-block" },
    { label: "Escalated", value: count("ESCALATE"), note: "gate paused", tone: "text-escalate" },
    { label: "Pending approvals", value: pending.length, note: "awaiting a person", tone: "" },
  ];

  const path: [string, React.ReactNode][] = [
    ["REQUEST", `${latest.agent} proposes ${latest.action}`],
    ["CONTEXT", `${latest.environment} / ${latest.workspace}`],
    ["POLICY", `${latest.policy}-${latest.policyVersion}`],
    ["RISK", <RiskIndicator key="r" level={latest.risk} />],
    ["DECISION", <DecisionBadge key="d" state={latest.state} />],
    ["ENFORCEMENT", latest.enforcement],
    ["EVIDENCE", latest.evidenceId],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Runtime decisions and pending authorizations in this workspace.
          </p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface-2 p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className={`mt-2 text-4xl font-light tabular-nums ${k.tone}`}>{k.value}</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">{k.note}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section aria-labelledby="pending-heading">
            <h2 id="pending-heading" className="mb-3 text-sm font-medium">Needs a decision</h2>
            {pending.length === 0 ? (
              <p className="aeg-panel px-5 py-8 text-sm text-muted-foreground">No actions are waiting for authorization.</p>
            ) : (
              <ul className="aeg-panel divide-y divide-border">
                {pending.map((a) => (
                  <li key={a.id}>
                    <Link href={`/dashboard/approvals/${a.id}`} className="group flex items-center justify-between gap-4 border-l-2 border-escalate px-5 py-4 transition-colors hover:bg-surface-3">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-3">
                          <ApprovalBadge status={a.status} />
                          <RiskIndicator level={a.risk} />
                        </span>
                        <span className="mt-2 block font-mono text-xs">{a.agent} / {a.action}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{a.reason}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-sm text-cyan">
                        Review <ArrowRight className="size-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-heading">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="recent-heading" className="text-sm font-medium">Recent decisions</h2>
              <Link href="/dashboard/decisions" className="text-xs text-cyan underline-offset-4 hover:underline">
                Decision ledger
              </Link>
            </div>
            <DecisionsTable rows={demoDecisions} />
          </section>
        </div>

        <section aria-labelledby="latest-heading" className="h-fit">
          <h2 id="latest-heading" className="mb-3 text-sm font-medium">Latest decision path</h2>
          <div className="aeg-panel p-5">
            <ol className="space-y-3">
              {path.map(([label, value], i) => (
                <li key={label} className="grid grid-cols-[92px_1fr] items-start gap-3 text-xs">
                  <span className="font-mono tracking-wider text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} {label}
                  </span>
                  <span className="break-words font-mono">{value}</span>
                </li>
              ))}
            </ol>
            <Link href={`/dashboard/decisions/${latest.id}`} className="mt-5 inline-flex items-center gap-1 text-sm text-cyan underline-offset-4 hover:underline">
              Open inspector <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}