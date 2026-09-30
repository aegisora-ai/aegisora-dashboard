"use client";

import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, fmt } from "@/components/aegisora/live/ui";

export default function TracesPage() {
  return (
    <LiveTable
      table="traces"
      title="Traces"
      description="Execution paths linked to decisions. Send your own spans via POST /api/v1/traces. Click a row to see spans."
      limit={200}
      columns={[
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Agent", render: (r) => r.agent_name },
        { label: "Name", render: (r) => <span className="font-mono text-xs">{r.name}</span> },
        { label: "Status", render: (r) => <Badge value={r.status} /> },
        { label: "Duration", render: (r) => (r.duration_ms != null ? `${r.duration_ms} ms` : "-") },
        { label: "Spans", render: (r) => (Array.isArray(r.spans) ? r.spans.length : 0) },
      ]}
      empty={{ title: "No traces yet", body: "Every evaluated action creates a trace. To import traces from another system, POST spans to /api/v1/traces." }}
    />
  );
}