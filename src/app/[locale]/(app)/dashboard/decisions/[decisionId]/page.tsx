"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, PageHeader, Panel, WorkspaceGate, fmt } from "@/components/aegisora/live/ui";
import { Field, JsonBlock, RecordView, dec, useRecord, useRows } from "@/components/aegisora/live/detail";

function Inner({ wsId, id }: { wsId: string; id: string }) {
  const state = useRecord("decisions", wsId, id);
  const evidence = useRows("evidence", wsId, "decision_id", id);
  return (
    <RecordView state={state} backHref="/dashboard/decisions" backLabel="Decisions">
      {(d) => (
        <>
          <PageHeader title={`${d.agent_name} / ${d.action}`} description={d.reason ? String(d.reason) : "No reason recorded."} actions={<Badge value={dec(d)} />} />
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Panel>
              <h2 className="mb-3 text-sm font-medium">Decision</h2>
              <dl>
                <Field k="Decision ID" v={d.id} mono />
                <Field k="Time" v={fmt(d.created_at)} />
                <Field k="Agent" v={d.agent_id ? <Link href={`/dashboard/agents/${d.agent_id}`} className="text-cyan underline-offset-4 hover:underline">{d.agent_name}</Link> : d.agent_name} />
                <Field k="Action" v={d.action} mono />
                <Field k="Resource" v={d.resource} mono />
                <Field k="Risk score" v={d.risk_score} />
                <Field k="Policy" v={d.policy_id ? <Link href={`/dashboard/policies/${d.policy_id}`} className="text-cyan underline-offset-4 hover:underline">{String(d.policy_id)}</Link> : "No policy matched (workspace default)"} mono />
                <Field k="Trace ID" v={d.trace_id} mono />
                <Field k="Execution ID" v={d.execution_id} mono />
              </dl>
            </Panel>
            <div className="space-y-6">
              <Panel>
                <h2 className="mb-3 text-sm font-medium">Input</h2>
                <JsonBlock value={d.input} />
              </Panel>
              <Panel>
                <h2 className="mb-3 text-sm font-medium">Evidence</h2>
                {evidence === null ? null : evidence.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No evidence record linked to this decision.</p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {evidence.map((e) => (
                      <li key={e.id} className="flex items-center gap-3 py-2 font-mono text-xs">
                        <span className="break-all">{String(e.id)}</span>
                        <span className="ml-auto text-muted-foreground">{fmt(e.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </RecordView>
  );
}

export default function DecisionDetailPage() {
  const { decisionId } = useParams<{ decisionId: string }>();
  return <WorkspaceGate>{(ws) => <Inner wsId={ws.id} id={String(decisionId)} />}</WorkspaceGate>;
}