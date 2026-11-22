export type Cta = { label: string; href: string; variant?: "primary" | "ghost" };
export type Item = { title: string; body: string; tag?: string };
export type Plan = {
  name: string;
  price: string;
  period: string;
  blurb: string;
  features: string[];
  cta: Cta;
  highlight?: boolean;
};
export type Section =
  | { kind: "cards"; title: string; intro?: string; items: Item[]; cols?: 2 | 3 | 4 }
  | { kind: "steps"; title: string; intro?: string; items: Item[] }
  | { kind: "table"; title: string; intro?: string; columns: string[]; rows: string[][] }
  | { kind: "plans"; title: string; intro?: string }
  | { kind: "faq"; title: string; items: Item[] }
  | { kind: "prose"; title: string; paragraphs: string[] }
  | { kind: "pilotform"; title: string; intro?: string }
  | { kind: "cta"; title: string; body: string; ctas: Cta[] };
export type PageData = {
  eyebrow: string;
  title: string;
  lead: string;
  ctas?: Cta[];
  notice?: string;
  noindex?: boolean;
  metaTitle: string;
  metaDescription: string;
  sections: Section[];
};

// ---------------------------------------------------------------- tek yerden duzenle
export const CONTACT_EMAIL = "eray@aegisora.org";

const applyCta: Cta = { label: "Apply for Enterprise Pilot", href: "/pilot" };
const docsCta: Cta = { label: "Read the technical docs", href: "/docs/technical", variant: "ghost" };

export const PLANS: Plan[] = [
  {
    name: "Developer",
    price: "Free",
    period: "",
    blurb: "Evaluate Aegisora on a non-production agent.",
    features: ["Core runtime governance", "Decision and evidence view", "Community support"],
    cta: { label: "Request access", href: "/pilot", variant: "ghost" },
  },
  {
    name: "Pro",
    price: "\u20ac49",
    period: "/ month",
    blurb: "For individual developers and small projects.",
    features: ["Everything in Developer", "Extended evidence retention", "Email support"],
    cta: { label: "Request access", href: "/pilot", variant: "ghost" },
  },
  {
    name: "Team",
    price: "\u20ac199",
    period: "/ month",
    blurb: "For small AI teams sharing governed agents.",
    features: ["Everything in Pro", "Multiple members and roles", "Shared policies and audit trail"],
    cta: { label: "Request access", href: "/pilot" },
    highlight: true,
  },
  {
    name: "Business",
    price: "From \u20ac799",
    period: "/ month",
    blurb: "For companies running agents in production.",
    features: ["Everything in Team", "Production onboarding support", "Priority support"],
    cta: { label: "Request access", href: "/pilot", variant: "ghost" },
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For organizations with security and procurement requirements.",
    features: ["Scoped pilot first", "Security review and architecture call", "Custom terms and support"],
    cta: { label: "Apply for Enterprise Pilot", href: "/pilot", variant: "ghost" },
  },
];

// ---------------------------------------------------------------- sayfalar
const platform: PageData = {
  eyebrow: "Platform",
  title: "Runtime governance for AI agents",
  lead:
    "Aegisora sits between your AI agents and the systems they act on. Every action is tied to an identity, decided against policy, and recorded as verifiable evidence.",
  ctas: [applyCta, docsCta],
  metaTitle: "Platform",
  metaDescription: "Aegisora is a runtime governance platform for AI agents: identity, policy decisions, execution integrity and evidence.",
  sections: [
    {
      kind: "cards",
      title: "What the platform does",
      items: [
        { title: "Identity and decisions", body: "Each agent action is attributed to an identity and receives an explicit decision." },
        { title: "Policy enforcement", body: "Policies are enforced at runtime, before an action reaches the system it targets." },
        { title: "Execution continuity", body: "Continuity Seal extends governance from authorization into the integrity of the execution itself." },
        { title: "Evidence and audit", body: "Decisions and executions produce evidence that can be reviewed and verified." },
        { title: "Enterprise governance", body: "Organization-level control over agents, policies and approvals." },
        { title: "Developer-first integration", body: "Packages and integrations designed to fit existing agent stacks." },
      ],
    },
    {
      kind: "steps",
      title: "How it fits into your stack",
      items: [
        { title: "Connect your agents", body: "Route agent actions through Aegisora." },
        { title: "Define policy", body: "Describe what each agent may and may not do." },
        { title: "Enforce at runtime", body: "Actions are allowed, denied or sent for approval as they happen." },
        { title: "Review the evidence", body: "Inspect decisions and verify evidence." },
      ],
    },
    {
      kind: "cta",
      title: "See it on your own agents",
      body: "The Enterprise Pilot Program is a scoped evaluation measured against success criteria you agree up front.",
      ctas: [applyCta, docsCta],
    },
  ],
};

