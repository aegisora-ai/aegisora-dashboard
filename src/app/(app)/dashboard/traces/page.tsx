import Link from "next/link";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { demoTraces } from "@/lib/demo-traces";

export const metadata: Metadata = { title: "Traces" };

export default function TracesPage() {
  const avgMs = Math.round(demoTraces.reduce((s, t) => s + t.durationMs, 0) / demoTraces.length);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Traces</h1>
          <p className="mt-1 text-sm text-muted-foreground">End-to-end execution traces, stage by stage.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Traces</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{demoTraces.length}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg duration</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{avgMs}<span className="text-base text-muted-foreground"> ms</span></div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Stages tracked</div>
          <div className="mt-2 text-3xl font-light tabular-nums">8</div>
        </div>
      </section>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Trace ID</th>
              <th className="px-4 py-3 font-medium">Agent / Action</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Started (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {demoTraces.map((t) => (
              <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/traces/${t.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{t.id}</Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{t.agent} / {t.action}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.environment}</td>
                <td className="px-4 py-3"><DecisionBadge state={t.outcome} /></td>
                <td className="px-4 py-3 font-mono text-xs">{t.durationMs} ms</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{t.startedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}