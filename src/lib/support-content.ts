import type { LucideIcon } from "lucide-react";
import { COLLECTIONS_DE } from "./support-content-de";
import { Briefcase, LifeBuoy, Rocket, Scale, ShieldCheck } from "lucide-react";

export const MAIN_SITE = "https://aegisora.org";

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; text: string }
  | { t: "tip"; text: string }
  | { t: "warn"; text: string };

export type Article = { slug: string; title: string; summary: string; body: Block[] };
export type Collection = { slug: string; title: string; desc: string; icon: LucideIcon; articles: Article[] };

export const COLLECTIONS: Collection[] = [
  {
    slug: "getting-started",
    title: "Get started",
    desc: "What Aegisora is, how to create a test workspace and how to evaluate your first agent action.",
    icon: Rocket,
    articles: [
      {
        slug: "what-is-aegisora",
        title: "What is Aegisora?",
        summary: "A runtime control layer that decides what an AI agent is allowed to execute.",
        body: [
          { t: "p", text: "Aegisora is an execution-control layer for AI agents. It sits beneath your agent orchestration layer, at the point where a request becomes an executable action, and returns an explicit decision for each action before it runs." },
          { t: "h", text: "What it does" },
          { t: "ul", items: [
            "Evaluates each agent action against the policies of a workspace.",
            "Returns one of three states: ALLOW, BLOCK or ESCALATE.",
            "Blocks by default when no policy matches the action.",
            "Returns an evidence hash with every decision so the decision can be traced downstream.",
          ] },
          { t: "h", text: "What it works with" },
          { t: "p", text: "The boundary is framework independent. It sits beneath your agent stack rather than inside one specific framework, and provider execution can pass through the same enforcement path." },
          { t: "warn", text: "Aegisora is in early access and is being validated with design partners. Production hosting, customer SSO and full audit operations are not yet verified. See the Pilots and pricing collection for details." },
        ],
      },
      {
        slug: "create-test-workspace",
        title: "Create a test workspace",
        summary: "Sign up and get a workspace where you can evaluate your first action.",
        body: [
          { t: "p", text: "A test workspace is the fastest way to see how Aegisora decides. It is meant for evaluation, not for production workloads." },
          { t: "ol", items: [
            "Open aegisora.org and choose Test Aegisora, or go directly to the sign-up page.",
            "Create your account and sign in.",
            "Create or open your workspace.",
            "Follow the quickstart to evaluate your first action.",
          ] },
          { t: "h", text: "What to keep in mind" },
          { t: "ul", items: [
            "There is no paid plan and no online checkout for test workspaces.",
            "Do not connect production systems or sensitive customer data to a test workspace.",
            "Any paid pilot is scoped and agreed in writing before customer data or production systems are connected.",
          ] },
        ],
      },
      {
        slug: "evaluate-first-action",
        title: "Evaluate your first action",
        summary: "Send an action to the runtime and read the decision that comes back.",
        body: [
          { t: "p", text: "Once you have a test workspace, the quickstart walks you through sending a single agent action to the runtime for evaluation." },
          { t: "ol", items: [
            "Open the quickstart in the developer section of the main site.",
            "Send an action for evaluation using your workspace credentials.",
            "Read the decision: ALLOW, BLOCK or ESCALATE.",
            "Note the decision identity and evidence hash that come back with it.",
          ] },
          { t: "p", text: "If you would rather watch the runtime decide before writing any code, the live runtime proof runs a decision for you on the main site." },
          { t: "tip", text: "A new workspace has no policies yet, so your first action is expected to be BLOCKED. That is the default behaviour, not an error." },
        ],
      },
      {
        slug: "allow-block-escalate",
        title: "ALLOW, BLOCK and ESCALATE explained",
        summary: "The three decision states and when each one is returned.",
        body: [
          { t: "p", text: "Every evaluated action ends in exactly one of three states. The results are deterministic, so the same action under the same policies produces the same state." },
          { t: "h", text: "ALLOW" },
          { t: "p", text: "A policy explicitly permits the action. Your agent may execute it." },
          { t: "h", text: "BLOCK" },
          { t: "p", text: "The action must not run. This is also the result when no policy matches: Aegisora blocks by default." },
          { t: "h", text: "ESCALATE" },
          { t: "p", text: "The action needs human authorization before it can run. It is held at the boundary until a person approves or rejects it." },
        ],
      },
    ],
  },
  {
    slug: "policies-decisions",
    title: "Policies and decisions",
    desc: "How policies, decisions, approvals and evidence work together at the execution boundary.",
    icon: Scale,
    articles: [
      {
        slug: "policies-overview",
        title: "How policies work",
        summary: "Executable governance controls that decide what each action may do.",
        body: [
          { t: "p", text: "Policies are executable governance controls. They are not documents that people read; the runtime evaluates them for each action." },
          { t: "ul", items: [
            "Policies belong to a workspace.",
            "An action that matches no policy is blocked by default.",
            "A policy can lead to ALLOW, BLOCK or ESCALATE for the actions it covers.",
          ] },
          { t: "tip", text: "Because the default is BLOCK, an empty workspace never allows anything. Add policies deliberately and test them with your own actions." },
        ],
      },
      {
        slug: "decision-inspector",
        title: "Read a decision",
        summary: "What a decision tells you and how to follow it downstream.",
        body: [
          { t: "p", text: "Each decision carries an identity and an evidence hash. Carry both downstream so that the action your agent executes can be tied back to the decision that permitted it." },
          { t: "ul", items: [
            "The state: ALLOW, BLOCK or ESCALATE.",
            "The decision identity, used to look the decision up again.",
            "The evidence hash returned with the decision.",
          ] },
          { t: "p", text: "The product pages on the main site describe the decision inspector in more detail." },
        ],
      },
      {
        slug: "approvals",
        title: "Human approvals",
        summary: "How ESCALATE brings a person into the decision.",
        body: [
          { t: "p", text: "When a policy returns ESCALATE, the action waits for human authorization at the boundary. The approval is recorded as part of the decision trail." },
          { t: "ol", items: [
            "The agent requests an action and the runtime returns ESCALATE.",
            "A person with the right workspace role reviews the request.",
            "The person approves or rejects it.",
            "The outcome is recorded and the action either proceeds or stays blocked.",
          ] },
          { t: "note", text: "Privileged actions can additionally require MFA step-up. See Access and security." },
        ],
      },
      {
        slug: "evidence",
        title: "Evidence and evidence hashes",
        summary: "What evidence Aegisora records and what it does not claim.",
        body: [
          { t: "p", text: "An evidence hash is returned with every decision. Evidence records are hash-chained, so a change to an earlier record is detectable." },
          { t: "h", text: "What is not claimed" },
          { t: "p", text: "Aegisora does not claim a complete audit ledger today. Evidence records support tracing individual decisions; they are not a substitute for your own audit program." },
        ],
      },
    ],
  },
  {
    slug: "access-security",
    title: "Access and security",
    desc: "Workspace roles, MFA step-up, API keys and what is and is not verified yet.",
    icon: ShieldCheck,
    articles: [
      {
        slug: "workspace-roles",
        title: "Workspace roles",
        summary: "OWNER, ADMIN, OPERATOR and VIEWER.",
        body: [
          { t: "p", text: "Access inside a workspace is controlled by roles. Every request is checked on the server against the caller's role in that workspace." },
          { t: "ul", items: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] },
          { t: "p", text: "Give people the lowest role that lets them do their job. Use VIEWER for people who only need to read decisions." },
        ],
      },
      {
        slug: "mfa-step-up",
        title: "MFA step-up for privileged actions",
        summary: "Why some actions ask you to confirm with a second factor.",
        body: [
          { t: "p", text: "Privileged actions can require a second factor even when you are already signed in. This limits what a stolen or left-open session can do." },
          { t: "p", text: "If an action asks for step-up, complete the MFA prompt and retry the action." },
        ],
      },
      {
        slug: "api-keys",
        title: "API keys and request authentication",
        summary: "Workspace-scoped keys and how to handle them safely.",
        body: [
          { t: "p", text: "API keys are scoped to a workspace. A key can act only inside the workspace it was issued for." },
          { t: "h", text: "Handle keys as secrets" },
          { t: "ul", items: [
            "Never commit keys to a repository or paste them into chat or tickets.",
            "Keep keys in your secret manager or environment variables.",
            "Use a separate key for each environment.",
            "Remove a key as soon as it is no longer needed or may have leaked.",
          ] },
          { t: "p", text: "Requests without valid credentials are rejected. The API reference on the main site lists the endpoints and the request format." },
        ],
      },
      {
        slug: "security-overview",
        title: "Security and trust overview",
        summary: "What is protected today, and what is not yet verified.",
        body: [
          { t: "p", text: "Aegisora is designed to protect the execution boundary: decisions are made server-side, the default is BLOCK, access is role-based and privileged actions can require MFA step-up." },
          { t: "h", text: "Not yet verified" },
          { t: "ul", items: [
            "Production hosting and service levels.",
            "Customer SSO (SAML / OIDC) and automated provisioning.",
            "Full audit operations.",
          ] },
          { t: "p", text: "The security page and the trust center on the main site describe privacy, subprocessors and terms." },
        ],
      },
    ],
  },
  {
    slug: "pilots-pricing",
    title: "Pilots and pricing",
    desc: "How design partner pilots are scoped, and what is and is not available today.",
    icon: Briefcase,
    articles: [
      {
        slug: "is-pricing-published",
        title: "Is pricing published?",
        summary: "No. Pilots are scoped and agreed in writing.",
        body: [
          { t: "p", text: "Price, tax treatment, hosting, service levels and production availability are not published and are not represented as established offers." },
          { t: "ul", items: [
            "There is no paid self-service plan.",
            "There is no online checkout.",
            "There is no automated subscription billing today.",
          ] },
          { t: "p", text: "You can still create a test workspace and evaluate Aegisora at no cost. If you want to explore a pilot, talk to the team." },
        ],
      },
      {
        slug: "how-a-pilot-works",
        title: "How a design partner pilot works",
        summary: "What a written pilot proposal specifies before any data is connected.",
        body: [
          { t: "p", text: "Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal specifies:" },
          { t: "ol", items: [
            "Workflow",
            "Environment",
            "Term",
            "Support boundaries",
            "Retention",
            "Security prerequisites",
            "Success criteria",
            "Rollback",
          ] },
          { t: "p", text: "Start by contacting the team from the enterprise page on the main site." },
        ],
      },
      {
        slug: "sso-production",
        title: "SSO and production availability",
        summary: "What is not available yet.",
        body: [
          { t: "h", text: "Customer SSO" },
          { t: "p", text: "Not yet. A provider boundary is documented, but customer SAML / OIDC and automated provisioning are not configured or verified." },
          { t: "h", text: "Production hosting" },
          { t: "p", text: "Not yet. Production hosting, customer SSO and full audit operations are not yet verified." },
          { t: "note", text: "If these are prerequisites for you, raise them in the pilot conversation so they can be written into the scope." },
        ],
      },
    ],
  },
  {
    slug: "help",
    title: "Get help",
    desc: "How to reach the team and what to include so we can help quickly.",
    icon: LifeBuoy,
    articles: [
      {
        slug: "contact-support",
        title: "Contact the Aegisora team",
        summary: "Where to write and what to include.",
        body: [
          { t: "p", text: "Use the contact page on the main site for support questions, pilot requests and security reports." },
          { t: "h", text: "Include these details" },
          { t: "ul", items: [
            "What you were trying to do.",
            "What happened instead, and the exact message if there was one.",
            "The time of the attempt and the page or endpoint involved.",
            "Your workspace name. Never send API keys or passwords.",
          ] },
        ],
      },
    ],
  },
];

