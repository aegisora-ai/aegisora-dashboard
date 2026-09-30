"use client";

import { useParams } from "next/navigation";
import { Badge, PageHeader, Panel, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import { DecisionList, Field, JsonBlock, RecordView, useRecord, useRows } from "@/components/aegisora/live/detail";

function Inner({ wsId, id }: { wsId: string; id: string }) {
  const state = useRecord("agents", wsId, id);
  const decisions = useRows("decisions", wsId, "agent_id", id);
  return (
    <RecordView state={state} backHref="/dashboard/agents" backLabel="Agents">
      {(a) => (
        <>
          <PageHeader title={String(a.name)} description={a.description ? String(a.description) : "No description."} actions={<Badge value={a.state} />} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Panel>
              <h2 className="mb-3 text-sm font-medium">Details</h2>
              <dl>
                <Field k="ID" v={a.id} mono />
                <Field k="Framework" v={a.framework} />
                <Field k="Provider" v={a.provider} />
                <Field k="Model" v={a.model} />
                <Field k="Risk score" v={a.risk_score} />
                <Field k="Source" v={a.source} />
                <Field k="External ID" v={a.external_id} mono />
                <Field k="Last seen" v={a.last_seen_at ? fmt(a.last_seen_at) : null} />
                <Field k="Created" v={fmt(a.created_at)} />
              </dl>
              <h3 className="mb-2 mt-5 text-[11px] uppercase tracking-wider text-muted-foreground">Metadata</h3>
              <JsonBlock value={a.metadata} />
            </Panel>
            <Panel>
              <h2 className="mb-3 text-sm font-medium">Recent decisions</h2>
              <DecisionList rows={decisions} />
            </Panel>
          </div>
        </>
      )}
    </RecordView>
  );
}

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  return <WorkspaceGate>{(ws) => <Inner wsId={ws.id} id={String(agentId)} />}</WorkspaceGate>;
}