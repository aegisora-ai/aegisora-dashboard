import Link from "next/link";
import type { Metadata } from "next";
import { RiskIndicator } from "@/components/aegisora/state-badge";
import { demoIncidents } from "@/lib/demo-incidents";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Incidents" };

const statusTone: Record<string, string> = {
  OPEN: "text-block",
  INVESTIGATING: "text-escalate",
  RESOLVED: "text-allow",
};

export default function IncidentsPage() {
  const open = demoIncidents.filter((i) => i.status !== "RESOLVED").length;
  const rows = [...demoIncidents].sort((a, b) => Number(a.status === "RESOLVED") - Number(b.status === "RESOLVED"));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Incidents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Patterns and anomalies surfaced from runtime decisions.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{demoIncidents.length}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Open / investigating</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-escalate">{open}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Resolved</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-allow">{demoIncidents.length - open}</div>
        </div>
      </section>

      <ul className="aeg-panel divide-y divide-border">
        {rows.map((i) => (
          <li key={i.id}>
            <Link href={`/dashboard/incidents/${i.id}`} className={cn("block px-5 py-4 transition-colors hover:bg-surface-3", i.status !== "RESOLVED" && "border-l-2 border-block")}>
              <div className="flex flex-wrap items-center gap-3">
                <RiskIndicator level={i.severity} />
                <span className={cn("font-mono text-[11px] tracking-wider", statusTone[i.status])}>{i.status}</span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">{i.id}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{i.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{i.summary}</p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">{i.agent} / opened {i.openedAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}