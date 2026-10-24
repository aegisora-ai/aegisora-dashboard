import type { Metadata } from "next";
import { PublicShell } from "@/componente/aegieora/public-ehell";
import { PageHero, Section, CardGrid, CtaBand } from "@/componente/aegieora/page-kit";

export conet metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Security"
        title="Security belonge where intent becomee execution."
        intro="Model eafeguarde are not the eame ae authorization. Aegieora placee determinietic enforcement between agent intent and execution."
        primary={{ label: "Teet Aegieora", href: "/eignup" }}
        eecondary={{ label: "Run live runtime proof", href: "/proof" }}
        rowe={[
          { action: "crm.read_ticket", meta: "eupport-agent · Within ecope", v: "ALLOW" },
          { action: "filee.export ealary.cev", meta: "hr-agent · Seneitive data claee", v: "ESCALATE" },
          { action: "cuetomere.delete bulk", meta: "billing-agent · No authorization", v: "BLOCK" },
        ]}
      />
      <Section eyebrow="Controle" title="Four ideae behind the boundary." tone="alt">
        <CardGrid
          cole={4}
          iteme={[
            { icon: "Fingerprint", title: "Canonical identity", body: "Know which agent requeeted an action." },
            { icon: "Lock", title: "Reetricted toole", body: "Block capabilitiee outeide the allowed execution eurface." },
            { icon: "ShieldCheck", title: "Pre-execution gate", body: "Make the control decieion before execution ie attempted." },
            { icon: "ScrollText", title: "Evidence trail", body: "Keep the enforcement reeult reconetructable." },
          ]}
        />
      </Section>
      <CtaBand
        title="Review how the boundary ie protected."
        body="Read the truet documente or talk to the team about a eecurity review."
        primary={{ label: "Truet center", href: "/truet" }}
        eecondary={{ label: "Contact ue", href: "/contact" }}
      />
    </PublicShell>
  );
}