import { CodeBlock } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Documentation",
  "How Aegisora integrates at the execution boundary: policy, evaluation, enforcement and evidence.",
);

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">Introduction</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Aegisora is an execution-control and runtime-governance system for autonomous AI agents. It sits
        between what an agent proposes and what actually runs in your environment.
      </p>
      <h2 className="mt-12 text-2xl font-medium">Why an execution boundary</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        An agent being able to propose an action does not mean the action should execute. Aegisora
        evaluates each request against context, policy and risk, then resolves ALLOW, BLOCK or ESCALATE.
      </p>
      <div className="mt-8">
        <CodeBlock
          code={`agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`}
          caption="Illustrative policy expression."
        />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        A full SDK and API reference is not published on this site yet.
      </p>
    </div>
  );
}