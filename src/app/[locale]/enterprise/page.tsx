import type { Metadata } from "next";
import { PublicShell } from "@/components/aegisora/public-shell";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Enterprise" };

export default function EnterprisePage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Enterprise"
        title="Scoped pilots for runtime control of AI agent actions."
        intro="Aegisora is seeking design partners to test a policy decision before a consequential tool action. Production hosting, customer SSO, and full audit operations are not yet verified."
        primary={{ label: "Create an account", href: "/signup" }}
        secondary={{ label: "Review the API", href: "/developers" }}
        rows={[
          { action: "payments.transfer $48,000", meta: "finance-agent · Waiting for approver", v: "ESCALATE" },
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="Status today" title="What is built and what is still planned." tone="alt">
        <CardGrid
          cols={4}
          items={[
            { icon: "Layers", title: "Workspace-scoped API", body: "API keys and persisted decisions are associated with a workspace; cross-workspace ownership checks have runtime evidence." },
            { icon: "Users", title: "Four workspace roles", body: "OWNER, ADMIN, OPERATOR, and VIEWER team permissions have a real Supabase JWT test. Invite and member-removal flows are not available yet." },
            { icon: "ScrollText", title: "Decision and evidence paths", body: "The API records runtime decisions and evidence. End-to-end governance coverage is still being validated; no complete audit-ledger claim is made." },
            { icon: "KeyRound", title: "Identity federation planned", body: "A provider boundary is documented, but customer SAML/OIDC and automated provisioning are not configured or verified." },
          ]}
        />
      </Section>
      <CtaBand
        title="Talk about a scoped pilot."
        body="Any paid pilot is scoped and agreed in writing before customer data or production systems are connected."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </PublicShell>
  );
}