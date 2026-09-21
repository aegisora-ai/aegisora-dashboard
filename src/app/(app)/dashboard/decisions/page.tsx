import type { Metadata } from "next";
import { DecisionsTable } from "@/components/aegisora/decisions-table";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Decisions" };

export default function DecisionsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Decision ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every evaluated action, with the decision that governed its execution.
        </p>
      </header>
      <DecisionsTable rows={demoDecisions} />
    </div>
  );
}