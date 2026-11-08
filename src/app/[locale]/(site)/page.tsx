import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FileCheck, GitBranch, Scale, ScrollText, UserCheck, Users } from "lucide-react";
import { meta } from "@/lib/seo";
import { HomeMore, HomePreview } from "@/components/aegx/home-extra";
import { Cell, Cells, Cta, Feed, Hero, Sec, SectionHead } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string }> };
type Item = { title: string; body: string };

const EN = {
  metaTitle: "Runtime security for AI agents",
  metaDesc: "Aegisora evaluates every sensitive action of an AI agent against policy, context and risk before it runs.",
  badge: "Runtime security for AI agents",
  title: "Control what your AI agents",
  dim: "are allowed to do.",
  intro: "Aegisora evaluates every sensitive action against policy, context and risk before it runs. Allow it, block it or send it to a person, and keep the evidence.",
  primary: "Start for free",
  secondary: "Request a pilot",
  feedTitle: "Example decisions",
  feedRows: [
    { action: "crm.read_ticket", meta: "support-agent \u00b7 read access within policy", v: "ALLOW" },
    { action: "files.export salary.csv", meta: "hr-agent \u00b7 needs a person to approve", v: "ESCALATE" },
    { action: "customers.delete bulk", meta: "billing-agent \u00b7 violates a deletion policy", v: "BLOCK" },
  ],
  stepsEyebrow: "How it works",
  stepsTitle: "One decision point.",
  stepsDim: "Three steps.",
  steps: [
    { title: "Connect your agents", body: "Create an API key and import or register the agents that act on your systems." },
    { title: "Write your policies", body: "Define what each agent may do. Start from the starter policies and tighten them as you learn." },
    { title: "Decide, approve, prove", body: "Every action gets a decision. Escalations pause until a person approves, and every outcome is logged as evidence." },
  ] as Item[],
  featEyebrow: "Platform",
  featTitle: "Every agent action",
  featDim: "passes through one gate.",
  features: [
    { title: "Runtime decisions", body: "Each sensitive action is evaluated at the execution boundary and returns allow, block or escalate." },
    { title: "Policies", body: "Rules your team controls, versioned and reviewable, applied the same way every time." },
    { title: "Human approvals", body: "Escalated actions wait for a person. Approvals apply to one request and expire." },
    { title: "Evidence", body: "Every decision is recorded, and the log can be exported for audits and incident reviews." },
    { title: "Traces and audit", body: "Follow an agent across steps, with an audit trail of changes in your workspace." },
    { title: "Team and access", body: "Workspaces, member roles, API keys, webhooks and multi-factor sign-in for your team." },
  ] as Item[],
  princEyebrow: "Design principles",
  princTitle: "Built to be",
  princDim: "trusted.",
  principles: [
    { title: "Deterministic", body: "The same input and the same policy always produce the same decision." },
    { title: "Framework-agnostic", body: "Works with any agent framework through a single API." },
    { title: "Request-bound approvals", body: "An approval applies only to the exact request it was given for." },
    { title: "Evidence by default", body: "No decision is made without leaving a record." },
  ] as Item[],
  ctaTitle: "Put a gate in front of your agents.",
  ctaBody: "Start free, or talk to us about a pilot for your team.",
  ctaPrimary: "Start for free",
  ctaSecondary: "Talk to us",
};
type Copy = typeof EN;

