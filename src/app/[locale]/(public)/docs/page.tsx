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
          <li>&bull; Caller-supplied risk value evaluated against policy conditions</li>
          <li>&bull; Three-way decision: ALLOW / BLOCK / ESCALATE</li>
          <li>&bull; Basic decision logging (non-durable)</li>
        </ul>
      </div>

      <div id="v3" className="mt-8 scroll-mt-24 aeg-panel p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Eyebrow accent>VERSION 3.0 &middot; ENTERPRISE GOVERNANCE RUNTIME</Eyebrow>
            <h3 className="mt-2 text-xl font-medium">The full runtime</h3>
          </div>
          <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
            PREVIOUS
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Version 3.0 introduced the closed-loop control plane. Eight stages carry every request from intent
          to consequence, and every decision writes durable, queryable evidence that feeds back into risk.
        </p>
        <div className="mt-6 overflow-x-auto"><V3Canvas /></div>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>&bull; Eight-stage pipeline: request through evidence</li>
          <li>&bull; Decision API called before your agent executes an action</li>
          <li>&bull; Durable, queryable evidence store</li>
          <li>&bull; Hash-chained evidence record for every decision</li>
          <li>&bull; Organized by workspace and role</li>
          <li>&bull; Approvals, incidents and webhooks as first-class objects</li>
        </ul>
      </div>

      <div id="v4" className="mt-8 scroll-mt-24 aeg-panel p-6 md:p-8 border-primary/30">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <Eyebrow accent>VERSION 4.0 &middot; CURRENT</Eyebrow>
            <h3 className="mt-2 text-xl font-medium">Continuity Seal</h3>
          </div>
          <span className="rounded-full border border-allow bg-allow-muted px-3 py-1 font-mono text-[11px] font-semibold text-allow">
            CURRENT
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Continuity Seal extends runtime governance from authorization into the integrity of the execution
          itself. The execution must remain the execution that was authorized.
        </p>
        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>&bull; Deterministic execution sealing with immutable seal identity</li>
          <li>&bull; Authority-state fingerprinting and drift detection</li>
          <li>&bull; Fail-closed execution when authority changes</li>
          <li>&bull; Tool execution bound to its authorization receipt</li>
          <li>&bull; sealId correlation across the evidence layer</li>
          <li>&bull; Blocked execution and effect reconciliation evidence</li>
        </ul>
      </div>

      <h2 id="capability" className="mt-20 scroll-mt-24 text-2xl font-medium">Capability by version</h2>
      <div className="mt-6">
        <DataTable
          head={["Capability", "1.0", "2.0", "3.0", "4.0"]}
          rows={[
            ["Rule-based matching", "Yes", "Yes", "Yes", "Yes"],
            ["Context resolution", "—", "Yes", "Yes", "Yes"],
            ["Risk input", "—", "Yes", "Caller-supplied score (0-100), usable in policy conditions", "Unchanged from 3.0"],
            ["Decision outcomes", "Allow / Deny", "Allow / Block / Escalate", "Allow / Block / Escalate", "Allow / Block / Escalate"],
            ["Decision point", "—", "Advisory only", "Decision API at the execution boundary", "Unchanged from 3.0"],
            ["Evidence store", "—", "Non-durable log", "Durable, queryable", "Durable, queryable"],
            ["Evidence hash per decision", "—", "—", "Yes", "Yes"],
            ["Workspace / role model", "—", "—", "Yes", "Yes"],
            ["Execution sealing (Continuity Seal)", "—", "—", "—", "Yes"],
            ["Authority drift detection", "—", "—", "—", "Yes"],
            ["Fail-closed on sealed-state change", "—", "—", "—", "Yes"],
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
            ["Risk", "A 0-100 value sent with the request, usable in policy conditions."],
            ["Decision", "Aegisora returns ALLOW, BLOCK or ESCALATE. Your code continues only on ALLOW."],
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
          code={`curl -X POST https://aegisora.org/api/v1/evaluate \\
  -H "Authorization: Bearer aeg_live_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "customer-support-bot",
    "action": "stripe_refund_api",
    "resource": "invoice/INV-1042",
    "risk": 40,
    "input": { "amount_usd": 480 }
  }'

# 200 response
{
  "decision_id": "<uuid>",
  "effect": "ESCALATE",
  "reason": "<text>",
  "policy_id": "<uuid or null>",
  "approval_id": "<uuid or null>",
  "execution_id": null,
  "trace_id": "<id>",
  "evidence_hash": "<hash>",
  "agent_registered": false
}`}
          caption="Request and response shape of the current endpoint. The outcome depends on your policies. Errors return { error: { code, message } }."
        />
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        A full SDK and API reference is not published on this site yet.
      </p>
    </div>
  );
}