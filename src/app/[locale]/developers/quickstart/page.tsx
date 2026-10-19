import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/aegisora/public-shell";

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

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface-1 p-4 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export default function QuickstartPage() {
  return (
    <PublicShell>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">QUICKSTART</span>
          <h1 className="mt-4 text-4xl font-light tracking-tight">Evaluate your first agent action</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Early access. Evaluation requires a workspace with an active execution entitlement. Without a matching policy the workspace default applies, which is BLOCK unless you change it.
          </p>

          <h2 className="mt-10 text-xl font-semibold">1. Get an API key</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/signup" className="underline">Create a workspace</Link>, then open API keys in the dashboard. Keys look like aeg_live_ followed by 48 hex characters and are shown once.
          </p>

          <h2 className="mt-10 text-xl font-semibold">2. Send an action</h2>
          <Code>{curlExample}</Code>

          <h2 className="mt-10 text-xl font-semibold">3. Read the decision</h2>
          <Code>{responseExample}</Code>
          <p className="mt-2 text-sm text-muted-foreground">
            effect is ALLOW, BLOCK or ESCALATE. ESCALATE creates an approval and returns approval_id. Every decision returns an evidence_hash you can verify later.
          </p>

          <h2 className="mt-10 text-xl font-semibold">4. Optional: Node helper (no dependencies)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <a href="/sdk/aegisora.mjs" download className="underline">Download aegisora.mjs</a>. Fail-closed by default: if the API cannot be reached, the decision is BLOCK. Pass failMode: &quot;open&quot; to change that.
          </p>
          <Code>{nodeExample}</Code>

          <h2 className="mt-10 text-xl font-semibold">Limits</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Requests are rate limited per IP (120 per minute) and per API key (60 per minute). Request bodies are limited to 64 KB. The agent field must be an identifier, not personal data or a credential.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}