import type { Metadata } from "next";
import { DataTable } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Agents" };

const agents = [
  ["finance-operator", "Finance Workspace", "transfer-threshold-v4", "Active", "2 mins ago"],
  ["ops-assistant", "Platform Engineering", "access-change-control-v1", "Active", "1 hour ago"],
  ["customer-support-bot", "Support", "read-only-v2", "Paused", "3 days ago"],
];

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Identities proposing actions at the boundary.</p>
      </header>
      <DataTable head={["Agent ID", "Workspace", "Bound Policy", "Status", "Last Request"]} rows={agents} mono={[0, 2]} />
    </div>
  );
}