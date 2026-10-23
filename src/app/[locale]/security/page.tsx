import type { Metadata } from "next";
import { PublicShell } from "@/components/aegisora/public-shell";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Security"
        title="Security belongs where intent becomes execution."
        intro="Model safeguards are not the same as authorization. Aegisora places deterministic enforcement between agent intent and execution."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Run live runtime proof", href: "/proof" }}
        rows={[
          { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
          { action: "files.export salary.csv", meta: "hr-agent · Sensitive data class", v: "ESCALATE" },
          { action: "customers.delete bulk", meta: "billing-agent · No authorization", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="Controls" title="Four ideas behind the boundary." tone="alt">
        <CardGrid
          cols={4}
          items={[
            { icon: "Fingerprint", title: "Canonical identity", body: "Know which agent requested an action." },
            { icon: "Lock", title: "Restricted tools", body: "Block capabilities outside the allowed execution surface." },
            { icon: "ShieldCheck", title: "Pre-execution gate", body: "Make the control decision before execution is attempted." },
            { icon: "ScrollText", title: "Evidence trail", body: "Keep the enforcement result reconstructable." },
          ]}
        />
      </Section>
      <CtaBand
        title="Review how the boundary is protected."
        body="Read the trust documents or talk to the team about a security review."
        primary={{ label: "Trust center", href: "/trust" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </PublicShell>
  );
}