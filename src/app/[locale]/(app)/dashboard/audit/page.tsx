"use client";

import { LiveTable } from "@/components/aegisora/live/live-table";
import { fmt } from "@/components/aegisora/live/ui";

export default function AuditPage() {
  return (
    <LiveTable
      table="audit_events"
      title="Audit"
      description="Who or what changed the system, and every runtime decision."
      limit={200}
      columns={[
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Actor", render: (r) => <span className="font-mono text-xs">{String(r.actor).slice(0, 24)}</span> },
        { label: "Action", render: (r) => r.action },
        { label: "Target", render: (r) => <span className="text-muted-foreground">{r.target_type}</span> },
      ]}
      empty={{ title: "No audit events yet", body: "Changes to agents, policies, keys and approvals, plus every decision, are recorded here automatically." }}
    />
  );
}