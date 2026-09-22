import type { Metadata } from "next";

export const metadata: Metadata = { title: "Execution Traces" };

export default function TracesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Traces</h1>
        <p className="mt-1 text-sm text-muted-foreground">End-to-end execution paths linked to decisions.</p>
      </header>
      <div className="aeg-panel px-5 py-8 text-sm text-muted-foreground">Connect a telemetry provider to view full trace spans.</div>
    </div>
  );
}