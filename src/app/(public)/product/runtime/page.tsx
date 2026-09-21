import { RuntimeSimulator } from "@/components/aegisora/runtime-simulator";
import { CtaBand, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Runtime",
  "The Aegisora runtime evaluates each proposed agent action through context, policy and risk, then enforces the decision at the execution boundary.",
);

const components = [
  ["Request validation", "Checks that an incoming request is well-formed before evaluation."],
  ["Context analyzer", "Resolves workspace, identity and environment for the request."],
  ["Security engine", "Analyzes the request for security conditions."],
  ["Policy engine", "Evaluates the applicable policy."],
  ["Permission engine", "Checks access and authorization."],
  ["Risk analysis", "Assesses risk as LOW, MEDIUM, HIGH or CRITICAL."],
  ["Decision engine", "Resolves ALLOW, BLOCK or ESCALATE."],
  ["Approval engine", "Holds escalated actions for human resolution."],
  ["Enforcement gate", "Opens, stops or pauses execution according to the decision."],
  ["Provider execution gateway", "Carries permitted actions to the target provider."],
  ["Evidence bridge", "Records evidence for each decision."],
  ["Enterprise audit bridge", "Writes the audit record for the workspace."],
];

export default function RuntimePage() {
  return (
    <>
      <PageHero
        eyebrow="PRODUCT / RUNTIME"
        title="Model output is not execution authority."
        lead="An agent being able to propose an action does not mean the action should run. The runtime creates an explicit decision boundary between what an agent proposes and what reaches your environment."
      />

      <Section eyebrow="WATCH IT RESOLVE" title="One request, three possible outcomes.">
        <RuntimeSimulator />
      </Section>

      <Section tone="tinted" eyebrow="CONCEPTUAL COMPONENTS" title="What sits inside the boundary.">
        <dl className="aeg-panel grid gap-px overflow-hidden bg-border md:grid-cols-2">
          {components.map(([name, body]) => (
            <div key={name} className="bg-surface-2 p-5">
              <dt className="text-sm font-medium">{name}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <CtaBand title="Put the boundary between intent and execution." />
    </>
  );
}