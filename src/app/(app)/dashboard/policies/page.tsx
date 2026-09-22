import type { Metadata } from "next";
import { DataTable } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Policies" };

const policies = [
  ["transfer-threshold-v4", "Finance", "Enforces human approval for transfers > $10k", "Enforcing"],
  ["access-change-control-v1", "Platform", "Blocks destructive IAM actions in production", "Enforcing"],
  ["read-only-v2", "Support", "Restricts agents to GET/LIST operations only", "Audit Mode"],
];

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Policies</h1>
        <p className="mt-1 text-sm text-muted-foreground">Executable governance controls mapped to agents.</p>
      </header>
      <DataTable head={["Policy Version", "Scope", "Description", "Mode"]} rows={policies} mono={[0]} />
    </div>
  );
}