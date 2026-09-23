import Link from "next/link";
import type { Metadata } from "next";
import { ApprovalBadge, RiskIndicator } from "@/components/aegisora/state-badge";
import { demoApprovals } from "@/lib/demo-approvals";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  const rows = [...demoApprovals].sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING"));

  return (
    <div className="mx-auto max-w-[80rem] space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Approval queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actions that paused at the execution boundary and need an authorized person.
        </p>
      </header>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Requested (UTC)</th>
              <th className="px-4 py-3 font-medium">Approval ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className={cn("border-b border-border/60 last:border-0 hover:bg-surface-3", a.status === "PENDING" && "bg-escalate-muted/40")}>
                <td className="px-4 py-3"><ApprovalBadge status={a.status} /></td>
                <td className="px-4 py-3 font-mono text-xs">{a.agent}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.action}</td>
                <td className="px-4 py-3 text-xs">{a.environment}</td>
                <td className="px-4 py-3"><RiskIndicator level={a.risk} /></td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{a.requestedAt}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/approvals/${a.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">
                    {a.id}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}