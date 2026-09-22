import Link from "next/link";
import { CtaBand, DataTable, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";
import { btnOutline, btnPrimary } from "@/lib/ui";

export const metadata = meta(
  "Enterprise",
  "Enterprise controls for autonomous agents: workspace isolation, role-based access, policy governance, approvals, audit and evidence.",
);

const controls = [
  ["Workspace isolation", "Agents, policies, decisions and evidence belong to a workspace."],
  ["Role-based access", "owner, admin, developer, analyst, auditor and viewer roles."],
  ["Policy governance", "Versioned policies with defined bindings."],
  ["Human approval", "High-risk actions pause until an authorized person resolves them."],
  ["Audit trail", "Who did what, through which agent, under which policy."],
  ["Evidence records", "Decision-linked records with trace and execution identifiers."],
  ["Provider control", "Governance over the providers agents execute through."],
  ["Incidents and alerts", "Alerts, incidents and webhooks for operational response."],
];

export default function EnterprisePage() {
  return (
    <>
      <PageHero
        eyebrow="ENTERPRISE"
        title="Governance across the teams that run agents."
        lead="The same execution boundary serves security, platform, engineering and compliance teams, each looking at the same decisions from a different angle."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
          <Link href="/pricing" className={btnOutline}>See plans</Link>
        </div>
      </PageHero>

      <Section eyebrow="CONTROLS" title="Built around the boundary.">
        <ul className="aeg-panel grid gap-px overflow-hidden bg-border sm:grid-cols-2">
          {controls.map(([t, b]) => (
            <li key={t} className="bg-surface-2 p-5">
              <div className="text-sm font-medium">{t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="tinted" eyebrow="WHO IT SERVES" title="One system, several vantage points.">
        <DataTable
          head={["Team", "Cares about"]}
          rows={[
            ["Security", "Runtime control, policy enforcement, risk, incident prevention, human approval."],
            ["Platform", "Execution boundaries, provider management, integration, observability."],
            ["Engineering", "Runtime integration, policy management, testing, execution traces."],
            ["Compliance", "Evidence, audit trails, decision records, identity and access."],
            ["Leadership", "Control, risk reduction, governance and operational visibility."],
          ]}
          mono={[0]}
        />
      </Section>

      <Section eyebrow="CONTACT" title="Talk to us about your deployment.">
        <p className="max-w-2xl text-muted-foreground">
          Direct enterprise contact channels are not published on this site yet. In the meantime you can
          create a workspace and evaluate the decision model yourself.
        </p>
      </Section>

      <CtaBand title="Bring governance to agent execution." />
    </>
  );
}