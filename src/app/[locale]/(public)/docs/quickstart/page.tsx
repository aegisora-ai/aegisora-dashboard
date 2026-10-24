import { CodeBlock, Steps } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Quickstart",
  "Send your first agent action to Aegisora and read the decision.",
);

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
    <div>
      <h1 className="text-4xl font-light tracking-tight">Quickstart</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Send one agent action to Aegisora and read the decision. Evaluation requires a workspace with an
        active execution entitlement. Without a matching policy the workspace default applies, which is
        BLOCK unless you change it.
      </p>

      <h2 id="access" className="mt-12 scroll-mt-24 text-2xl font-medium">Pilot access</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Pilot workspaces are set up by Aegisora. You receive an invitation by email; accept it to join your
        workspace, then open API keys in the dashboard. Keys look like aeg_live_ followed by 48 hex
        characters and are shown once.
      </p>

      <h2 id="request" className="mt-16 scroll-mt-24 text-2xl font-medium">Send an action</h2>
      <div className="mt-6">
        <CodeBlock code={curlExample} />
      </div>

      <h2 id="decision" className="mt-16 scroll-mt-24 text-2xl font-medium">Read the decision</h2>
      <div className="mt-6">
        <CodeBlock code={responseExample} />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        effect is ALLOW, BLOCK or ESCALATE. ESCALATE creates an approval and returns approval_id. Every
        decision returns an evidence_hash you can verify later.
      </p>

      <h2 id="sdk" className="mt-16 scroll-mt-24 text-2xl font-medium">Node helper (optional)</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <a
          href="/sdk/aegisora.mjs"
          download
          className="font-semibold text-primary underline underline-offset-4"
        >
          Download aegisora.mjs
        </a>
        . A single file with no dependencies.
      </p>
      <div className="mt-6">
        <CodeBlock code={nodeExample} />
      </div>

      <h2 className="mt-16 text-2xl font-medium">What to expect</h2>
      <div className="mt-6">
        <Steps
          cols={3}
          items={[
            ["Send", "Your agent calls the evaluate endpoint before it executes an action."],
            ["Decide", "Aegisora returns ALLOW, BLOCK or ESCALATE. Your code continues only on ALLOW."],
            ["Verify", "Each decision writes an evidence record you can check later."],
          ]}
        />
      </div>
    </div>
  );
}