export const POPULAR: [string, string][] = [
  ["getting-started", "create-test-workspace"],
  ["getting-started", "allow-block-escalate"],
  ["access-security", "api-keys"],
  ["pilots-pricing", "is-pricing-published"],
  ["pilots-pricing", "how-a-pilot-works"],
];

export const lp = (locale: string | undefined, href: string) => (!locale || locale === "en" ? href : "/" + locale + href);
export const collectionsFor = (locale?: string): Collection[] => (locale === "de" ? COLLECTIONS_DE : COLLECTIONS);
export const collectionHref = (c: string, locale?: string) => lp(locale, "/support/" + c);
export const articleHref = (c: string, a: string, locale?: string) => lp(locale, "/support/" + c + "/" + a);
export const findCollection = (slug: string, locale?: string) => collectionsFor(locale).find((c) => c.slug === slug);
export const findArticle = (c: string, a: string, locale?: string) => findCollection(c, locale)?.articles.find((x) => x.slug === a);

export function searchIndex(locale?: string) {
  return collectionsFor(locale).flatMap((c) =>
    c.articles.map((a) => ({ title: a.title, summary: a.summary, collection: c.title, href: articleHref(c.slug, a.slug, locale) })),
  );
}

export function popularArticles(locale?: string) {
  return POPULAR.flatMap(([c, a]) => {
    const art = findArticle(c, a, locale);
    return art ? [{ title: art.title, href: articleHref(c, a, locale) }] : [];
  });
}
export const UPDATED = "October 2026";
export const updatedFor = (locale?: string) => (locale === "de" ? "Oktober 2026" : UPDATED);

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\u00e4/g, "ae")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function headingsOf(a: Article) {
  return a.body.flatMap((b) => (b.t === "h" ? [{ text: b.text, id: slugify(b.text) }] : []));
}

