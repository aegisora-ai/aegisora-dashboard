<#
  Aegisora - Install-SitePages.ps1
  Calistir: website4 klasorunde
    powershell -ExecutionPolicy Bypass -File .\Install-SitePages.ps1
  Mevcut sayfalarin uzerine yazmaz (-Force vermedikce). Yazmadan once yedek alir.
#>
[CmdletBinding()]
param(
  [switch]$Force,
  [switch]$SkipTsc
)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
if (-not [System.IO.File]::Exists((Join-Path $root 'package.json'))) { throw 'package.json yok. Scripti website4 klasorunde calistir.' }

$src = Join-Path $root 'src'
$pub = Join-Path $src 'app\[locale]\(public)'
if (-not [System.IO.Directory]::Exists($pub)) { throw "Bulunamadi: $pub" }
$localeRoot = Join-Path $src 'app\[locale]'
$compDir = Join-Path $src 'components\aegisora\site'
$apiDir = Join-Path $src 'app\api\pilot-request'
$sqlDir = Join-Path $root 'sql'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $root "docs\backups\site-$stamp"
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Backup-File([string]$path) {
  if ([System.IO.File]::Exists($path)) {
    [void][System.IO.Directory]::CreateDirectory($backupDir)
    $name = ($path.Substring($root.Length).Trim('\') -replace '[\\\[\]\(\)]', '_')
    Copy-Item -LiteralPath $path -Destination (Join-Path $backupDir $name) -Force
  }
}
function Write-Text([string]$path, [string]$text) {
  [void][System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($path))
  Backup-File $path
  [System.IO.File]::WriteAllText($path, $text, $utf8)
}

Write-Host ''
Write-Host 'AEGISORA SITE KURULUMU' -ForegroundColor Cyan
Write-Host "public klasoru : $pub"

# ---------------------------------------------------------------- mevcut rotalar
$existing = @{}
Get-ChildItem -LiteralPath $localeRoot -Recurse -File -Filter 'page.tsx' | ForEach-Object {
  $rel = $_.DirectoryName.Substring($localeRoot.Length).Trim('\')
  $segs = @($rel -split '\\' | Where-Object { $_ -and $_ -notmatch '^\(.*\)$' })
  $existing[($segs -join '/')] = $_.FullName
}

# ================================================================ ORTAK DOSYALAR
$contentTs = @'
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
export const CONTACT_EMAIL = "hello.aegisora@gmail.com";

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
'@

$pageViewTsx = @'
import Link from "next/link";
import styles from "./site.module.css";
import PilotForm from "./PilotForm";
import { PLANS, type Cta, type PageData, type Section } from "./content";

function to(locale: string, href: string): string {
  return href.startsWith("/") ? "/" + locale + href : href;
}

function Buttons({ ctas, locale }: { ctas: Cta[]; locale: string }) {
  return (
    <div className={styles.ctaRow}>
      {ctas.map((c) => (
        <Link
          key={c.label}
          href={to(locale, c.href)}
          className={c.variant === "ghost" ? styles.btnGhost : styles.btnPrimary}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

function SectionView({ s, locale }: { s: Section; locale: string }) {
  switch (s.kind) {
    case "cards": {
      const colClass = s.cols === 2 ? styles.grid2 : s.cols === 4 ? styles.grid4 : styles.grid3;
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={colClass}>
            {s.items.map((it) => (
              <div key={it.title} className={styles.card}>
                {it.tag ? <span className={styles.tag}>{it.tag}</span> : null}
                <h3 className={styles.h3}>{it.title}</h3>
                <p className={styles.body}>{it.body}</p>
              </div>
            ))}
          </div>
        </>
      );
    }
    case "steps":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <ol className={styles.steps}>
            {s.items.map((it, i) => (
              <li key={it.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div>
                  <h3 className={styles.h3}>{it.title}</h3>
                  <p className={styles.body}>{it.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      );
    case "table":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {s.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    case "plans":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={styles.plans}>
            {PLANS.map((p) => (
              <div key={p.name} className={p.highlight ? styles.planHi : styles.plan}>
                <h3 className={styles.h3}>{p.name}</h3>
                <p className={styles.price}>
                  {p.price} <span className={styles.period}>{p.period}</span>
                </p>
                <p className={styles.body}>{p.blurb}</p>
                <ul className={styles.features}>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Buttons ctas={[p.cta]} locale={locale} />
              </div>
            ))}
          </div>
        </>
      );
    case "faq":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          <div className={styles.faq}>
            {s.items.map((it) => (
              <details key={it.title} className={styles.details}>
                <summary>{it.title}</summary>
                <p className={styles.body}>{it.body}</p>
              </details>
            ))}
          </div>
        </>
      );
    case "prose":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className={styles.proseP}>
              {p}
            </p>
          ))}
        </>
      );
    case "pilotform":
      return (
        <>
          <h2 id="apply" className={styles.h2}>
            {s.title}
          </h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <PilotForm locale={locale} />
        </>
      );
    case "cta":
      return (
        <div className={styles.ctaBox}>
          <h2 className={styles.h2}>{s.title}</h2>
          <p className={styles.intro}>{s.body}</p>
          <Buttons ctas={s.ctas} locale={locale} />
        </div>
      );
    default:
      return null;
  }
}

export default function PageView({ page, locale }: { page: PageData; locale: string }) {
  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.h1}>{page.title}</h1>
          <p className={styles.lead}>{page.lead}</p>
          {page.ctas ? <Buttons ctas={page.ctas} locale={locale} /> : null}
          {page.notice ? <p className={styles.notice}>{page.notice}</p> : null}
        </div>
      </div>
      {page.sections.map((s, i) => (
        <div key={i} className={styles.section}>
          <div className={styles.wrap}>
            <SectionView s={s} locale={locale} />
          </div>
        </div>
      ))}
    </div>
  );
}
'@

$pilotFormTsx = @'
"use client";

import { useState, type FormEvent } from "react";
import styles from "./site.module.css";

const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

export default function PilotForm({ locale }: { locale: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState("error");
        setMessage(json.error ?? "Something went wrong. Please try again or email us.");
        return;
      }
      form.reset();
      setState("done");
    } catch {
      setState("error");
      setMessage("Network error. Please try again or email us.");
    }
  }

  if (state === "done") {
    return (
      <div className={styles.formOk}>
        <h3 className={styles.h3}>Application received</h3>
        <p className={styles.body}>Thank you. We will review it and reply by email.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="pf-name">Full name</label>
          <input id="pf-name" name="full_name" required maxLength={120} autoComplete="name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-email">Work email</label>
          <input id="pf-email" name="work_email" type="email" required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="pf-company">Company</label>
          <input id="pf-company" name="company" required maxLength={160} autoComplete="organization" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-role">Your role</label>
          <input id="pf-role" name="role_title" maxLength={120} autoComplete="organization-title" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-size">Company size</label>
        <select id="pf-size" name="company_size" defaultValue="">
          <option value="">Select</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-env">Agents and environment</label>
        <textarea
          id="pf-env"
          name="environment"
          rows={3}
          maxLength={2000}
          placeholder="Which agents, frameworks and systems are involved?"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="pf-use">What do you want to prove in the pilot?</label>
        <textarea id="pf-use" name="use_case" rows={4} required maxLength={3000} />
      </div>
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="pf-web">Website</label>
        <input id="pf-web" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className={styles.check}>
        <input type="checkbox" name="consent" required />
        <span>I agree that Aegisora may process this information to answer my application.</span>
      </label>
      <button type="submit" className={styles.btnPrimary} disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Submit application"}
      </button>
      {state === "error" ? (
        <p className={styles.formErr} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
'@

$cssModule = @'
.root {
  --bg: #0a1330;
  --panel: #101c42;
  --panel2: #14235a;
  --line: #22336b;
  --text: #e8edff;
  --muted: #a8b4dc;
  --accent: #4f8cff;
  --accent2: #7cc4ff;
  background: var(--bg);
  color: var(--text);
  width: 100%;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
}
.wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.hero { padding: 88px 0 56px; border-bottom: 1px solid var(--line); background: radial-gradient(1200px 400px at 20% -10%, #17307a55, transparent); }
.eyebrow { color: var(--accent2); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 12px; font-weight: 600; }
.h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin: 0 0 18px; color: var(--text); font-weight: 700; letter-spacing: -0.02em; }
.lead { font-size: 19px; color: var(--muted); max-width: 760px; margin: 0 0 26px; }
.notice { margin: 22px 0 0; padding: 12px 16px; border: 1px solid var(--line); border-left: 3px solid var(--accent); background: var(--panel); border-radius: 8px; color: var(--muted); font-size: 14px; max-width: 760px; }
.ctaRow { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
.btnPrimary, .btnGhost { display: inline-block; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; border: 1px solid var(--accent); }
.btnPrimary { background: var(--accent); color: #fff; }
.btnPrimary:hover { background: #3f7bf0; }
.btnPrimary:disabled { opacity: 0.6; cursor: wait; }
.btnGhost { background: transparent; color: var(--text); border-color: var(--line); }
.btnGhost:hover { border-color: var(--accent); }
.section { padding: 56px 0; border-bottom: 1px solid var(--line); }
.section:last-child { border-bottom: 0; }
.h2 { font-size: 28px; margin: 0 0 12px; color: var(--text); font-weight: 650; letter-spacing: -0.01em; }
.h3 { font-size: 17px; margin: 0 0 6px; color: var(--text); font-weight: 600; }
.intro { color: var(--muted); max-width: 720px; margin: 0 0 24px; }
.body { color: var(--muted); margin: 0; font-size: 15px; }
.proseP { color: var(--muted); max-width: 760px; margin: 0 0 14px; }
.grid2, .grid3, .grid4 { display: grid; gap: 16px; margin-top: 24px; }
.grid2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.grid4 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
.tag { display: inline-block; font-size: 11px; color: var(--accent2); border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px; margin-bottom: 8px; }
.steps { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 14px; }
.step { display: flex; gap: 16px; align-items: flex-start; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
.stepNum { flex: 0 0 34px; height: 34px; border-radius: 50%; background: var(--panel2); border: 1px solid var(--accent); color: var(--accent2); display: grid; place-items: center; font-weight: 700; }
.tableWrap { overflow-x: auto; margin-top: 20px; border: 1px solid var(--line); border-radius: 14px; }
.table { width: 100%; border-collapse: collapse; font-size: 15px; }
.table th, .table td { text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.table th { background: var(--panel2); color: var(--text); font-weight: 600; }
.table td { color: var(--muted); }
.table tr:last-child td { border-bottom: 0; }
.plans { display: grid; gap: 16px; margin-top: 24px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.plan, .planHi { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; gap: 10px; }
.planHi { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
.price { font-size: 28px; font-weight: 700; margin: 0; color: var(--text); }
.period { font-size: 13px; color: var(--muted); font-weight: 400; }
.features { list-style: none; padding: 0; margin: 4px 0 10px; display: grid; gap: 6px; color: var(--muted); font-size: 14px; flex: 1; }
.features li::before { content: "+ "; color: var(--accent2); }
.faq { display: grid; gap: 10px; margin-top: 20px; }
.details { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px; }
.details summary { cursor: pointer; font-weight: 600; color: var(--text); }
.details p { margin-top: 10px; }
.ctaBox { background: linear-gradient(135deg, var(--panel2), var(--panel)); border: 1px solid var(--line); border-radius: 18px; padding: 36px; }
.form { display: grid; gap: 16px; max-width: 760px; margin-top: 24px; }
.formRow { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.field { display: grid; gap: 6px; }
.field label { font-size: 14px; color: var(--text); font-weight: 600; }
.field input, .field select, .field textarea { background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; font: inherit; width: 100%; box-sizing: border-box; }
.field input:focus, .field select:focus, .field textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.check { display: flex; gap: 10px; align-items: flex-start; color: var(--muted); font-size: 14px; }
.check input { margin-top: 4px; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.formErr { color: #ff8f8f; margin: 0; }
.formOk { background: var(--panel); border: 1px solid var(--accent); border-radius: 14px; padding: 24px; max-width: 760px; margin-top: 24px; }
@media (max-width: 640px) {
  .hero { padding: 56px 0 36px; }
  .section { padding: 40px 0; }
  .ctaBox { padding: 24px; }
}
'@

$routeTs = @'
export const runtime = "nodejs";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return Response.json({ error: "Unsupported content type." }, { status: 415 });
  }

  const ip = ((req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0] ?? "unknown").trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 20000) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend success.
  if (clean(body.website, 200)) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const row = {
    full_name: clean(body.full_name, 120),
    work_email: clean(body.work_email, 200).toLowerCase(),
    company: clean(body.company, 160),
    role_title: clean(body.role_title, 120) || null,
    company_size: clean(body.company_size, 20) || null,
    environment: clean(body.environment, 2000) || null,
    use_case: clean(body.use_case, 3000),
    locale: clean(body.locale, 10) || null,
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.work_email);
  if (!row.full_name || !row.company || !row.use_case || !emailOk) {
    return Response.json({ error: "Please fill in name, a valid work email, company and goal." }, { status: 400 });
  }
  if (!(body.consent === "on" || body.consent === true)) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("pilot-request: Supabase env vars missing");
    return Response.json({ error: "Applications are temporarily unavailable. Please email us." }, { status: 503 });
  }

  try {
    const res = await fetch(url + "/rest/v1/pilot_requests", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.error("pilot-request: insert failed", res.status);
      return Response.json({ error: "Could not save your application. Please email us." }, { status: 502 });
    }
  } catch (err) {
    console.error("pilot-request: insert error", err);
    return Response.json({ error: "Could not save your application. Please email us." }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
'@

$pageTpl = @'
import type { Metadata } from "next";
import PageView from "__REL__components/aegisora/site/PageView";
import { PAGES } from "__REL__components/aegisora/site/content";

const page = PAGES.__KEY__;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  robots: page.noindex ? { index: false, follow: false } : undefined,
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PageView page={page} locale={locale} />;
}
'@

$sql = @'
-- Pilot applications submitted from /pilot. Run once in the Supabase SQL editor.
create table if not exists public.pilot_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) <= 120),
  work_email text not null check (char_length(work_email) <= 200),
  company text not null check (char_length(company) <= 160),
  role_title text check (char_length(role_title) <= 120),
  company_size text check (char_length(company_size) <= 20),
  environment text check (char_length(environment) <= 2000),
  use_case text not null check (char_length(use_case) <= 3000),
  locale text check (char_length(locale) <= 10),
  status text not null default 'new'
);

-- RLS on, no policies: only the server (service role) can read or write.
alter table public.pilot_requests enable row level security;
revoke all on public.pilot_requests from anon, authenticated;
'@

# ================================================================ YAZ
Write-Host ''
Write-Host 'Ortak dosyalar yaziliyor...'
Write-Text (Join-Path $compDir 'content.ts') $contentTs
Write-Text (Join-Path $compDir 'PageView.tsx') $pageViewTsx
Write-Text (Join-Path $compDir 'PilotForm.tsx') $pilotFormTsx
Write-Text (Join-Path $compDir 'site.module.css') $cssModule
Write-Text (Join-Path $apiDir 'route.ts') $routeTs
Write-Text (Join-Path $sqlDir 'pilot_requests.sql') $sql
Write-Host "  bilesenler : $compDir"
Write-Host "  api        : $apiDir\route.ts"
Write-Host "  sql        : $sqlDir\pilot_requests.sql"

$base = @($pub.Substring($src.Length).Trim('\') -split '\\').Count

$pages = @(
  @{ Slug = 'platform';      Key = 'platform' },
  @{ Slug = 'solutions';     Key = 'solutions' },
  @{ Slug = 'security';      Key = 'security' },
  @{ Slug = 'pricing';       Key = 'pricing' },
  @{ Slug = 'enterprise';    Key = 'enterprise' },
  @{ Slug = 'pilot';         Key = 'pilot' },
  @{ Slug = 'about';         Key = 'about' },
  @{ Slug = 'legal/privacy'; Key = 'legalPrivacy' },
  @{ Slug = 'legal/terms';   Key = 'legalTerms' },
  @{ Slug = 'legal/dpa';     Key = 'legalDpa' }
)

Write-Host ''
Write-Host 'Sayfalar:'
$created = @(); $skipped = @()
foreach ($p in $pages) {
  $slug = $p.Slug
  $segCount = @($slug -split '/').Count
  $rel = '../' * ($base + $segCount)
  $dir = Join-Path $pub ($slug -replace '/', '\')
  $file = Join-Path $dir 'page.tsx'

  if ($existing.ContainsKey($slug)) {
    if ($existing[$slug] -ne $file) {
      Write-Host "  [ATLA] /$slug baska yerde var: $($existing[$slug])" -ForegroundColor Yellow
      $skipped += $slug; continue
    }
    if (-not $Force) {
      Write-Host "  [ATLA] /$slug zaten var (-Force ile uzerine yazilir, yedek alinir)" -ForegroundColor Yellow
      $skipped += $slug; continue
    }
  }
  $text = $pageTpl.Replace('__REL__', $rel).Replace('__KEY__', $p.Key)
  Write-Text $file $text
  Write-Host "  [OK]   /$slug"
  $created += $slug
}

# ================================================================ DURUM RAPORU
Write-Host ''
Write-Host 'Giris sonrasi sayfalar (bu script dokunmaz):'
foreach ($r in @('login', 'register', 'forgot-password', 'dashboard', 'settings')) {
  $found = $existing.Keys | Where-Object { $_ -eq $r -or $_ -like "*/$r" -or $_ -like "$r/*" } | Select-Object -First 1
  if ($found) { Write-Host "  [VAR]   $r  ($found)" } else { Write-Host "  [YOK]   $r" -ForegroundColor Yellow }
}

Write-Host ''
Write-Host 'Menu / footer dosyalari (elle guncellenecek):'
Get-ChildItem -LiteralPath $src -Recurse -File -Include '*.tsx' |
  Where-Object { $_.Name -match '(?i)(header|navbar|site-nav|footer)' } |
  Select-Object -First 10 | ForEach-Object { Write-Host ('  ' + $_.FullName.Substring($root.Length + 1)) }

if (-not $SkipTsc) {
  Write-Host ''
  Write-Host 'npx tsc --noEmit calisiyor...'
  & npx tsc --noEmit
  if ($LASTEXITCODE -eq 0) { Write-Host 'tsc temiz.' -ForegroundColor Green }
  else { Write-Host 'tsc hata verdi. Ciktiyi bana yapistir.' -ForegroundColor Red }
}

Write-Host ''
Write-Host '--------------------------------------------------'
Write-Host "Olusturulan: $($created.Count)  Atlanan: $($skipped.Count)"
Write-Host 'SIRADAKI ADIMLAR:'
Write-Host ' 1) Supabase SQL editor: sql\pilot_requests.sql dosyasini calistir.'
Write-Host ' 2) Vercel Production env: SUPABASE_SERVICE_ROLE_KEY (sadece sunucu) ve NEXT_PUBLIC_SUPABASE_URL tanimli olmali.'
Write-Host ' 3) npm run dev -> /en/pilot, /en/pricing, /en/platform ... ac, ekran goruntusu at.'
Write-Host ' 4) Menu/footer dosyasini bana at, 8 sayfalik yapiya gore guncelleyeyim.'
Write-Host ' 5) legal/* sayfalari TASLAK ve noindex. Koseli parantezli alanlari avukatla doldur.'
Write-Host '--------------------------------------------------'
