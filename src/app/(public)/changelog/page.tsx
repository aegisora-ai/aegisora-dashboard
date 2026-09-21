import { CtaBand, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Changelog",
  "What Aegisora 3.0 includes: runtime security, execution control, policy enforcement, approvals, evidence, audit and enterprise governance.",
);

const included = [
  "Runtime security and execution control",
  "Policy enforcement",
  "Risk evaluation",
  "Decision engine (ALLOW, BLOCK, ESCALATE)",
  "Human approval and escalation",
  "Enterprise evidence and auditability",
  "Workspace isolation and role-based access",
  "Agent and provider governance",
  "Runtime observability",
  "Usage and entitlement concepts",
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        eyebrow="CHANGELOG"
        title="Aegisora 3.0."
        lead="The current product. A control plane around agent execution, organized by workspace and role."
      />

      <Section>
        <div className="grid gap-10 md:grid-cols-[200px_1fr]">
          <div>
            <p className="font-mono text-sm">3.0</p>
            <p className="mt-1 inline-block rounded-sm border border-allow/40 bg-allow-muted px-2 py-0.5 font-mono text-[11px] tracking-wider text-allow">
              CURRENT
            </p>
          </div>
          <ul className="aeg-panel divide-y divide-border">
            {included.map((i) => (
              <li key={i} className="px-5 py-3 text-sm">{i}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="tinted" eyebrow="IN DEVELOPMENT" title="Continuing development.">
        <p className="max-w-2xl text-muted-foreground">
          Aegisora 4.0 is a continuing development direction. It is not part of the 3.0 product described
          on this site, and nothing here should be read as a commitment about its capabilities or timing.
          A detailed release history has not been published yet.
        </p>
      </Section>

      <CtaBand title="Try what 3.0 does today." />
    </>
  );
}