const solutions: PageData = {
  eyebrow: "Solutions",
  title: "Built for teams that put agents to work",
  lead: "From first tool-calling agent to a governed fleet, Aegisora gives each team the control it needs.",
  ctas: [applyCta],
  metaTitle: "Solutions",
  metaDescription: "How AI platform, security and engineering teams use Aegisora to govern agents in production.",
  sections: [
    {
      kind: "cards",
      title: "By team",
      cols: 3,
      items: [
        { title: "AI platform teams", body: "Give every agent a consistent control layer instead of per-project guardrails." },
        { title: "Security and compliance", body: "Get decisions, approvals and evidence in one place for review and audit." },
        { title: "Engineering leaders", body: "Move agents from prototype to production with clear boundaries and accountability." },
      ],
    },
    {
      kind: "cards",
      title: "By use case",
      cols: 3,
      items: [
        { title: "Agents with access to internal systems", body: "Restrict which tools and data an agent may touch, and record what it did." },
        { title: "Multi-agent workflows", body: "Keep identity and authority clear when agents delegate to other agents." },
        { title: "Environments that require an audit trail", body: "Produce evidence for reviews without building custom logging for every agent." },
      ],
    },
    {
      kind: "cta",
      title: "Not sure where to start?",
      body: "Describe your agents and environment in the pilot application and we will scope an evaluation with you.",
      ctas: [applyCta],
    },
  ],
};

const security: PageData = {
  eyebrow: "Security",
  title: "Security you can inspect",
  lead: "Aegisora is a security product, so its own claims should be checkable. We publish how it works and share evidence during evaluation.",
  ctas: [docsCta, { label: "Apply for Enterprise Pilot", href: "/pilot" }],
  metaTitle: "Security",
  metaDescription: "How Aegisora approaches security, evidence and verification, and where to find trust documents.",
  sections: [
    {
      kind: "cards",
      title: "Principles",
      cols: 2,
      items: [
        { title: "Explicit decisions", body: "Agent actions are allowed or denied by policy, never implicitly." },
        { title: "Verifiable evidence", body: "Evidence is designed to be checked independently of the platform that produced it." },
        { title: "Execution integrity", body: "Continuity Seal addresses whether an execution stayed within what was authorized." },
        { title: "Transparent documentation", body: "The technical documentation describes the pipeline, identities and evidence model." },
      ],
    },
    {
      kind: "table",
      title: "Trust documents",
      intro: "Documents for security reviews. Items marked Draft are being finalized and are available on request.",
      columns: ["Document", "Status"],
      rows: [
        ["Technical documentation", "Available"],
        ["Privacy policy", "Draft"],
        ["Data processing terms", "Draft"],
        ["Terms of service", "Draft"],
        ["Security evidence package", "Shared during pilot"],
      ],
    },
    {
      kind: "prose",
      title: "Reporting a vulnerability",
      paragraphs: ["If you believe you found a security issue, email " + CONTACT_EMAIL + " with details. Please do not disclose it publicly until we have had a chance to respond."],
    },
  ],
};

const pricing: PageData = {
  eyebrow: "Pricing",
  title: "Start small, scale with your agents",
  lead: "A free tier to evaluate, paid plans for teams, and custom terms for enterprises.",
  notice: "Pilot-phase pricing. Plans are confirmed per scope during the pilot and may change before general availability.",
  metaTitle: "Pricing",
  metaDescription: "Aegisora plans: Developer, Pro, Team, Business and Enterprise.",
  sections: [
    { kind: "plans", title: "Plans" },
    {
      kind: "faq",
      title: "Questions",
      items: [
        { title: "Is the enterprise pilot paid?", body: "Pilots are scoped and time-boxed. Scope, duration, success metrics and the price for continuing after the pilot are agreed in writing before it starts." },
        { title: "How is enterprise pricing determined?", body: "By the number of governed agents, the environments involved and the support and security requirements." },
        { title: "Can we try it before committing?", body: "Yes. Request access or apply for the pilot and we will agree an evaluation scope with you." },
      ],
    },
    {
      kind: "cta",
      title: "Need something specific?",
      body: "Tell us about your agents and environment.",
      ctas: [applyCta],
    },
  ],
};

