import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import { Cell, Cells, Hero, Sec } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string }> };

const MAIL = "careers@aegisora.org";

type Section = { h: string; p?: string; ul?: string[] };
type Copy = {
  metaTitle: string; metaDesc: string; badge: string; title: string; intro: string;
  facts: [string, string][]; sections: Section[];
  applyTitle: string; applyBody: string; applyBtn: string; subject: string;
};

const EN: Copy = {
  metaTitle: "Careers",
  metaDesc: "Join Aegisora as Founding Full-Stack Engineer. Remote across Germany and Europe.",
  badge: "Careers \u00b7 Remote \u00b7 Europe",
  title: "Founding Full-Stack Engineer",
  intro: "Help us build the decision point that sits between AI agents and the systems they act on.",
  facts: [["Location", "Remote \u00b7 Germany and Europe"], ["Type", "Full-time"], ["Start", "As soon as possible"]],
  sections: [
    { h: "About Aegisora", p: "Aegisora is an execution-control layer for autonomous AI agents. Before an agent acts, it asks Aegisora. The answer is ALLOW, BLOCK or ESCALATE, the default is BLOCK when no policy matches, and every decision is written to a hash-chained evidence log. We are a small team at an early stage and we ship quickly." },
    { h: "The role", p: "You will own features from idea to production across our Next.js and TypeScript app, Postgres with row-level security on Supabase, and the evaluate API, plus billing and webhooks." },
    { h: "What you will do", ul: [
      "Build new features end to end, from data model to interface",
      "Extend the evaluate API, the policy engine and the approval flows",
      "Keep tenant isolation, roles and MFA step-up correct and testable",
      "Improve the dashboard and the public website",
      "Talk to design partners and turn their feedback into product",
    ] },
    { h: "What you bring", ul: [
      "Several years of production experience with TypeScript, React and Next.js",
      "Solid SQL and Postgres skills, ideally including row-level security",
      "Experience with REST APIs, authentication and security basics",
      "You work independently, write clearly and ship in small steps",
      "Fluent English; German is a plus",
    ] },
    { h: "Nice to have", ul: [
      "Experience with AI agents, LLM tooling, or security and compliance products",
      "Stripe, webhooks or event processing",
      "Open-source contributions or products of your own",
    ] },
    { h: "What we offer", ul: [
      "Remote-first within European time zones",
      "Real ownership and short decision paths in a small team",
      "A product with a clear problem: making agent actions controllable",
      "Compensation and terms discussed openly in the first conversation",
    ] },
    { h: "How we hire", ul: [
      "A short intro call (30 minutes)",
      "A technical conversation about real code",
      "A short working session together",
      "An offer",
    ] },
  ],
  applyTitle: "Apply",
  applyBody: "Send your CV, a link to GitHub or projects you are proud of, and a few lines on what you would like to work on.",
  applyBtn: "Apply by email",
  subject: "Application: Founding Full-Stack Engineer",
};

