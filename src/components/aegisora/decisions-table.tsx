import Link from "next/link";
import type { DemoDecision } from "@/lib/demo-data";
import { DecisionBadge, RiskIndicator } from "./state-badge";

export function DecisionsTable({ rows }: { rows: DemoDecision[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface-2">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Time (UTC)</th>
            <th className="px-4 py-3 font-medium">Decision</th>
            <th className="px-4 py-3 font-medium">Agent</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Environment</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium">Policy</th>
            <th className="px-4 py-3 font-medium">Decision ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr
              key={d.id}
              className="border-b border-border/60 last:border-0 hover:bg-surface-3"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                {d.timestamp}
              </td>
              <td className="px-4 py-3">
                <DecisionBadge state={d.state} />
              </td>
              <td className="px-4 py-3 font-mono text-xs">{d.agent}</td>
              <td className="px-4 py-3 font-mono text-xs">{d.action}</td>
              <td className="px-4 py-3 text-xs">{d.environment}</td>
              <td className="px-4 py-3">
                <RiskIndicator level={d.risk} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {d.policy}-{d.policyVersion}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/decisions/${d.id}`}
                  className="font-mono text-xs text-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {d.id}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}