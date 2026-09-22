import Link from "next/link";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Evidence" };

export default function EvidencePage() {
  return (
    <div className="mx-auto max-w-[80rem] space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Evidence ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Records linked to decisions, traces and executions.
        </p>
      </header>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Evidence ID</th>
              <th className="px-4 py-3 font-medium">Decision</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Trace ID</th>
              <th className="px-4 py-3 font-medium">Execution ID</th>
              <th className="px-4 py-3 font-medium">Recorded (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {demoDecisions.map((d) => (
              <tr key={d.evidenceId} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3 font-mono text-xs">{d.evidenceId}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/decisions/${d.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{d.id}</Link>
                </td>
                <td className="px-4 py-3"><DecisionBadge state={d.state} /></td>
                <td className="px-4 py-3 font-mono text-xs">{d.agent}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.traceId}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.executionId}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{d.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}