const enterprise: PageData = {
  eyebrow: "Enterprise",
  title: "Aegisora for enterprise",
  lead: "Governance, auditability and a structured path from evaluation to production.",
  ctas: [applyCta, docsCta],
  metaTitle: "Enterprise",
  metaDescription: "Enterprise governance for AI agents with a scoped pilot program.",
  sections: [
    {
      kind: "cards",
      title: "What enterprises get",
      cols: 2,
      items: [
        { title: "Governance at scale", body: "Organization-level policies, roles and approvals for agents across teams." },
        { title: "Auditability", body: "Decisions and evidence you can review, export and verify." },
        { title: "Security review support", body: "Architecture walkthroughs and answers to your security questionnaire during the pilot." },
        { title: "Defined commercial path", body: "Pilot results are measured against agreed metrics before any subscription starts." },
      ],
    },
    {
      kind: "steps",
      title: "From pilot to production",
      items: [
        { title: "Scoping call", body: "We agree agents, environment and success metrics." },
        { title: "Scoped pilot", body: "A time-boxed evaluation on your agents." },
        { title: "Results review", body: "We review outcomes against the agreed metrics together." },
        { title: "Decision", body: "Continue on a subscription, adjust scope, or stop." },
      ],
    },
    { kind: "cta", title: "Start with a scoped pilot", body: "No long-term commitment is required to apply.", ctas: [applyCta] },
  ],
};

const pilot: PageData = {
  eyebrow: "Enterprise Pilot Program",
  title: "Prove it on your own agents",
  lead: "A scoped, time-boxed evaluation of Aegisora, measured against success criteria agreed in writing before it starts.",
  metaTitle: "Enterprise Pilot Program",
  metaDescription: "Apply for the Aegisora Enterprise Pilot Program: a scoped, time-boxed evaluation on your own AI agents.",
  sections: [
    {
      kind: "steps",
      title: "How the pilot works",
      items: [
        { title: "Apply", body: "Tell us about your agents and what you want to prove." },
        { title: "Scoping", body: "We agree the scope and success metrics in writing." },
        { title: "Pilot", body: "Aegisora runs on your agents for the agreed period." },
        { title: "Review", body: "We evaluate results against the agreed metrics." },
        { title: "Decision", body: "Continue as a customer, adjust, or stop." },
      ],
    },
    {
      kind: "cards",
      title: "Agreed before the pilot starts",
      cols: 3,
      items: [
        { title: "Agents and environment", body: "Which agents and which environment are in scope." },
        { title: "Setup and support", body: "What setup and support is included." },
        { title: "Success metrics", body: "How success is measured." },
        { title: "Duration", body: "Start and end dates." },
        { title: "Conversion terms", body: "The price if you continue after the pilot." },
        { title: "Data handling", body: "What data is processed and how it is handled." },
      ],
    },
    { kind: "pilotform", title: "Apply for the pilot", intro: "We reply by email, usually within a few business days." },
  ],
};

const about: PageData = {
  eyebrow: "About",
  title: "Why Aegisora exists",
  lead: "AI agents are starting to act on real systems. Aegisora makes sure those actions are governed, provable and reviewable.",
  ctas: [{ label: "Contact us", href: "mailto:" + CONTACT_EMAIL, variant: "ghost" }, applyCta],
  metaTitle: "About",
  metaDescription: "About Aegisora, a runtime governance platform for AI agents.",
  sections: [
    {
      kind: "prose",
      title: "Our focus",
      paragraphs: [
        "Aegisora builds runtime governance for AI agents: identity, policy decisions, execution integrity and verifiable evidence.",
        "We develop in the open where we can, publish technical documentation, and prefer claims that can be verified over claims that cannot.",
      ],
    },
  ],
};

