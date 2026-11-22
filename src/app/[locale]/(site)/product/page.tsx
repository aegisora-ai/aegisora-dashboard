import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Bot, FileCheck, GitBranch, ScrollText, UserCheck, Webhook } from "lucide-react";
import { meta } from "@/lib/seo";
import { Cell, Cells, Cta, Hero, Sec, SectionHead } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string }> };
type Item = { title: string; body: string };

const EN = {
  metaTitle: "Platform",
  metaDesc: "One gate between your AI agents and your systems: policies, decisions, approvals and evidence.",
  badge: "Platform",
  title: "One gate between your agents",
  dim: "and your systems.",
  intro: "Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against context, policy, risk and authorization before it executes.",
  primary: "Start for free",
  secondary: "See the demo",
  lifeEyebrow: "Decision lifecycle",
  lifeTitle: "What happens to",
  lifeDim: "every action.",
  life: [
    { title: "Request", body: "An agent asks to do something: call an API, read a file, change a record." },
    { title: "Evaluate", body: "Aegisora checks the action against your policies, the identity of the agent and the risk context." },
    { title: "Decide", body: "The result is allow, block or escalate. Escalations pause until a person approves." },
    { title: "Record", body: "The decision, the reason and the outcome are written to your evidence log." },
  ] as Item[],
  ctrlEyebrow: "Control surfaces",
  ctrlTitle: "Everything your team needs",
  ctrlDim: "to stay in control.",
  ctrl: [
    { title: "Agents", body: "Register or import agents and see what each one is allowed to do." },
    { title: "Policies", body: "Create, version and review the rules that decide every action." },
    { title: "Approvals", body: "Review escalated actions in one queue, with the context to decide quickly." },
    { title: "Decisions and traces", body: "Search every decision and follow an agent across steps." },
    { title: "Evidence", body: "Export evidence for audits, customers and incident reviews." },
    { title: "Integrations", body: "API keys and webhooks connect Aegisora to the systems you already run." },
  ] as Item[],
  ctaTitle: "See it on your own agents.",
  ctaBody: "Create a workspace, connect an agent and send your first test action.",
  ctaPrimary: "Start for free",
  ctaSecondary: "Request a pilot",
};
type Copy = typeof EN;

const DE: Copy = {
  metaTitle: "Plattform",
  metaDesc: "Ein Tor zwischen deinen KI-Agenten und deinen Systemen: Richtlinien, Entscheidungen, Freigaben und Nachweise.",
  badge: "Plattform",
  title: "Ein Tor zwischen deinen Agenten",
  dim: "und deinen Systemen.",
  intro: "Aegisora sitzt an der Ausf\u00fchrungsgrenze autonomer Systeme. Jede sensible Aktion wird gegen Kontext, Richtlinie, Risiko und Autorisierung bewertet, bevor sie ausgef\u00fchrt wird.",
  primary: "Kostenlos starten",
  secondary: "Demo ansehen",
  lifeEyebrow: "Entscheidungsablauf",
  lifeTitle: "Was mit jeder Aktion",
  lifeDim: "passiert.",
  life: [
    { title: "Anfrage", body: "Ein Agent m\u00f6chte etwas tun: eine API aufrufen, eine Datei lesen, einen Datensatz \u00e4ndern." },
    { title: "Bewerten", body: "Aegisora pr\u00fcft die Aktion gegen deine Richtlinien, die Identit\u00e4t des Agenten und den Risikokontext." },
    { title: "Entscheiden", body: "Das Ergebnis lautet erlauben, blockieren oder eskalieren. Eskalationen pausieren, bis eine Person freigibt." },
    { title: "Festhalten", body: "Entscheidung, Begr\u00fcndung und Ergebnis landen in deinem Nachweisprotokoll." },
  ],
  ctrlEyebrow: "Steuerung",
  ctrlTitle: "Alles, was dein Team braucht,",
  ctrlDim: "um die Kontrolle zu behalten.",
  ctrl: [
    { title: "Agenten", body: "Registriere oder importiere Agenten und sieh, was jeder von ihnen darf." },
    { title: "Richtlinien", body: "Erstelle, versioniere und pr\u00fcfe die Regeln, die jede Aktion entscheiden." },
    { title: "Freigaben", body: "Pr\u00fcfe eskalierte Aktionen in einer Warteschlange, mit dem Kontext f\u00fcr eine schnelle Entscheidung." },
    { title: "Entscheidungen und Traces", body: "Durchsuche jede Entscheidung und verfolge einen Agenten \u00fcber mehrere Schritte." },
    { title: "Nachweise", body: "Exportiere Nachweise f\u00fcr Audits, Kunden und Incident-Reviews." },
    { title: "Integrationen", body: "API-Schl\u00fcssel und Webhooks verbinden Aegisora mit den Systemen, die du bereits betreibst." },
  ],
  ctaTitle: "Sieh es an deinen eigenen Agenten.",
  ctaBody: "Erstelle einen Workspace, verbinde einen Agenten und sende deine erste Testaktion.",
  ctaPrimary: "Kostenlos starten",
  ctaSecondary: "Pilot anfragen",
};

const CTRL_ICONS = [Bot, ScrollText, UserCheck, GitBranch, FileCheck, Webhook];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = locale === "de" ? DE : EN;
  return meta(c.metaTitle, c.metaDesc);
}

export default async function ProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "de" ? DE : EN;
  return (
    <>
      <Hero
        compact
        badge={c.badge}
        title={c.title}
        dim={c.dim}
        intro={c.intro}
        primary={{ label: c.primary, href: "/signup" }}
        secondary={{ label: c.secondary, href: "/demo" }}
      />

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={c.lifeEyebrow} title={c.lifeTitle} dim={c.lifeDim} />
        </div>
        <Cells n={4}>
          {c.life.map((s, i) => (
            <Cell key={s.title} num={String(i + 1).padStart(2, "0")} title={s.title}>{s.body}</Cell>
          ))}
        </Cells>
      </Sec>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={c.ctrlEyebrow} title={c.ctrlTitle} dim={c.ctrlDim} />
        </div>
        <Cells n={6}>
          {c.ctrl.map((f, i) => (
            <Cell key={f.title} icon={CTRL_ICONS[i]} title={f.title}>{f.body}</Cell>
          ))}
        </Cells>
      </Sec>

      <Cta
        title={c.ctaTitle}
        body={c.ctaBody}
        primary={{ label: c.ctaPrimary, href: "/signup" }}
        secondary={{ label: c.ctaSecondary, href: "/pilot" }}
      />
    </>
  );
}