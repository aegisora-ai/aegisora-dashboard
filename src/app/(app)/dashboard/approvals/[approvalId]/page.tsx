import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApprovalResolver } from "@/components/aegisora/approval-resolver";
import { RiskIndicator } from "@/components/aegisora/state-badge";
import { getApproval } from "@/lib/demo-approvals";

type Props = { params: Promise<{ approvalId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { approvalId } = await params;
  return { title: `Approval ${approvalId}` };
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-words font-mono text-xs">{children}</dd>
    </div>
  );
}

export default async function ApprovalDetailPage({ params }: Props) {
  const { approvalId } = await params;
  const a = getApproval(approvalId);
  if (!a) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Approval request</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{a.id}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="request-title" className="aeg-panel p-5">
          <h2 id="request-title" className="text-sm font-medium">What is being requested</h2>
          <dl className="mt-3 divide-y divide-border/60">
            <Row k="Agent">{a.agent}</Row>
            <Row k="Action">{a.action}</Row>
            <Row k="Target">{a.target}</Row>
            <Row k="Environment">{a.environment}</Row>
            <Row k="Policy">{a.policy}</Row>
            <Row k="Risk"><RiskIndicator level={a.risk} /></Row>
            <Row k="Why flagged">{a.reason}</Row>
            <Row k="Requested">{a.requestedAt}</Row>
            <Row k="Approver needs">{a.requiredPermission}</Row>
            <Row k="Decision record">
              {a.decisionId ? (
                <Link href={`/dashboard/decisions/${a.decisionId}`} className="text-cyan underline-offset-4 hover:underline">{a.decisionId}</Link>
              ) : (
                "not included in this sample"
              )}
            </Row>
            <Row k="Evidence">{a.evidenceId ?? "not included in this sample"}</Row>
          </dl>
        </section>

        <ApprovalResolver
          initialStatus={a.status}
          initialResolution={a.resolution}
          initialResolvedAt={a.resolvedAt}
          requiredPermission={a.requiredPermission}
        />
      </div>
    </div>
  );
}