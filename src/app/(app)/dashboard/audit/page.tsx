import Link from "next/link";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Audit" };

const eventFor = { ALLOW: "execution.allowed", BLOCK: "execution.blocked", ESCALATE: "approval.requested" } as const;

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-[80rem] space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Audit ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who did what, through which agent, in which workspace, under which policy.
        </p>
      </header>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Audit ID</th>
              <th className="px-4 py-3 font-medium">Time (UTC)</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Policy</th>
              <th className="px-4 py-3 font-medium">Decision</th>
              <th className="px-4 py-3 font-medium">Record</th>
            </tr>
          </thead>
          <tbody>
            {demoDecisions.map((d) => (
              <tr key={d.auditId} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3 font-mono text-xs">{d.auditId}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{d.timestamp}</td>
                <td className="px-4 py-3 font-mono text-xs">{eventFor[d.state]}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.agent}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.workspace}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.policy}-{d.policyVersion}</td>
                <td className="px-4 py-3"><DecisionBadge state={d.state} /></td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/decisions/${d.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{d.id}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}