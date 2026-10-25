import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react";
import { meta } from "@/lib/seo";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

export const metadata = meta(
  "Pricing",
  "Aegisora is validating enterprise runtime-control workflows with design partners. Pilots are scoped and agreed in writing.",
);

type Plan = {
  name: string;
  badge: string | null;
  price: string;
  sub: string;
  blurb: string;
  meta: [string, string][];
  cta: { label: string; href: string };
  more: { label: string; href: string };
  featured: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Test workspace",
    badge: null,
    price: "Early access",
    sub: "No paid plan, no checkout",
    blurb: "For evaluating your first agent action in a test workspace.",
    meta: [["DECISIONS", "Allow, Block, Escalate"], ["DEFAULT", "BLOCK"], ["EVIDENCE", "Hash per decision"]],
    cta: { label: "Test Aegisora", href: "/signup" },
    more: { label: "Read the quickstart", href: "/docs/quickstart" },
    featured: false,
  },
  {
    name: "Design partner pilot",
    badge: "Recommended",
    price: "Scoped",
    sub: "Agreed in writing before data is connected",
    blurb: "For teams testing a policy decision before a consequential tool action.",
    meta: [["WORKFLOW", "Agreed"], ["ENVIRONMENT", "Agreed"], ["TERM", "Agreed"]],
    cta: { label: "Talk to Enterprise", href: "/enterprise" },
    more: { label: "Review the API", href: "/docs" },
    featured: true,
  },
  {
    name: "Production",
    badge: "Planned",
    price: "Not available yet",
    sub: "Hosting and service levels not verified",
    blurb: "Production hosting, customer SSO and full audit operations are not yet verified.",
    meta: [["HOSTING", "Not verified"], ["SSO", "Planned"], ["AUDIT OPS", "Not verified"]],
    cta: { label: "Contact us", href: "/pilot" },
    more: { label: "Trust center", href: "/trust" },
    featured: false,
  },
];

const GROUPS: { title: string; rows: [string, string, string, string][] }[] = [
  {
    title: "Runtime decisions",
    rows: [
      ["Allow, block or escalate decision per action", "yes", "yes", "Planned"],
      ["BLOCK by default without a matching policy", "yes", "yes", "Planned"],
      ["Workspace-scoped API keys", "yes", "yes", "Planned"],
    ],
  },
  {
    title: "Access and identity",
    rows: [
      ["Workspace roles: OWNER, ADMIN, OPERATOR, VIEWER", "yes", "yes", "Planned"],
      ["MFA step-up for privileged actions", "yes", "yes", "Planned"],
      ["Customer SSO (SAML / OIDC)", "no", "Planned", "Planned"],
    ],
  },
  {
    title: "Evidence",
    rows: [
      ["Evidence hash returned with every decision", "yes", "yes", "Planned"],
      ["Hash-chained evidence records", "yes", "yes", "Planned"],
      ["Complete audit ledger", "Not claimed", "Not claimed", "Planned"],
    ],
  },
  {
    title: "Commercial terms",
    rows: [
      ["Published price", "no", "no", "no"],
      ["Self-service checkout", "no", "no", "no"],
      ["Written pilot scope", "no", "yes", "Planned"],
      ["Support boundaries agreed in writing", "no", "yes", "Planned"],
    ],
  },
];

const SCOPE = [
  "Workflow",
  "Environment",
  "Term",
  "Support boundaries",
  "Retention",
  "Security prerequisites",
  "Success criteria",
  "Rollback",
];

const FAQ: [string, string][] = [
  [
    "Can I try Aegisora today?",
    "Yes. You can create a test workspace and evaluate your first agent action. There is no paid plan and no online checkout today.",
  ],
  [
    "Is pricing published?",
    "No. Price, tax treatment, hosting, service levels, and production availability are not published or represented as established offers.",
  ],
  [
    "How does a paid pilot work?",
    "Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal specifies workflow, environment, term, support boundaries, retention, security prerequisites, success criteria, and rollback.",
  ],
  [
    "Is customer SSO available?",
    "Not yet. A provider boundary is documented, but customer SAML/OIDC and automated provisioning are not configured or verified.",
  ],
  [
    "Is production hosting available?",
    "Not yet. Production hosting, customer SSO, and full audit operations are not yet verified.",
  ],
];

function CellView({ v }: { v: string }) {
  if (v === "yes") return <Check className="mx-auto size-5 text-emerald-400" aria-label="Included" />;
  if (v === "no") return <Minus className="mx-auto size-5 text-foreground/30" aria-label="Not offered" />;
  return <span className="text-xs font-medium text-foreground/60">{v}</span>;
}

