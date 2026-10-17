import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react";
import { meta } from "@/lib/seo";
import { Reveal } from "@/components/aegisora/fx/reveal";


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
    more: { label: "Read the quickstart", href: "/developers/quickstart" },
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
    more: { label: "Review the API", href: "/developers" },
    featured: true,
  },
  {
    name: "Production",
    badge: "Planned",
    price: "Not available yet",
    sub: "Hosting and service levels not verified",
    blurb: "Production hosting, customer SSO and full audit operations are not yet verified.",
    meta: [["HOSTING", "Not verified"], ["SSO", "Planned"], ["AUDIT OPS", "Not verified"]],
    cta: { label: "Contact us", href: "/contact" },
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
  if (v === "yes") return <Check className="mx-auto size-5 text-allow" aria-label="Included" />;
  if (v === "no") return <Minus className="mx-auto size-5 text-muted-foreground" aria-label="Not offered" />;
  return <span className="text-xs font-medium text-muted-foreground">{v}</span>;
}

const COLS = "grid grid-cols-[1.7fr_1fr_1fr_1fr] items-center gap-2";

export default function PricingPage() {
  return (
    <div className="aeg-page">
      <div className="aeg-light-band">
        
        {/* HERO */}
        <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-16 text-center sm:px-6 md:pt-20">
          <p className="aeg-eyebrow text-xs text-primary">PILOT PROGRAM</p>
          <h1 className="aeg-display mx-auto mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">Scoped pricing for design partners</h1>
          <p className="aeg-body-text mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
            Aegisora is validating enterprise runtime-control workflows with design partners. We do not currently offer self-service paid plans or online checkout.
          </p>
        </section>

        {/* PLANS */}
        <section className="mx-auto max-w-[1280px] px-4 pb-6 sm:px-6">
          <Reveal className="grid gap-4 pt-4 md:grid-cols-3" stagger>
            {PLANS.map((p) => (
              <div key={p.name} className={"relative flex flex-col rounded-2xl border bg-surface-1 p-6 md:p-7 " + (p.featured ? "border-[#000b24]" : "border-border")}>
                {p.badge ? (
                  <span className={"absolute -top-3 right-6 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide " + (p.featured ? "bg-[#000b24] text-white" : "bg-surface-3 text-[#3d5280]")}>
                    {p.badge.toUpperCase()}
                  </span>
                ) : null}
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="aeg-display mt-4 text-4xl">{p.price}</p>
                <p className="mt-1 text-xs font-medium text-primary">{p.sub}</p>
                <p className="aeg-body-text mt-4 min-h-[3.5rem] text-sm leading-relaxed">{p.blurb}</p>
                <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                  {p.meta.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[10px] font-semibold tracking-wider text-muted-foreground">{k}</dt>
                      <dd className="mt-1 text-xs font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={p.cta.href}
                  className={"mt-6 inline-flex h-11 items-center justify-center rounded text-sm font-semibold transition " + (p.featured ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "bg-[#000b24] text-white hover:bg-[#00143d]")}
                >
                  {p.cta.label}
                </Link>
                <Link href={p.more.href} className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold hover:text-primary">
                  {p.more.label} <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </Reveal>

          {/* COMMERCIAL SCOPE BAND */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-surface-3 p-6 md:p-8">
            <div className="max-w-3xl">
              <h2 className="text-xl font-semibold">Pilot commercial scope</h2>
              <p className="aeg-body-text mt-3 text-sm leading-6">
                Any paid pilot must be scoped and agreed in writing before customer data or production systems are connected. The proposal should specify workflow, environment, term, support boundaries, retention, security prerequisites, success criteria, and rollback.
              </p>
              <p className="aeg-body-text mt-3 text-sm leading-6">
                Price, tax treatment, hosting, service levels, and production availability are not published or represented as established offers. There is no Stripe checkout or automated subscription billing today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/enterprise" className="inline-flex h-11 items-center rounded bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover">
                Pilot overview
              </Link>
              <Link href="/developers" className="inline-flex h-11 items-center rounded border border-[#000b24] px-5 text-sm font-bold hover:bg-white">
                Review API docs
              </Link>
            </div>
          </div>
        </section>

        {/* PILOT SCOPE */}
        <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="aeg-display text-center text-4xl sm:text-5xl">What a pilot proposal specifies</h2>
          <Reveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger>
            {SCOPE.map((s, i) => (
              <div key={s} className="rounded-xl border border-border bg-surface-1 p-5">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-2 text-base font-semibold">{s}</p>
                <p className="mt-1 text-xs text-muted-foreground">Agreed in writing</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* COMPARE */}
        <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:pb-20">
          <h2 className="aeg-display text-4xl sm:text-5xl">Compare plans</h2>
          <p className="aeg-body-text mt-3 max-w-2xl text-sm">
            Statuses reflect what is built and tested today. Planned means not yet verified, and no complete audit-ledger claim is made.
          </p>
          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[680px]">
              <div className={COLS + " pb-4"}>
                <span />
                {PLANS.map((p) => (
                  <span key={p.name} className="text-center text-sm font-semibold">{p.name}</span>
                ))}
              </div>
              {GROUPS.map((g, gi) => (
                <details key={g.title} open={gi === 0} className="group border-t-2 border-[#000b24]">
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
              <div className="border-t-2 border-[#000b24]" />
            </div>
          </div>
        </section>

        {/* QUESTIONS BAND */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="aeg-night flex flex-wrap items-center justify-between gap-6 rounded-3xl p-8 md:p-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold">Questions about pricing?</h2>
              <p className="mt-2 text-sm text-[#a9bbdb]">Talk to the team about pilot scope, security prerequisites and success criteria.</p>
            </div>
            <Link href="/contact" className="inline-flex h-11 items-center rounded bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Contact us
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="aeg-display text-center text-4xl sm:text-5xl">FAQ</h2>
          <div className="mt-10">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-t border-border last:border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-2xl font-light leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="aeg-body-text pb-5 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CLOSING */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="aeg-night mx-auto max-w-[1280px] rounded-3xl px-6 py-16 text-center md:px-8">
            <h2 className="aeg-display text-4xl sm:text-5xl">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[#a9bbdb]">Create a test workspace, or talk to us about a scoped enterprise pilot.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="inline-flex h-12 items-center rounded bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary-hover">
                Test Aegisora
              </Link>
              <Link href="/enterprise" className="inline-flex h-12 items-center rounded border border-[#27457f] px-6 text-base font-semibold text-white hover:bg-white/10">
                Talk to Enterprise
              </Link>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}