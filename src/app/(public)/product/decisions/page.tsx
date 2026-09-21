import Link from "next/link";
import { CtaBand, KV, PageHero, Section } from "@/components/aegisora/page-kit";
import { DecisionBadge, RiskIndicator } from "@/components/aegisora/state-badge";
import { demoDecisions } from "@/lib/demo-data";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Decisions",
  "The Aegisora decision inspector shows the request, context, policy, risk, decision, enforcement and evidence behind every evaluated action.",
);

export default function DecisionsPage() {
  const d = demoDecisions[0];
  return (
    <>
      <PageHero
        eyebrow="PRODUCT / DECISIONS"
        title="Every action has a decision, and every decision has a reason."
        lead="The decision inspector shows what was requested, under which policy, at what risk, what was decided, and what happened at the execution gate."
      />

      <Section eyebrow="DECISION INSPECTOR" title="A record an operator can act on.">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 text-muted-foreground">
            <p>
              Each decision links its request, context, policy, risk, outcome, enforcement result and
              evidence. The chain stays inspectable after the action has run, or after it was stopped.
            </p>
            <p>
              The record on the right is a sample.{" "}
              <Link href={`/dashboard/decisions/${d.id}`} className="text-cyan underline-offset-4 hover:underline">
                Open it in the inspector.
              </Link>
            </p>
          </div>
          <div className="aeg-panel p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <DecisionBadge state={d.state} />
              <RiskIndicator level={d.risk} />
            </div>
            <KV
              rows={[
                ["Decision ID", d.id],
                ["Agent", d.agent],
                ["Action", d.action],
                ["Environment", d.environment],
                ["Policy", `${d.policy}-${d.policyVersion}`],
                ["Reason", d.reason],
                ["Timestamp", d.timestamp],
                ["Trace ID", d.traceId],
                ["Execution", d.execution],
              ]}
            />
          </div>
        </div>
      </Section>

      <CtaBand title="See why, not just what." />
    </>
  );
}