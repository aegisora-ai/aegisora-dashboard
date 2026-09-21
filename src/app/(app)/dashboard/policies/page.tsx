import Link from "next/link";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { demoPolicies } from "@/lib/demo-policies";

export const metadata: Metadata = { title: "Policies" };

export default function PoliciesPage() {
  const totalMatches = demoPolicies.reduce((s, p) => s + p.matchesToday, 0);
  const blockCount = demoPolicies.filter((p) => p.decision === "BLOCK").length;
  const escalateCount = demoPolicies.filter((p) => p.decision === "ESCALATE").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Active policy versions evaluated against agent requests.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total policies</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{demoPolicies.length}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Matches today</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{totalMatches}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Block policies</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-block">{blockCount}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Escalate policies</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-escalate">{escalateCount}</div>
        </div>
      </section>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Policy</th>
              <th className="px-4 py-3 font-medium">Agent / Action</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Decision</th>
              <th className="px-4 py-3 font-medium">Matches today</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {demoPolicies.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/policies/${p.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{p.name}-{p.version}</Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.agent} / {p.action}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.environment}</td>
                <td className="px-4 py-3"><DecisionBadge state={p.decision} /></td>
                <td className="px-4 py-3 font-mono text-xs">{p.matchesToday}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}