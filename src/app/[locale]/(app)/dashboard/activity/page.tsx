"use client";

import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, fmt } from "@/components/aegisora/live/ui";

export default function ActivityPage() {
  return (
    <LiveTable
      table="decisions"
      title="Live Activity"
      description="Streams new decisions in real time."
      limit={50}
      realtime
      columns={[
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Agent", render: (r) => r.agent_name },
        { label: "Action", render: (r) => <span className="font-mono text-xs">{r.action}</span> },
        { label: "Resource", render: (r) => <span className="text-muted-foreground">{r.resource || "-"}</span> },
        { label: "Decision", render: (r) => <Badge value={r.effect} /> },
      ]}
      empty={{ title: "Waiting for the first action", body: "This view updates live. Send a test action from your agent or with curl and it will appear here instantly." }}
    />
  );
}