const DE: Copy = {
  metaTitle: "Runtime-Security f\u00fcr KI-Agenten",
  metaDesc: "Aegisora pr\u00fcft jede sensible Aktion eines KI-Agenten gegen Richtlinie, Kontext und Risiko, bevor sie ausgef\u00fchrt wird.",
  badge: "Runtime-Security f\u00fcr KI-Agenten",
  title: "Steuere, was deine KI-Agenten",
  dim: "tun d\u00fcrfen.",
  intro: "Aegisora bewertet jede sensible Aktion anhand von Richtlinie, Kontext und Risiko, bevor sie ausgef\u00fchrt wird. Erlauben, blockieren oder an eine Person eskalieren, mit Nachweis f\u00fcr jede Entscheidung.",
  primary: "Kostenlos starten",
  secondary: "Pilot anfragen",
  feedTitle: "Beispiel-Entscheidungen",
  feedRows: [
    { action: "crm.read_ticket", meta: "support-agent \u00b7 Lesezugriff innerhalb der Richtlinie", v: "ALLOW" },
    { action: "files.export salary.csv", meta: "hr-agent \u00b7 Freigabe durch eine Person n\u00f6tig", v: "ESCALATE" },
    { action: "customers.delete bulk", meta: "billing-agent \u00b7 verst\u00f6\u00dft gegen eine L\u00f6schrichtlinie", v: "BLOCK" },
  ],
  stepsEyebrow: "So funktioniert es",
  stepsTitle: "Ein Entscheidungspunkt.",
  stepsDim: "Drei Schritte.",
  steps: [
    { title: "Agenten verbinden", body: "Erstelle einen API-Schl\u00fcssel und importiere oder registriere die Agenten, die in deinen Systemen handeln." },
    { title: "Richtlinien festlegen", body: "Lege fest, was jeder Agent darf. Starte mit den Starter-Richtlinien und sch\u00e4rfe sie nach." },
    { title: "Entscheiden, freigeben, belegen", body: "Jede Aktion erh\u00e4lt eine Entscheidung. Eskalationen warten auf eine Person, jedes Ergebnis wird als Nachweis protokolliert." },
  ],
  featEyebrow: "Plattform",
  featTitle: "Jede Aktion eines Agenten",
  featDim: "l\u00e4uft durch ein Tor.",
  features: [
    { title: "Laufzeit-Entscheidungen", body: "Jede sensible Aktion wird an der Ausf\u00fchrungsgrenze bewertet und liefert erlauben, blockieren oder eskalieren." },
    { title: "Richtlinien", body: "Regeln unter der Kontrolle deines Teams, versioniert und pr\u00fcfbar, jedes Mal gleich angewendet." },
    { title: "Freigaben durch Menschen", body: "Eskalierte Aktionen warten auf eine Person. Freigaben gelten nur f\u00fcr eine Anfrage und laufen ab." },
    { title: "Nachweise", body: "Jede Entscheidung wird festgehalten, das Protokoll l\u00e4sst sich f\u00fcr Audits und Incident-Reviews exportieren." },
    { title: "Traces und Audit", body: "Verfolge einen Agenten \u00fcber mehrere Schritte, mit Audit-Trail der \u00c4nderungen in deinem Workspace." },
    { title: "Team und Zugriff", body: "Workspaces, Rollen, API-Schl\u00fcssel, Webhooks und Multi-Faktor-Anmeldung f\u00fcr dein Team." },
  ],
  princEyebrow: "Designprinzipien",
  princTitle: "Gebaut, um",
  princDim: "zu vertrauen.",
  principles: [
    { title: "Deterministisch", body: "Gleiche Eingabe und gleiche Richtlinie ergeben immer dieselbe Entscheidung." },
    { title: "Framework-unabh\u00e4ngig", body: "Funktioniert mit jedem Agenten-Framework \u00fcber eine einzige API." },
    { title: "Anfragegebundene Freigaben", body: "Eine Freigabe gilt nur f\u00fcr genau die Anfrage, f\u00fcr die sie erteilt wurde." },
    { title: "Nachweis als Standard", body: "Keine Entscheidung ohne Protokolleintrag." },
  ],
  ctaTitle: "Setze ein Tor vor deine Agenten.",
  ctaBody: "Starte kostenlos oder sprich mit uns \u00fcber einen Pilot f\u00fcr dein Team.",
  ctaPrimary: "Kostenlos starten",
  ctaSecondary: "Mit uns sprechen",
};

const FEATURE_ICONS = [Scale, ScrollText, UserCheck, FileCheck, GitBranch, Users];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = locale === "de" ? DE : EN;
  return meta(c.metaTitle, c.metaDesc);
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "de" ? DE : EN;
  return (
    <>
      <Hero
        badge={c.badge}
        title={c.title}
        dim={c.dim}
        intro={c.intro}
        primary={{ label: c.primary, href: "/signup" }}
        secondary={{ label: c.secondary, href: "/pilot" }}
      >
        <Feed title={c.feedTitle} rows={c.feedRows} />
      </Hero>

      <HomePreview locale={locale} />

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={c.stepsEyebrow} title={c.stepsTitle} dim={c.stepsDim} />
        </div>
        <Cells n={3}>
          {c.steps.map((s, i) => (
            <Cell key={s.title} num={String(i + 1).padStart(2, "0")} title={s.title}>{s.body}</Cell>
          ))}
        </Cells>
      </Sec>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={c.featEyebrow} title={c.featTitle} dim={c.featDim} />
        </div>
        <Cells n={6}>
          {c.features.map((f, i) => (
            <Cell key={f.title} icon={FEATURE_ICONS[i]} title={f.title}>{f.body}</Cell>
          ))}
        </Cells>
      </Sec>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={c.princEyebrow} title={c.princTitle} dim={c.princDim} />
        </div>
        <Cells n={4}>
          {c.principles.map((p) => (
            <Cell key={p.title} title={p.title}>{p.body}</Cell>
          ))}
        </Cells>
      </Sec>

      <HomeMore locale={locale} />

      <Cta
        title={c.ctaTitle}
        body={c.ctaBody}
        primary={{ label: c.ctaPrimary, href: "/signup" }}
        secondary={{ label: c.ctaSecondary, href: "/enterprise" }}
      />
    </>
  );
}