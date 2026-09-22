import { CtaBand, DataTable, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

export const metadata = meta(
  "Security",
  "Aegisora secures what AI agents are allowed to execute, with workspace isolation, role-based access, policy enforcement, approvals and evidence.",
);

const roles = ["owner", "admin", "developer", "analyst", "auditor", "viewer"];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="SECURITY"
        title="Trust that comes from structure."
        lead="Aegisora is not primarily about protecting model weights or prompts. It secures the execution boundary: what an agent is actually allowed to do in a real system."
      />

      <Section eyebrow="THE BOUNDARY" title="Between intent and consequence.">
        <ol className="aeg-panel grid grid-cols-3 gap-px overflow-hidden bg-border text-center font-mono text-xs tracking-wider">
          <li className="bg-surface-2 px-2 py-6">AGENT INTENT</li>
          <li className="bg-surface-4 px-2 py-6 text-cyan">AEGISORA</li>
          <li className="bg-surface-2 px-2 py-6">REAL ENVIRONMENT</li>
        </ol>
      </Section>

      <Section tone="tinted" eyebrow="ACCESS" title="Role-based access, by workspace.">
        <p className="max-w-2xl text-muted-foreground">
          Agents, policies, decisions and evidence belong to a workspace. Access within a workspace is
          governed by six roles.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {roles.map((r) => (
            <li key={r} className="aeg-panel px-3 py-1.5 font-mono text-xs">{r}</li>
          ))}
        </ul>
        <div className="mt-8">
          <DataTable
            head={["Area", "Permissions"]}
            rows={[
              ["workspace", "read, update"],
              ["members", "read, manage"],
              ["agents", "read, manage"],
              ["providers", "read, manage"],
              ["policies", "read, manage"],
              ["decisions", "read"],
              ["evidence", "read"],
              ["audit", "read"],
              ["approvals", "read, manage"],
              ["runtime", "read, execute"],
              ["api_keys", "read, manage"],
              ["billing", "read, manage"],
              ["settings", "manage"],
            ]}
            mono={[0, 1]}
          />
        </div>
      </Section>

      <Section eyebrow="WHAT THIS SITE DOES NOT CLAIM" title="No borrowed credibility.">
        <p className="max-w-2xl text-muted-foreground">
          This site does not display customer logos, testimonials, uptime figures or compliance
          certification badges. Trust is meant to come from how the system is built: clear decisions,
          clear enforcement, clear access and clear evidence.
        </p>
      </Section>

      <CtaBand title="Secure what your agents are allowed to do." />
    </>
  );
}