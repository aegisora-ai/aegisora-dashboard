import Link from "next/link";
import type { Metadata } from "next";
import { DecisionsTable } from "@/components/aegisora/decisions-table";
import { demoDecisions } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const pending = demoDecisions.filter((d) => d.approval?.status === "PENDING");

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Runtime decisions and pending authorizations in this workspace.
        </p>
      </header>

      <section aria-labelledby="pending-heading" className="space-y-3">
        <h2 id="pending-heading" className="text-sm font-medium">
          Pending approvals ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-md border border-border bg-surface-2 px-4 py-6 text-sm text-muted-foreground">
            No actions are waiting for authorization.
          </p>
        ) : (
          <DecisionsTable rows={pending} />
        )}
      </section>

      <section aria-labelledby="recent-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-heading" className="text-sm font-medium">
            Recent decisions
          </h2>
          <Link
            href="/dashboard/decisions"
            className="text-xs text-cyan underline-offset-4 hover:underline"
          >
            View decision ledger
          </Link>
        </div>
        <DecisionsTable rows={demoDecisions} />
      </section>
    </div>
  );
}