import type { Metadata } from "next";
import { PublicShell } from "@/components/aegisora/public-shell";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Developers"
        title="Build agents around a real enforcement boundary."
        intro="Aegisora is designed to sit underneath the agent orchestration layer, where requests become executable actions."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Quickstart", href: "/developers/quickstart" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
          { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="Integration" title="Designed to fit under your stack." tone="alt">
        <CardGrid
          cols={4}
          items={[
            { n: "01", title: "Framework independent", body: "The boundary sits beneath your agent stack." },
            { n: "02", title: "Provider aware", body: "Provider execution can pass through the same enforcement path." },
            { n: "03", title: "Deterministic results", body: "Use explicit ALLOW, BLOCK and ESCALATE states." },
            { n: "04", title: "Runtime evidence", body: "Carry decision and evidence identity downstream." },
          ]}
        />
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