const COLS = "grid grid-cols-[1.7fr_1fr_1fr_1fr] items-center gap-2";

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pilot program"
        title="Scoped pricing for design partners"
        intro="Aegisora is validating enterprise runtime-control workflows with design partners. We do not currently offer self-service paid plans or online checkout."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
        rows={[
          { action: "workspace.create test", meta: "Early access · No checkout", v: "ALLOW" },
          { action: "pilot.start scoped", meta: "Agreed in writing first", v: "ESCALATE" },
          { action: "billing.self_serve", meta: "Not offered today", v: "BLOCK" },
        ]}
      />

      <Section eyebrow="Plans" title="Where you can start today." tone="alt">
        <div className="grid gap-4 pt-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                "relative flex flex-col rounded-2xl border p-6 md:p-7 " +
                (p.featured ? "border-primary/60 bg-surface-3" : "border-border bg-surface-1")
              }
            >
              {p.badge ? (
                <span
                  className={
                    "absolute -top-3 right-6 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide " +
                    (p.featured ? "bg-primary text-primary-foreground" : "bg-surface-3 text-foreground/80")
                  }
                >
                  {p.badge.toUpperCase()}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-4 text-4xl font-medium tracking-[-0.02em]">{p.price}</p>
              <p className="mt-1 text-xs font-medium text-primary">{p.sub}</p>
              <p className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-foreground/70">{p.blurb}</p>
              <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                {p.meta.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] font-semibold tracking-wider text-foreground/50">{k}</dt>
                    <dd className="mt-1 text-xs font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={p.cta.href}
                className={
                  "mt-6 inline-flex h-11 items-center justify-center rounded-md text-sm font-semibold transition " +
                  (p.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border text-foreground hover:bg-surface-3")
                }
              >
                {p.cta.label}
              </Link>
              <Link href={p.more.href} className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover">
                {p.more.label} <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface-1 p-6 md:p-8">
          <div className="max-w-3xl">
            <h3 className="text-xl font-semibold">Pilot commercial scope</h3>
            <p className="mt-3 text-sm leading-6 text-foreground/70">
              Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal should specify workflow, environment, term, support boundaries, retention, security prerequisites, success criteria, and rollback.
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground/70">
              Price, tax treatment, hosting, service levels, and production availability are not published or represented as established offers. There is no Stripe checkout or automated subscription billing today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/enterprise" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Pilot overview
            </Link>
            <Link href="/docs" className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground hover:bg-surface-3">
              Review API docs
            </Link>
          </div>
        </div>
      </Section>

      <Section title="What a pilot proposal specifies">
        <CardGrid
          cols={4}
          items={SCOPE.map((s, i) => ({ n: String(i + 1).padStart(2, "0"), title: s, body: "Agreed in writing" }))}
        />
      </Section>

      <Section
        title="Compare plans"
        intro="Statuses reflect what is built and tested today. Planned means not yet verified, and no complete audit-ledger claim is made."
        tone="alt"
      >
        <div className="space-y-3 md:hidden">
          {GROUPS.map((g, gi) => (
            <details key={g.title} open={gi === 0} className="group rounded-xl border border-border bg-surface-1">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {g.title}
                <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="divide-y divide-border border-t border-border">
                {g.rows.map((r) => (
                  <div key={r[0]} className="px-4 py-3">
                    <p className="text-sm font-medium">{r[0]}</p>
                    <dl className="mt-2 space-y-1.5">
                      {PLANS.map((p, pi) => (
                        <div key={p.name} className="flex items-center justify-between gap-3 text-xs">
                          <dt className="text-foreground/60">{p.name}</dt>
                          <dd><CellView v={r[pi + 1]} /></dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[680px]">
            <div className={COLS + " pb-4"}>
              <span />
              {PLANS.map((p) => (
                <span key={p.name} className="text-center text-sm font-semibold">{p.name}</span>
              ))}
            </div>
            {GROUPS.map((g, gi) => (
              <details key={g.title} open={gi === 0} className="group border-t-2 border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {g.title}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-3">
                  {g.rows.map((r) => (
                    <div key={r[0]} className={COLS + " border-t border-border py-3 text-sm"}>
                      <span className="font-medium">{r[0]}</span>
                      <span className="text-center"><CellView v={r[1]} /></span>
                      <span className="text-center"><CellView v={r[2]} /></span>
                      <span className="text-center"><CellView v={r[3]} /></span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
            <div className="border-t-2 border-border" />
          </div>
        </div>
      </Section>

      <Section title="FAQ">
        <div className="max-w-4xl">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-t border-border last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl font-light leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-foreground/70">{a}</p>
            </details>
          ))}
          <p className="mt-8 text-sm text-foreground/70">
            Questions about pricing?{" "}
            <Link href="/pilot" className="font-semibold text-primary underline underline-offset-4">Contact us</Link>{" "}
            about pilot scope, security prerequisites and success criteria.
          </p>
        </div>
      </Section>

      <CtaBand
        title="Ready to get started?"
        body="Create a test workspace, or talk to us about a scoped enterprise pilot."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Talk to Enterprise", href: "/enterprise" }}
      />
    </>
  );
}