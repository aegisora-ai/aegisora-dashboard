"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, PageHeader, Panel, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import { DecisionList, Field, JsonBlock, RecordView, useRecord, useRows } from "@/components/aegisora/live/detail";

function Inner({ wsId, id }: { wsId: string; id: string }) {
  const state = useRecord("policies", wsId, id);
  const related = useRows("decisions", wsId, "policy_id", id);
  return (
    <RecordView state={state} backHref="/dashboard/policies" backLabel="Policies">
      {(p) => (
        <>
          <PageHeader title={`${p.name} (v${p.version})`} description={`${p.scope ?? "workspace"} policy, mode ${p.mode ?? "ENFORCED"}, priority ${p.priority}`} actions={<Badge value={p.decision} />} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Panel>
              <h2 className="mb-3 text-sm font-medium">Details</h2>
              <dl>
                <Field k="ID" v={p.id} mono />
                <Field k="Enabled" v={p.enabled ? "Yes" : "No"} />
                <Field k="Action pattern" v={p.action_pattern} mono />
                <Field k="Resource pattern" v={p.resource_pattern} mono />
                <Field k="Applies to" v={p.agent_id ? <Link href={`/dashboard/agents/${p.agent_id}`} className="text-cyan underline-offset-4 hover:underline">{String(p.agent_id)}</Link> : "All agents"} mono />
                <Field k="Created" v={fmt(p.created_at)} />
                <Field k="Updated" v={fmt(p.updated_at)} />
              </dl>
              <h3 className="mb-2 mt-5 text-[11px] uppercase tracking-wider text-muted-foreground">Conditions</h3>
              <JsonBlock value={p.conditions} />
            </Panel>
            <Panel>
              <h2 className="mb-3 text-sm font-medium">Related decisions</h2>
              <DecisionList rows={related} />
            </Panel>
          </div>
        </>
      )}
    </RecordView>
  );
}

export default function PolicyDetailPage() {
  const { policyId } = useParams<{ policyId: string }>();
  return <WorkspaceGate>{(ws) => <Inner wsId={ws.id} id={String(policyId)} />}</WorkspaceGate>;
}