const DE_: Copy = {
  metaTitle: "Karriere",
  metaDesc: "Werde Founding Full-Stack Engineer bei Aegisora. Remote in Deutschland und Europa.",
  badge: "Karriere \u00b7 Remote \u00b7 Europa",
  title: "Founding Full-Stack Engineer (m/w/d)",
  intro: "Hilf uns, den Entscheidungspunkt zu bauen, der zwischen KI-Agenten und den Systemen steht, auf die sie zugreifen.",
  facts: [["Ort", "Remote \u00b7 Deutschland und Europa"], ["Art", "Vollzeit"], ["Start", "Ab sofort"]],
  sections: [
    { h: "\u00dcber Aegisora", p: "Aegisora ist eine Kontrollschicht f\u00fcr autonome KI-Agenten. Bevor ein Agent handelt, fragt er Aegisora. Die Antwort lautet ALLOW, BLOCK oder ESCALATE, ohne passende Policy gilt BLOCK, und jede Entscheidung landet in einem hashverketteten Evidence-Log. Wir sind ein kleines Team in der Fr\u00fchphase und liefern schnell." },
    { h: "Deine Rolle", p: "Du verantwortest Funktionen von der Idee bis zum Betrieb: unsere Next.js- und TypeScript-App, Postgres mit Row-Level-Security auf Supabase und die Evaluate-API, dazu Billing und Webhooks." },
    { h: "Was du tun wirst", ul: [
      "Neue Funktionen end-to-end bauen, vom Datenmodell bis zur Oberfl\u00e4che",
      "Evaluate-API, Policy-Engine und Approval-Abl\u00e4ufe weiterentwickeln",
      "Mandantentrennung, Rollen und MFA-Absicherung korrekt und testbar halten",
      "Dashboard und \u00f6ffentliche Website verbessern",
      "Mit Design-Partnern sprechen und ihr Feedback in Produkt umsetzen",
    ] },
    { h: "Das bringst du mit", ul: [
      "Mehrere Jahre Praxiserfahrung mit TypeScript, React und Next.js",
      "Solide SQL- und Postgres-Kenntnisse, idealerweise inklusive Row-Level-Security",
      "Erfahrung mit REST-APIs, Authentifizierung und Sicherheitsgrundlagen",
      "Du arbeitest selbstst\u00e4ndig, schreibst klar und lieferst in kleinen Schritten",
      "Flie\u00dfend Englisch; Deutsch ist ein Plus",
    ] },
    { h: "Von Vorteil", ul: [
      "Erfahrung mit KI-Agenten, LLM-Tooling oder Sicherheits- und Compliance-Produkten",
      "Stripe, Webhooks oder Ereignisverarbeitung",
      "Open-Source-Beitr\u00e4ge oder eigene Produkte",
    ] },
    { h: "Was wir bieten", ul: [
      "Remote-first in europ\u00e4ischen Zeitzonen",
      "Echte Verantwortung und kurze Entscheidungswege in einem kleinen Team",
      "Ein Produkt mit klarem Problem: Agenten-Aktionen kontrollierbar machen",
      "Verg\u00fctung und Konditionen besprechen wir offen im ersten Gespr\u00e4ch",
    ] },
    { h: "So l\u00e4uft die Bewerbung", ul: [
      "Kurzes Kennenlernen (30 Minuten)",
      "Fachgespr\u00e4ch \u00fcber echten Code",
      "Kurze gemeinsame Arbeitssession",
      "Angebot",
    ] },
  ],
  applyTitle: "Bewirb dich",
  applyBody: "Schick uns deinen Lebenslauf, einen Link zu GitHub oder Projekten, auf die du stolz bist, und ein paar Zeilen dazu, woran du gern arbeiten w\u00fcrdest.",
  applyBtn: "Per E-Mail bewerben",
  subject: "Bewerbung: Founding Full-Stack Engineer",
};

const COUNTRIES = ["Germany", "Austria", "Switzerland", "Netherlands", "Belgium", "France", "Spain", "Italy", "Portugal", "Ireland", "Poland", "Sweden", "Denmark", "Finland"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = locale === "de" ? DE_ : EN;
  return meta(c.metaTitle, c.metaDesc);
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  const c = locale === "de" ? DE_ : EN;
  const ld = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Founding Full-Stack Engineer",
    description: "<p>" + EN.sections[0].p + "</p><p>" + EN.sections[1].p + "</p><ul>" + (EN.sections[2].ul ?? []).map((x) => "<li>" + x + "</li>").join("") + "</ul>",
    datePosted: "2026-11-08",
    validThrough: "2027-02-28T23:59:59Z",
    employmentType: "FULL_TIME",
    directApply: false,
    hiringOrganization: { "@type": "Organization", name: "Aegisora", sameAs: "https://aegisora.org" },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: COUNTRIES.map((n) => ({ "@type": "Country", name: n })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Hero compact badge={c.badge} title={c.title} intro={c.intro} />
      <Sec flush>
        <Cells n={3}>
          {c.facts.map((f, i) => (
            <Cell key={f[0]} num={String(i + 1).padStart(2, "0")} title={f[0]}>{f[1]}</Cell>
          ))}
        </Cells>
      </Sec>
      <Sec flush>
        <article className="aegx-art">
          {c.sections.map((s) => (
            <div key={s.h}>
              <h2 className="aegx-art__h2">{s.h}</h2>
              {s.p ? <p className="aegx-art__p">{s.p}</p> : null}
              {s.ul ? <ul className="aegx-art__ul">{s.ul.map((x) => (<li key={x}>{x}</li>))}</ul> : null}
            </div>
          ))}
        </article>
      </Sec>
      <Sec flush>
        <div className="aegx-band">
          <div>
            <h3 className="aegx-h3">{c.applyTitle}</h3>
            <p className="aegx-p">{c.applyBody}</p>
          </div>
          <div className="aegx-band__act">
            <a className="aegx-btn aegx-btn--solid" href={"mailto:" + MAIL + "?subject=" + encodeURIComponent(c.subject)}>{c.applyBtn}</a>
          </div>
        </div>
      </Sec>
    </>
  );
}