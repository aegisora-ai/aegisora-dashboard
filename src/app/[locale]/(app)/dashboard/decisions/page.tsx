"use client";

import { LiveTable } from "@/components/aegisora/live/live-table";
import Link from "next/link";
import { Badge, btnGhost, fmt } from "@/components/aegisora/live/ui";

export default function DecisionsPage() {
  return (
    <LiveTable
      table="decisions"
      title="Decisions"
      description="Every action your agents attempted and what governance decided. Click a row for the full record."
      limit={200}
      columns={[
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Agent", render: (r) => r.agent_name },
        { label: "Action", render: (r) => <span className="font-mono text-xs">{r.action}</span> },
        { label: "Decision", render: (r) => <Badge value={r.decision ?? r.effect} /> },
        { label: "Reason", render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
      ]}
      actions={(r) => <Link href={`/dashboard/decisions/${r.id}`} className={btnGhost}>Open</Link>}
      empty={{ title: "No decisions yet", body: "Decisions appear as soon as an agent calls POST /api/v1/evaluate. Create an API key, then use the quickstart on the Agents page." }}
    />
  );
}