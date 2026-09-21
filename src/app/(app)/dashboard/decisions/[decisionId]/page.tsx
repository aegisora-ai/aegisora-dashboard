import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ApprovalBadge,
  DecisionBadge,
  RiskIndicator,
} from "@/components/aegisora/state-badge";
import { getDecision, type DemoDecision } from "@/lib/demo-data";

type Props = { params: Promise<{ decisionId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { decisionId } = await params;
  return { title: `Decision ${decisionId}` };
}

type Stage = {
  label: string;
  summary: string;
  fields: [string, string][];
};

function stagesFor(d: DemoDecision): Stage[] {
  return [
    {
      label: "REQUEST",
      summary: "The agent proposed an action.",
      fields: [
        ["Agent", d.agent],
        ["Action", d.action],
        ["Target", d.target],
        ["Requested at", d.timestamp],
      ],
    },
    {
      label: "CONTEXT",
      summary: "The request was resolved against its workspace and environment.",
      fields: [
        ["Workspace", d.workspace],
        ["Environment", d.environment],
      ],
    },
    {
      label: "POLICY",
      summary: "The applicable policy was evaluated.",
      fields: [
        ["Policy", d.policy],
        ["Version", d.policyVersion],
      ],
    },
    {
      label: "RISK",
      summary: "Risk was assessed from the action and its context.",
      fields: [["Factors", d.riskFactors.join("; ")]],
    },
    {
      label: "DECISION",
      summary: "The execution boundary issued a decision.",
      fields: [["Reason", d.reason]],
    },
    {
      label: "ENFORCEMENT",
      summary: "The decision was applied at the execution gate.",
      fields: [["Result", d.enforcement]],
    },
    {
      label: "EXECUTION",
      summary: "The outcome in the target environment.",
      fields: [["Status", d.execution]],
    },
    {
      label: "EVIDENCE",
      summary: "A record of the decision was produced.",
      fields: [
        ["Evidence ID", d.evidenceId],
        ["Audit ID", d.auditId],
      ],
    },
  ];
}

function Field({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={mono ? "break-all font-mono text-xs" : ""}>{v}</dd>
    </div>
  );
}

export default async function DecisionInspectorPage({ params }: Props) {
  const { decisionId } = await params;
  const d = getDecision(decisionId);
  if (!d) notFound();

  const stages = stagesFor(d);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/dashboard/decisions" className="hover:text-foreground">
          Decisions
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-foreground">{d.id}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Decision inspector</h1>
        <DecisionBadge state={d.state} />
        <RiskIndicator level={d.risk} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ol className="relative space-y-0 border-l border-border pl-8">
          {stages.map((s, i) => (
            <li key={s.label} className="relative pb-8 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[41px] top-0.5 flex size-5 items-center justify-center rounded-sm border border-border bg-surface-3 font-mono text-[10px] text-muted-foreground"
              >
                {i + 1}
              </span>
              <h2 className="font-mono text-xs font-semibold tracking-[0.2em]">
                {s.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
              <dl className="mt-3 rounded-md border border-border bg-surface-2 px-4 py-2">
                {s.fields.map(([k, v]) => (
                  <Field key={k} k={k} v={v} />
                ))}
                {s.label === "DECISION" && (
                  <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5 text-sm">
                    <dt className="text-muted-foreground">Outcome</dt>
                    <dd>
                      <DecisionBadge state={d.state} />
                    </dd>
                  </div>
                )}
                {s.label === "DECISION" && d.approval && (
                  <>
                    <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5 text-sm">
                      <dt className="text-muted-foreground">Approval</dt>
                      <dd className="flex items-center gap-3">
                        <ApprovalBadge status={d.approval.status} />
                        <span className="font-mono text-xs">{d.approval.id}</span>
                      </dd>
                    </div>
                    <Field k="Required" v={d.approval.requiredRole} mono />
                  </>
                )}
              </dl>
            </li>
          ))}
        </ol>

        <aside aria-label="Record identifiers" className="h-fit rounded-md border border-border bg-surface-2 p-4">
          <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Identifiers
          </h2>
          <dl>
            <Field k="Decision" v={d.id} mono />
            <Field k="Trace" v={d.traceId} mono />
            <Field k="Execution" v={d.executionId} mono />
            <Field k="Evidence" v={d.evidenceId} mono />
            <Field k="Audit" v={d.auditId} mono />
            <Field k="Workspace" v={d.workspace} mono />
          </dl>
        </aside>
      </div>
    </div>
  );
}