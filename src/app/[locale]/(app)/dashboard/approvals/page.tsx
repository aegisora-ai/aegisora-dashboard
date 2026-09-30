"use client";

import { createClient } from "@/lib/supabase/client";
import { LiveTable } from "@/components/aegisora/live/live-table";
import { Badge, btnGhost, fmt } from "@/components/aegisora/live/ui";

async function resolve(id: string, status: "approved" | "rejected", reload: () => void) {
  const { data, error } = await createClient().from("approvals").update({ status }).eq("id", id).eq("status", "pending").select("id");
  if (error) alert(error.message);
  else if (!data || data.length === 0) alert("Nothing changed. You may lack permission (owner, admin or analyst) or it was already resolved.");
  reload();
}

export default function ApprovalsPage() {
  return (
    <LiveTable
      table="approvals"
      title="Approvals"
      description="Escalated actions wait here. Execution stays paused until a human decides."
      realtime
      columns={[
        { label: "Requested", render: (r) => fmt(r.requested_at) },
        { label: "Agent", render: (r) => r.agent_name },
        { label: "Action", render: (r) => <span className="font-mono text-xs">{r.action}</span> },
        { label: "Status", render: (r) => <Badge value={r.status === "pending" && new Date(r.expires_at) < new Date() ? "expired" : r.status} /> },
        { label: "Expires", render: (r) => fmt(r.expires_at) },
      ]}
      actions={(r, reload) =>
        r.status === "pending" && new Date(r.expires_at) > new Date() ? (
          <div className="flex justify-end gap-2">
            <button className={btnGhost} onClick={() => void resolve(r.id, "approved", reload)}>Approve</button>
            <button className={btnGhost} onClick={() => void resolve(r.id, "rejected", reload)}>Reject</button>
          </div>
        ) : null
      }
      empty={{ title: "No approvals yet", body: "When a policy returns ESCALATE, the request appears here. Load the starter policies and send a payment.* action to try it." }}
    />
  );
}