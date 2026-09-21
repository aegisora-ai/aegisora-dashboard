import type { Metadata } from "next";
import { RiskTrendChart, SeverityBreakdownChart } from "@/components/aegisora/charts";
import { RiskIndicator } from "@/components/aegisora/state-badge";
import { riskByAgent, riskTrend } from "@/lib/demo-risk";

export const metadata: Metadata = { title: "Risk" };

export default function RiskPage() {
  const latest = riskTrend[riskTrend.length - 1];
  const kpis = [
    { label: "Low (latest day)", value: latest.low, tone: "text-allow" },
    { label: "Medium (latest day)", value: latest.medium, tone: "" },
    { label: "High (latest day)", value: latest.high, tone: "text-escalate" },
    { label: "Critical (latest day)", value: latest.critical, tone: "text-block" },
  ];

  const severityTotals = [
    { name: "LOW", value: riskTrend.reduce((s, d) => s + d.low, 0), color: "var(--allow)" },
    { name: "MEDIUM", value: riskTrend.reduce((s, d) => s + d.medium, 0), color: "var(--cyan)" },
    { name: "HIGH", value: riskTrend.reduce((s, d) => s + d.high, 0), color: "var(--escalate)" },
    { name: "CRITICAL", value: riskTrend.reduce((s, d) => s + d.critical, 0), color: "var(--block)" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Risk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Risk levels assessed across evaluated requests, over the last 12 days.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface-2 p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className={`mt-2 text-3xl font-light tabular-nums ${k.tone}`}>{k.value}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="trend-title" className="aeg-panel p-5">
          <h2 id="trend-title" className="text-sm font-medium">Risk level over time</h2>
          <div className="mt-4">
            <RiskTrendChart data={riskTrend} />
          </div>
        </section>

        <section aria-labelledby="dist-title" className="aeg-panel p-5">
          <h2 id="dist-title" className="text-sm font-medium">Distribution (12-day total)</h2>
          <div className="mt-4">
            <SeverityBreakdownChart data={severityTotals} />
          </div>
        </section>
      </div>

      <section aria-labelledby="by-agent-title">
        <h2 id="by-agent-title" className="mb-3 text-sm font-medium">Risk by agent</h2>
        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Low</th>
                <th className="px-4 py-3 font-medium">Medium</th>
                <th className="px-4 py-3 font-medium">High</th>
                <th className="px-4 py-3 font-medium">Critical</th>
                <th className="px-4 py-3 font-medium">Highest observed</th>
              </tr>
            </thead>
            <tbody>
              {riskByAgent.map((r) => {
                const highest = r.critical > 0 ? "CRITICAL" : r.high > 0 ? "HIGH" : r.medium > 0 ? "MEDIUM" : "LOW";
                return (
                  <tr key={r.agent} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                    <td className="px-4 py-3 font-mono text-xs">{r.agent}</td>
                    <td className="px-4 py-3 font-mono text-xs text-allow">{r.low}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.medium}</td>
                    <td className="px-4 py-3 font-mono text-xs text-escalate">{r.high}</td>
                    <td className="px-4 py-3 font-mono text-xs text-block">{r.critical}</td>
                    <td className="px-4 py-3"><RiskIndicator level={highest as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}