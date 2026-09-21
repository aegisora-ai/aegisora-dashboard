import { CodeBlock, CtaBand, PageHero, Section, Steps } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Developers",
  "Integrate Aegisora at the execution boundary: define policy, evaluate requests, enforce decisions and inspect evidence.",
);

export default function DevelopersPage() {
  return (
    <>
      <PageHero
        eyebrow="DEVELOPERS"
        title="Integrate at the execution boundary."
        lead="Aegisora is developed as an open-source engineering product, so you can understand how decisions are made and work with the underlying runtime."
      />

      <Section eyebrow="THE LOOP" title="Five steps from agent to evidence.">
        <Steps
          cols={5}
          items={[
            ["Integrate", "Route an agent's proposed actions through the Aegisora runtime before they execute."],
            ["Define policy", "Describe which agents may perform which actions, in which environments."],
            ["Evaluate", "Each request is evaluated against context, policy and risk."],
            ["Enforce", "The execution gate opens, stops or pauses according to the decision."],
            ["Inspect", "Every decision leaves a trace and evidence you can inspect."],
          ]}
        />
      </Section>

      <Section tone="tinted" eyebrow="POLICY" title="Start from a policy you can read.">
        <CodeBlock
          code={`agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`}
          caption="Illustrative policy expression. Not an API reference."
        />
      </Section>

      <Section eyebrow="DOCUMENTATION" title="SDK and API reference">
        <p className="max-w-2xl text-muted-foreground">
          SDK usage, API details and code samples are not published on this site yet. This page describes
          the integration model only and makes no guarantees about interfaces that are not documented.
        </p>
      </Section>

      <CtaBand title="Test the boundary in a workspace." />
    </>
  );
}