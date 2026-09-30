import { CodeBlock, DataTable, Eyebrow, Steps } from "@/components/aegisora/page-kit";
import { V1Canvas, V2Canvas, V3Canvas } from "@/components/aegisora/version-canvas";
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

      <h2 id="why" className="mt-12 scroll-mt-24 text-2xl font-medium">Why an execution boundary</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        An agent being able to propose an action does not mean the action should execute. Aegisora
        evaluates each request against context, policy and risk, then resolves ALLOW, BLOCK or ESCALATE.
      </p>
      <div id="example" className="mt-8 scroll-mt-24">
        <CodeBlock
          code={`agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`}
          caption="Illustrative policy expression."
        />
      </div>

      <h2 className="mt-20 text-2xl font-medium">The product, version by version</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Aegisora did not start as a full runtime. Each release added a layer to the model, from a static
        rulebook to a closed-loop system with context, risk scoring and durable evidence.
      </p>

      <div id="v1" className="mt-14 scroll-mt-24 aeg-panel p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Eyebrow accent>VERSION 1.0 &middot; FOUNDATION</Eyebrow>
            <h3 className="mt-2 text-xl font-medium">The static rulebook</h3>
          </div>
          <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">
            ARCHIVED
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The first release matched every agent action against a fixed rulebook. A request either matched
          an allow-rule or it did not &mdash; there was no context, no scoring, no escalation path.
        </p>
        <div className="mt-6 overflow-x-auto"><V1Canvas /></div>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>&bull; Static YAML rulebooks, evaluated per action name</li>
          <li>&bull; Binary outcome: match or no match</li>
          <li>&bull; No environment or identity awareness</li>
          <li>&bull; Single-process deployment, no audit trail</li>
        </ul>
      </div>

      <div id="v2" className="mt-8 scroll-mt-24 aeg-panel p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Eyebrow accent>VERSION 2.0 &middot; CONTEXT &amp; RISK</Eyebrow>
            <h3 className="mt-2 text-xl font-medium">From rules to risk</h3>
          </div>
          <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground">
            MAINTAINED
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          2.0 introduced context gathering and a risk-scoring layer ahead of the policy check. The outcome
          stopped being binary: every request now resolves to ALLOW, BLOCK, or ESCALATE.
        </p>
        <div className="mt-6 overflow-x-auto"><V2Canvas /></div>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>&bull; Context resolution: identity, environment, workspace</li>
          <li>&bull; Weighted risk scoring ahead of policy evaluation</li>
          <li>&bull; Three-way decision: ALLOW / BLOCK / ESCALATE</li>
          <li>&bull; Basic decision logging (non-durable)</li>
        </ul>
      </div>

      <div id="v3" className="mt-8 scroll-mt-24 aeg-panel p-6 md:p-8 border-primary/30">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Eyebrow accent>VERSION 3.0 &middot; CURRENT</Eyebrow>
            <h3 className="mt-2 text-xl font-medium">The full runtime</h3>
          </div>
          <span className="rounded-full border border-allow bg-allow-muted px-3 py-1 font-mono text-[11px] font-semibold text-allow">
            CURRENT
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The current product is a closed-loop control plane. Eight stages carry every request from intent
          to consequence, and every decision writes durable, queryable evidence that feeds back into risk.
        </p>
        <div className="mt-6 overflow-x-auto"><V3Canvas /></div>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>&bull; Eight-stage pipeline: request through evidence</li>
          <li>&bull; Runtime-level enforcement, not advisory-only</li>
          <li>&bull; Durable, queryable evidence store</li>
          <li>&bull; Evidence feeds back into risk scoring (closed loop)</li>
          <li>&bull; Organized by workspace and role</li>
          <li>&bull; Approvals, incidents and webhooks as first-class objects</li>
        </ul>
      </div>

      <h2 id="capability" className="mt-20 scroll-mt-24 text-2xl font-medium">Capability by version</h2>
      <div className="mt-6">
        <DataTable
          head={["Capability", "1.0", "2.0", "3.0"]}
          rows={[
            ["Rule-based matching", "Yes", "Yes", "Yes"],
            ["Context resolution", "&mdash;", "Yes", "Yes"],
            ["Risk scoring", "&mdash;", "Yes", "Weighted + adaptive"],
            ["Decision outcomes", "Allow / Deny", "Allow / Block / Escalate", "Allow / Block / Escalate"],
            ["Runtime enforcement", "&mdash;", "Advisory only", "Yes, at execution boundary"],
            ["Evidence store", "&mdash;", "Non-durable log", "Durable, queryable"],
            ["Feedback into risk model", "&mdash;", "&mdash;", "Yes"],
            ["Workspace / role model", "&mdash;", "&mdash;", "Yes"],
          ]}
        />
      </div>

      <h2 className="mt-20 text-2xl font-medium">Core concepts</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Four ideas carry the current model. Each stage in the pipeline exists to serve one of them.
      </p>
      <div className="mt-8">
        <Steps
          cols={4}
          items={[
            ["Policy", "Declarative rules scoped by agent, action, environment and workspace."],
            ["Risk", "A weighted score assembled from context, action sensitivity and evidence."],
            ["Enforcement", "The decision is applied at the runtime boundary itself."],
            ["Evidence", "Every decision and its inputs are written durably and are queryable."],
          ]}
        />
      </div>

      <h2 id="api" className="mt-20 scroll-mt-24 text-2xl font-medium">Integration surface</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Aegisora sits in front of tool and API calls your agents already make, without requiring a rewrite.
      </p>
      <div className="mt-8">
        <CodeBlock
          code={`POST /v1/evaluate
{
  "agent": "customer-support-bot",
  "action": "stripe_refund_api",
  "environment": "production",
  "context": { "workspace": "billing", "amount_usd": 480 }
}

# Response
{
  "decision": "ESCALATE",
  "risk_score": 0.71,
  "policy_id": "pol_refund_threshold",
  "evidence_id": "ev_9f21ac"
}`}
          caption="Simplified evaluate/decide contract used by the current runtime."
        />
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        A full SDK and API reference is not published on this site yet.
      </p>
    </div>
  );
}