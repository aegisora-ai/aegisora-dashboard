import type { Metadata } from "next";
import { PageShell, CARD, ButtonLink } from "@/components/aegisora/trust-ui";

export const metadata: Metadata = {
  title: "Runtime Proof | Aegisora",
  description:
    "See how Aegisora evaluates an AI agent action at runtime: policy decision, risk context and tamper-evident evidence.",
};

const STEPS = [
  { n: "1", title: "Agent action", text: "An agent requests a tool call or data access through the Aegisora API." },
  { n: "2", title: "Context and risk", text: "Aegisora enriches the request with workspace, identity and risk context." },
  { n: "3", title: "Policy decision", text: "Policies return ALLOW, BLOCK or ESCALATE, with sensitive data masked." },
  { n: "4", title: "Evidence", text: "Every decision is written to a hash-chained evidence record for audit." },
];

const EXAMPLE = [
  "{",
  '  "decision": "BLOCK",',
  '  "reason": "Policy: no external transfer of customer PII",',
  '  "risk": "high",',
  '  "evidence": { "recorded": true, "chained": true }',
  "}",
].join("\n");

export default function ProofPage() {
  return (
    <PageShell
      eyebrow="Runtime Proof"
      title="From agent action to auditable decision"
      intro="Aegisora sits between your AI agents and the systems they touch. Each action is evaluated before it runs and leaves verifiable evidence behind."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.n} className={CARD}>
            <p className="text-sm font-medium opacity-60">Step {s.n}</p>
            <h2 className="mt-1 text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 opacity-75">{s.text}</p>
          </div>
        ))}
      </div>
      <div className={CARD}>
        <h2 className="text-xl font-semibold">Illustrative decision</h2>
        <p className="mt-1 text-sm opacity-60">Simplified example. See the documentation for the exact API contract.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg p-4 text-sm [background:color-mix(in_srgb,currentColor_8%,transparent)]">
          <code>{EXAMPLE}</code>
        </pre>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/signup" primary>Start a pilot</ButtonLink>
        <ButtonLink href="/docs">Read the docs</ButtonLink>
        <ButtonLink href="/contact">Talk to our team</ButtonLink>
      </div>
    </PageShell>
  );
}