const draftNotice = "Draft pending legal review. Complete the bracketed fields before sharing with customers.";

const legalPrivacy: PageData = {
  eyebrow: "Legal",
  title: "Privacy policy",
  lead: "How Aegisora handles personal data on this website and in the pilot program.",
  notice: draftNotice,
  noindex: true,
  metaTitle: "Privacy policy",
  metaDescription: "Aegisora privacy policy (draft).",
  sections: [
    { kind: "prose", title: "Controller", paragraphs: ["[LEGAL ENTITY NAME AND POSTAL ADDRESS - to be completed]", "Contact: " + CONTACT_EMAIL] },
    {
      kind: "prose",
      title: "Data we process",
      paragraphs: [
        "Website visits: technical data processed by our hosting provider to deliver the site.",
        "Pilot applications: name, work email, company, role, company size, a description of your environment and use case, and your language setting.",
        "Pilot accounts: [data categories to be completed once the account system is final].",
      ],
    },
    { kind: "prose", title: "Purposes and legal bases", paragraphs: ["Handling pilot applications and communicating with applicants. [Legal bases under GDPR to be confirmed by counsel.]"] },
    { kind: "prose", title: "Processors", paragraphs: ["Hosting: Vercel. Database: Supabase. [Data regions and transfer mechanisms to be completed.]"] },
    { kind: "prose", title: "Retention", paragraphs: ["[Retention periods to be defined.]"] },
    {
      kind: "prose",
      title: "Your rights",
      paragraphs: ["You may request access, correction, deletion, restriction, portability and object to processing, and you may complain to your supervisory authority. Contact " + CONTACT_EMAIL + "."],
    },
  ],
};

const legalTerms: PageData = {
  eyebrow: "Legal",
  title: "Terms of service",
  lead: "Terms for using this website and the Aegisora service.",
  notice: draftNotice,
  noindex: true,
  metaTitle: "Terms of service",
  metaDescription: "Aegisora terms of service (draft).",
  sections: [
    { kind: "prose", title: "Provider", paragraphs: ["[LEGAL ENTITY NAME AND POSTAL ADDRESS - to be completed]"] },
    { kind: "prose", title: "Service", paragraphs: ["[Description of the service, availability, acceptable use, fees, liability and governing law to be completed by counsel.]"] },
    { kind: "prose", title: "Pilot agreements", paragraphs: ["Enterprise pilots are governed by a written pilot agreement that sets scope, duration, success metrics and conversion terms."] },
  ],
};

const legalDpa: PageData = {
  eyebrow: "Legal",
  title: "Data processing terms",
  lead: "How Aegisora processes customer data on a customer's behalf.",
  notice: draftNotice,
  noindex: true,
  metaTitle: "Data processing terms",
  metaDescription: "Aegisora data processing terms (draft).",
  sections: [
    { kind: "prose", title: "Roles", paragraphs: ["[Customer as controller and Aegisora as processor - wording to be confirmed by counsel.]"] },
    { kind: "prose", title: "Subprocessors", paragraphs: ["Vercel (hosting) and Supabase (database). [Regions to be completed.]"] },
    { kind: "prose", title: "Security measures", paragraphs: ["See the Security page and the technical documentation. [Detailed technical and organizational measures to be completed.]"] },
    { kind: "prose", title: "Deletion and return", paragraphs: ["[Process and timelines for deletion or return of customer data to be defined.]"] },
  ],
};

export const PAGES = {
  platform,
  solutions,
  security,
  pricing,
  enterprise,
  pilot,
  about,
  legalPrivacy,
  legalTerms,
  legalDpa,
};

// ---------------------------------------------------------------- Deutsche Seiten (pilot, solutions)
const applyCtaDe: Cta = { label: "Enterprise-Pilot beantragen", href: "/pilot" };

