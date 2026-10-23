import type { Metadata } from "next";
import { PublicShell } from "@/components/aegisora/public-shell";
import { PageHero, Section, CodeBlock, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Quickstart" };

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://YOUR-AEGISORA-HOST";

const curlExample = `curl -s -X POST ${BASE}/api/v1/evaluate \\
  -H "Authorization: Bearer $AEGISORA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"finance-operator","action":"invoice.read","resource":"invoice:sample-001","risk":20}'`;

const responseExample = `{
  "decision_id": "...",
  "effect": "BLOCK",
  "reason": "...",
  "policy_id": null,
  "approval_id": null,
  "execution_id": null,
  "trace_id": "...",
  "evidence_hash": "...",
  "agent_registered": true
}`;

const nodeExample = `import { Aegisora } from "./aegisora.mjs";

const aegisora = new Aegisora({ baseUrl: process.env.AEGISORA_BASE_URL });

// The callback runs only when the decision is ALLOW.
// BLOCK and ESCALATE throw AegisoraDecisionError.
const result = await aegisora.guard(
  { agent: "finance-operator", action: "invoice.read", resource: "invoice:sample-001", risk: 20 },
  async (decision) => doTransfer(decision.decision_id)
);`;

export default function QuickstartPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Quickstart"
        title="Evaluate your first agent action"
        intro="Early access. Evaluation requires a workspace with an active execution entitlement. Without a matching policy the workspace default applies, which is BLOCK unless you change it."
        primary={{ label: "Create a workspace", href: "/signup" }}
        secondary={{ label: "Read the docs", href: "/docs" }}
      />

      <Section eyebrow="Step 1" title="Get an API key" intro="Create a workspace, then open API keys in the dashboard. Keys look like aeg_live_ followed by 48 hex characters and are shown once." tone="alt">
        <span />
      </Section>

      <Section eyebrow="Step 2" title="Send an action">
        <CodeBlock code={curlExample} />
      </Section>

      <Section eyebrow="Step 3" title="Read the decision" tone="alt">
        <CodeBlock code={responseExample} />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">
          effect is ALLOW, BLOCK or ESCALATE. ESCALATE creates an approval and returns approval_id. Every decision returns an evidence_hash you can verify later.
        </p>
      </Section>

      <Section eyebrow="Step 4 (optional)" title="Node helper, no dependencies">
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-white/70">
          <a href="/sdk/aegisora.mjs" download className="font-semibold text-sky-300 underline underline-offset-4">Download aegisora.mjs</a>.
          {" "}Fail-closed by default: if the API cannot be reached, the decision is BLOCK. Pass failMode: &quot;open&quot; to change that.
        </p>
        <CodeBlock code={nodeExample} />
      </Section>

      <Section eyebrow="Limits" title="Rate and size limits" intro="Requests are rate limited per IP (120 per minute) and per API key (60 per minute). Request bodies are limited to 64 KB. The agent field must be an identifier, not personal data or a credential." tone="alt">
        <span />
      </Section>

      <CtaBand
        title="Send your first request."
        body="Create a test workspace, send one request and read the decision."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Run live runtime proof", href: "/proof" }}
      />
    </PublicShell>
  );
}