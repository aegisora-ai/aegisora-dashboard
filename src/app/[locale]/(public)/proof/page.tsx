import type { Metadata } from "next";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = {
  title: "Runtime Proof | Aegisora",
  description:
    "See how Aegisora evaluates an AI agent action at runtime: policy decision, risk context and tamper-evident evidence.",
};

const EXAMPLE = [
  "{",
  '  "effect": "BLOCK",',
  '  "reason": "Policy: no external transfer of customer PII",',
  '  "policy_id": "<uuid>",',
  '  "evidence_hash": "<hash>"',
  "}",
].join("\n");

export default function ProofPage() {
  return (
    <>
      <PageHero
        eyebrow="Runtime Proof"
        title="From agent action to auditable decision"
        intro="Aegisora sits between your AI agents and the systems they touch. Each action is evaluated before it runs and leaves verifiable evidence behind."
        primary={{ label: "Start a pilot", href: "/signup" }}
        secondary={{ label: "Read the docs", href: "/docs" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
          { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="How it works" title="Four steps from request to evidence." tone="alt">
        <CardGrid
          cols={4}
          items={[
            { n: "01", title: "Agent action", body: "An agent requests a tool call or data access through the Aegisora API." },
            { n: "02", title: "Context and risk", body: "Aegisora resolves the workspace from your API key and reads the agent, action, resource and the risk value you send." },
            { n: "03", title: "Policy decision", body: "Policies return ALLOW, BLOCK or ESCALATE, with sensitive data masked." },
            { n: "04", title: "Evidence", body: "Every decision is written to a hash-chained evidence record for audit." },
          ]}
        />
      </Section>
      <Section
        eyebrow="Response"
        title="Illustrative decision"
        intro="Shape of a real response, values abbreviated. The request format is in the quickstart."
      >
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#030f3d] p-5 font-mono text-sm text-sky-100">
          <code>{EXAMPLE}</code>
        </pre>
      </Section>
      <CtaBand
        title="Run it against your own action."
        body="Create a test workspace, send one request and read the verdict."
        primary={{ label: "Start a pilot", href: "/signup" }}
        secondary={{ label: "Talk to our team", href: "/pilot" }}
      />
    </>
  );
}