export function neighbours(c: string, a: string, locale?: string) {
  const col = findCollection(c, locale);
  if (!col) return { prev: null, next: null };
  const i = col.articles.findIndex((x) => x.slug === a);
  return {
    prev: i > 0 ? col.articles[i - 1] : null,
    next: i >= 0 && i < col.articles.length - 1 ? col.articles[i + 1] : null,
  };
}

export function readMinutes(a: Article) {
  const words = a.body
    .map((b) => (b.t === "ul" || b.t === "ol" ? b.items.join(" ") : b.text))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function toMarkdown(a: Article, locale?: string) {
  const label = locale === "de" ? { note: "Hinweis", tip: "Tipp", warn: "Wichtig" } : { note: "Note", tip: "Tip", warn: "Important" };
  const out: string[] = ["# " + a.title, "", a.summary, ""];
  for (const b of a.body) {
    if (b.t === "h") out.push("## " + b.text);
    else if (b.t === "p") out.push(b.text);
    else if (b.t === "ul") out.push(b.items.map((x) => "- " + x).join("\n"));
    else if (b.t === "ol") out.push(b.items.map((x, i) => String(i + 1) + ". " + x).join("\n"));
    else out.push("> **" + label[b.t] + ":** " + b.text);
    out.push("");
  }
  return out.join("\n");
}