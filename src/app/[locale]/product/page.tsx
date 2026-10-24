import type { Metadata } from "next";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = {
  title: "Product",
  description: "One runtime between your AI agents and the systems they act on.",
};

export default function ProductIndex() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="One runtime between your agents and the real world."
        intro="Aegisora checks every sensitive agent action against policy, risk and authorization, then returns ALLOW, ESCALATE or BLOCK before anything executes."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
          { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="Platform" title="Five parts, one decision path." tone="alt">
        <CardGrid
          cols={3}
          items={[
            { icon: "Workflow", title: "Runtime", body: "The eight-stage pipeline every action passes through, from request to evidence.", href: "/docs/technical" },
            { icon: "ShieldCheck", title: "Policies", body: "Rules with conditions and redaction, enforced on every call and versioned.", href: "/docs/technical" },
            { icon: "Gauge", title: "Decisions", body: "ALLOW, BLOCK or ESCALATE with a reason, a decision id and an evidence hash.", href: "/docs/technical" },
            { icon: "UserCheck", title: "Approvals", body: "Human review for the narrow set of actions that need it.", href: "/docs/technical" },
            { icon: "ScrollText", title: "Evidence", body: "A SHA-256 hash-chained log you can verify independently.", href: "/docs/technical" },
          ]}
        />
      </Section>
      <CtaBand
        title="See a decision for your own action."
        body="Create a test workspace, send one request and read the verdict. Without a matching policy the default is BLOCK."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Read the docs", href: "/docs" }}
      />
    </>
  );
}