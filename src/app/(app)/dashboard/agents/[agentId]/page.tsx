import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { Sparkline } from "@/components/aegisora/charts";
import { getAgent } from "@/lib/demo-agents";
import { demoDecisions } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ agentId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { agentId } = await params;
  return { title: `Agent ${agentId}` };
}

const statusTone: Record<string, string> = {
  ACTIVE: "text-allow",
  PAUSED: "text-escalate",
  DISABLED: "text-muted-foreground",
};

export default async function AgentDetailPage({ params }: Props) {
  const { agentId } = await params;
  const a = getAgent(agentId);
  if (!a) notFound();

  const recent = demoDecisions.filter((d) => d.agent === a.id).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/dashboard/agents" className="hover:text-foreground">Agents</Link> / {a.id}
          </p>
          <h1 className="mt-1 text-3xl font-light tracking-tight">{a.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{a.description}</p>
        </div>
        <span className={cn("font-mono text-[11px] tracking-wider", statusTone[a.status])}>{a.status}</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Requests today</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{a.requestsToday}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Allow rate</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{a.allowRate}%</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg risk score</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{a.avgRiskScore}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last active</div>
          <div className="mt-2 font-mono text-sm">{a.lastActive}</div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="meta-title" className="aeg-panel p-5">
          <h2 id="meta-title" className="text-sm font-medium">Details</h2>
          <dl className="mt-4 divide-y divide-border/60 border-t border-border">
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-mono text-xs">{a.owner}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Environment</dt>
              <dd className="font-mono text-xs">{a.environment}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-mono text-xs">{a.createdAt}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">12-point activity trend</div>
            <div className="mt-2"><Sparkline data={a.activityTrend} tone="cyan" /></div>
          </div>
        </section>

        <section aria-labelledby="recent-title" className="aeg-panel p-5">
          <h2 id="recent-title" className="text-sm font-medium">Recent decisions</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {recent.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No recent decisions for this agent.</li>}
            {recent.map((d) => (
              <li key={d.id}>
                <Link href={`/dashboard/decisions/${d.id}`} className="flex items-center gap-3 py-2.5 hover:text-foreground">
                  <span className="font-mono text-[11px] text-muted-foreground">{d.timestamp}</span>
                  <span className="font-mono text-xs">{d.action}</span>
                  <span className="ml-auto"><DecisionBadge state={d.state} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}