import Link from "next/link";
import type { Metadata } from "next";
import { Sparkline } from "@/components/aegisora/charts";
import { demoAgents } from "@/lib/demo-agents";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Agents" };

const statusTone: Record<string, string> = {
  ACTIVE: "text-allow",
  PAUSED: "text-escalate",
  DISABLED: "text-muted-foreground",
};

export default function AgentsPage() {
  const active = demoAgents.filter((a) => a.status === "ACTIVE").length;
  const avgAllow = Math.round((demoAgents.reduce((s, a) => s + a.allowRate, 0) / demoAgents.length) * 10) / 10;
  const totalToday = demoAgents.reduce((s, a) => s + a.requestsToday, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Registered agents evaluated by Aegisora Core.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total agents</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{demoAgents.length}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Active</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-allow">{active}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Requests today</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{totalToday}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg allow rate</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{avgAllow}%</div>
        </div>
      </section>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Allow rate</th>
              <th className="px-4 py-3 font-medium">Requests today</th>
              <th className="px-4 py-3 font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            {demoAgents.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/agents/${a.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{a.name}</Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.owner}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.environment}</td>
                <td className={cn("px-4 py-3 font-mono text-[11px] tracking-wider", statusTone[a.status])}>{a.status}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.allowRate}%</td>
                <td className="px-4 py-3 font-mono text-xs">{a.requestsToday}</td>
                <td className="px-4 py-3"><Sparkline data={a.activityTrend} tone="cyan" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}