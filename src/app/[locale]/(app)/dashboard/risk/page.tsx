import type { Metadata } from "next";
import { RiskIndicator } from "@/components/aegisora/state-badge";
import { RiskTrendChart, RiskDistributionChart, TopAgentsRiskChart } from "@/components/aegisora/risk-charts";

export const metadata: Metadata = { title: "Risk Intelligence" };

export default function RiskPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Risk Evaluation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contextual risk assigned to proposed actions before decision.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="aeg-panel p-5"><RiskIndicator level="CRITICAL" /><div className="mt-3 text-2xl font-light">0</div></div>
        <div className="aeg-panel p-5"><RiskIndicator level="HIGH" /><div className="mt-3 text-2xl font-light">12</div></div>
        <div className="aeg-panel p-5"><RiskIndicator level="MEDIUM" /><div className="mt-3 text-2xl font-light">48</div></div>
        <div className="aeg-panel p-5"><RiskIndicator level="LOW" /><div className="mt-3 text-2xl font-light">892</div></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="aeg-panel p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-foreground">Risk Volume &mdash; Last 7 Days</h2>
          <p className="mt-1 text-xs text-muted-foreground">Stacked by severity level, evaluated per proposed action.</p>
          <div className="mt-4"><RiskTrendChart /></div>
        </div>
        <div className="aeg-panel p-6">
          <h2 className="text-sm font-medium text-foreground">Distribution by Severity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Share of all evaluated actions this month.</p>
          <div className="mt-4"><RiskDistributionChart /></div>
        </div>
      </div>

      <div className="aeg-panel p-6">
        <h2 className="text-sm font-medium text-foreground">Highest-Risk Agents</h2>
        <p className="mt-1 text-xs text-muted-foreground">Composite risk score (0&ndash;100) by agent, last 30 days.</p>
        <div className="mt-4"><TopAgentsRiskChart /></div>
      </div>
    </div>
  );
}