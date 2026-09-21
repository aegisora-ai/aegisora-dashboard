import Link from "next/link";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Live Activity" };

const eventFor = { ALLOW: "execution.allowed", BLOCK: "execution.blocked", ESCALATE: "approval.requested" } as const;

export default function ActivityPage() {
  const feed = [...demoDecisions].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Live activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">A rolling feed of runtime decisions as they are evaluated.</p>
        </div>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-cyan" />
          </span>
          SAMPLE FEED, NOT LIVE
        </span>
      </header>

      <ol className="aeg-panel divide-y divide-border">
        {feed.map((d) => (
          <li key={d.id}>
            <Link href={`/dashboard/decisions/${d.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-surface-3">
              <span className="font-mono text-[11px] text-muted-foreground">{d.timestamp}</span>
              <span className="font-mono text-xs">{eventFor[d.state]}</span>
              <span className="font-mono text-xs text-muted-foreground">{d.agent} &middot; {d.action}</span>
              <span className="ml-auto"><DecisionBadge state={d.state} /></span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}