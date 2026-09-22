import type { Metadata } from "next";

export const metadata: Metadata = { title: "Incidents" };

export default function IncidentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Incidents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Security alerts and threshold violations.</p>
      </header>
      <div className="aeg-panel px-5 py-8 text-sm text-muted-foreground">No active incidents in this workspace.</div>
    </div>
  );
}