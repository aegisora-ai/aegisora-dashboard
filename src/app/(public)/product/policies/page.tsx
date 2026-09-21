import { CodeBlock, CtaBand, DataTable, PageHero, Section, Steps } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Policies",
  "Aegisora policies are executable governance controls that define which agent may perform which action, in which environment, and what happens at a threshold.",
);

export default function PoliciesPage() {
  return (
    <>
      <PageHero
        eyebrow="PRODUCT / POLICIES"
        title="Policies are executable governance controls."
        lead="A policy states which agent may perform which action, in which environment, and what the execution boundary should do when a condition is reached."
      />

      <Section eyebrow="A POLICY EXPRESSION" title="Readable by engineers and reviewers alike.">
        <div className="grid gap-8 md:grid-cols-2">
          <CodeBlock
            code={`agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`}
            caption="Illustrative policy expression."
          />
          <DataTable
            head={["Field", "Meaning"]}
            rows={[
              ["agent", "The agent the rule applies to."],
              ["action", "The proposed action, such as external_transfer."],
              ["environment", "Where the action would run, such as production."],
              ["threshold", "The condition that raises the rule, such as elevated."],
              ["decision", "The outcome when the rule matches: ALLOW, BLOCK or ESCALATE."],
            ]}
            mono={[0]}
          />
        </div>
      </Section>

      <Section tone="tinted" eyebrow="RESOLUTION" title="From a matched rule to an enforced decision.">
        <Steps
          cols={4}
          items={[
            ["Match", "The request is matched to the rule by agent and action."],
            ["Condition", "Environment and threshold are checked."],
            ["Risk", "Risk resolves from the action and its context."],
            ["Decision", "ESCALATE pauses execution and creates a pending approval."],
          ]}
        />
      </Section>

      <Section eyebrow="VERSIONS AND BINDINGS" title="Governance that can be reviewed.">
        <p className="max-w-2xl text-muted-foreground">
          Policies are versioned, for example transfer-threshold-v4, so a decision can be traced back to the
          exact policy version that produced it. Bindings connect a policy to the agents it governs.
        </p>
      </Section>

      <CtaBand title="Define what your agents may execute." />
    </>
  );
}