import Link from "next/link";
import { CtaBand, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Approvals",
  "High-risk agent actions can escalate to a human approver. Execution pauses until the approval is approved, rejected or expires.",
);

const seen = [
  "Which agent requested the action",
  "What action was proposed",
  "Why it was flagged",
  "The risk level",
  "The policy involved",
  "The workspace context",
  "Who is allowed to approve",
  "How the resolution links to evidence",
];

export default function ApprovalsPage() {
  return (
    <>
      <PageHero
        eyebrow="PRODUCT / APPROVALS"
        title="Human approval is a control boundary, not a notification."
        lead="When an action cannot proceed automatically, execution pauses and the authorization context is routed to an authorized person."
      />

      <Section eyebrow="STATE" title="From escalation to resolution.">
        <ol className="aeg-panel grid gap-px overflow-hidden bg-border font-mono text-xs tracking-wider md:grid-cols-[1fr_1fr_1.4fr]">
          <li className="bg-surface-2 px-5 py-4 text-escalate">ESCALATE</li>
          <li className="bg-surface-2 px-5 py-4 text-escalate">PENDING APPROVAL</li>
          <li className="grid grid-cols-3 gap-px bg-border">
            <span className="bg-surface-2 px-5 py-4 text-allow">APPROVED</span>
            <span className="bg-surface-2 px-5 py-4 text-block">REJECTED</span>
            <span className="bg-surface-2 px-5 py-4 text-muted-foreground">EXPIRED</span>
          </li>
        </ol>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Execution stays paused while an approval is pending. Only an approved resolution releases the action.
        </p>
      </Section>

      <Section tone="tinted" eyebrow="THE APPROVER SEES" title="Enough context to make a real decision.">
        <ul className="aeg-panel grid gap-px overflow-hidden bg-border sm:grid-cols-2">
          {seen.map((s) => (
            <li key={s} className="bg-surface-2 px-5 py-3.5 text-sm">{s}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/dashboard/approvals" className="text-cyan underline-offset-4 hover:underline">
            Try the sample approval queue
          </Link>
        </p>
      </Section>

      <CtaBand title="Keep a person in the loop where it matters." />
    </>
  );
}