const solutionsDe: PageData = {
  eyebrow: "Lösungen",
  title: "Für Teams, die Agenten produktiv einsetzen",
  lead: "Vom ersten Agenten mit Tool-Zugriff bis zur gesteuerten Agentenflotte: Aegisora gibt jedem Team die Kontrolle, die es braucht.",
  ctas: [applyCtaDe],
  metaTitle: "Lösungen",
  metaDescription: "Wie KI-Plattform-, Sicherheits- und Engineering-Teams Aegisora nutzen, um Agenten in der Produktion zu steuern.",
  sections: [
    {
      kind: "cards",
      title: "Nach Team",
      cols: 3,
      items: [
        { title: "KI-Plattform-Teams", body: "Geben Sie jedem Agenten eine einheitliche Kontrollschicht statt Leitplanken pro Projekt." },
        { title: "Sicherheit und Compliance", body: "Entscheidungen, Freigaben und Nachweise an einem Ort für Prüfung und Audit." },
        { title: "Engineering-Leitung", body: "Bringen Sie Agenten mit klaren Grenzen und Verantwortlichkeiten vom Prototyp in die Produktion." },
      ],
    },
    {
      kind: "cards",
      title: "Nach Anwendungsfall",
      cols: 3,
      items: [
        { title: "Agenten mit Zugriff auf interne Systeme", body: "Legen Sie fest, welche Tools und Daten ein Agent berühren darf, und protokollieren Sie, was er getan hat." },
        { title: "Multi-Agenten-Workflows", body: "Halten Sie Identität und Befugnisse klar, wenn Agenten Aufgaben an andere Agenten delegieren." },
        { title: "Umgebungen mit Audit-Pflicht", body: "Erzeugen Sie Nachweise für Prüfungen, ohne für jeden Agenten eigenes Logging zu bauen." },
      ],
    },
    {
      kind: "cta",
      title: "Unsicher, wo Sie anfangen sollen?",
      body: "Beschreiben Sie Ihre Agenten und Ihre Umgebung im Pilotantrag, dann legen wir gemeinsam einen Evaluierungsumfang fest.",
      ctas: [applyCtaDe],
    },
  ],
};

const pilotDe: PageData = {
  eyebrow: "Enterprise-Pilotprogramm",
  title: "Beweisen Sie es an Ihren eigenen Agenten",
  lead: "Eine abgegrenzte, zeitlich begrenzte Evaluierung von Aegisora, gemessen an Erfolgskriterien, die vor dem Start schriftlich vereinbart werden.",
  metaTitle: "Enterprise-Pilotprogramm",
  metaDescription: "Beantragen Sie das Aegisora Enterprise-Pilotprogramm: eine abgegrenzte, zeitlich begrenzte Evaluierung an Ihren eigenen KI-Agenten.",
  sections: [
    {
      kind: "steps",
      title: "So funktioniert der Pilot",
      items: [
        { title: "Bewerben", body: "Erzählen Sie uns von Ihren Agenten und davon, was Sie nachweisen möchten." },
        { title: "Abgrenzung", body: "Wir vereinbaren Umfang und Erfolgskennzahlen schriftlich." },
        { title: "Pilot", body: "Aegisora läuft für den vereinbarten Zeitraum auf Ihren Agenten." },
        { title: "Auswertung", body: "Wir bewerten die Ergebnisse anhand der vereinbarten Kennzahlen." },
        { title: "Entscheidung", body: "Als Kunde fortfahren, anpassen oder beenden." },
      ],
    },
    {
      kind: "cards",
      title: "Vor Pilotbeginn vereinbart",
      cols: 3,
      items: [
        { title: "Agenten und Umgebung", body: "Welche Agenten und welche Umgebung im Umfang enthalten sind." },
        { title: "Einrichtung und Support", body: "Welche Einrichtung und welcher Support enthalten sind." },
        { title: "Erfolgskennzahlen", body: "Wie Erfolg gemessen wird." },
        { title: "Laufzeit", body: "Start- und Enddatum." },
        { title: "Konditionen bei Fortführung", body: "Der Preis, wenn Sie nach dem Pilot fortfahren." },
        { title: "Datenverarbeitung", body: "Welche Daten verarbeitet werden und wie damit umgegangen wird." },
      ],
    },
    { kind: "pilotform", title: "Pilot beantragen", intro: "Wir antworten per E-Mail, in der Regel innerhalb weniger Werktage." },
  ],
};

export const PAGES_DE = {
  solutions: solutionsDe,
  pilot: pilotDe,
};
