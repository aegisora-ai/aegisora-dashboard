"use client";

import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, btnGhost, fmt } from "@/components/aegisora/live/ui";
import { confirmDialog, notify } from "@/components/aegisora/live/feedback";

export default function IncidentsPage() {
  return (
    <LiveTable
      table="incidents"
      title="Incidents"
      description="Blocked actions raise an incident (configurable in Settings)."
      realtime
      columns={[
        { label: "Time", render: (r) => fmt(r.created_at) },
        { label: "Severity", render: (r) => <Badge value={r.severity} /> },
        { label: "Title", render: (r) => r.title },
        { label: "Status", render: (r) => <Badge value={r.status} /> },
      ]}
      actions={(r, reload) =>
        r.status === "open" ? (
          <button
            className={btnGhost}
            onClick={async () => {
              const { error } = await createClient().from("incidents").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", r.id);
              if (error) notify(error.message, false); else notify("Incident resolved.");
              reload();
            }}
          >
            Resolve
          </button>
        ) : null
      }
      empty={{ title: "No incidents", body: "Nothing has been blocked yet. Incidents are created automatically when a policy blocks an action." }}
    />
  );
}