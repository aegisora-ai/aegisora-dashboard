import type { Metadata } from "next";
import { RiskIndicator } from "@/components/aegisora/state-badge";

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
    </div>
  );
}