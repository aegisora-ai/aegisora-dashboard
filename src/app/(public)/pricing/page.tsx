import Link from "next/link";
import { CtaBand, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";
import { btnOutline } from "@/lib/ui";

export const metadata = meta(
  "Pricing",
  "Aegisora plans: Developer (open source), Team and Enterprise. Pricing details are not yet published.",
);

const tiers = [
  {
    name: "Developer",
    tag: "Open source",
    body: "Run and integrate the open-source runtime in your own environment.",
    points: ["Runtime and policy evaluation", "Local development and testing"],
    cta: "Test Aegisora",
    href: "/signup",
  },
  {
    name: "Team",
    tag: "Growth",
    body: "For teams operating agents in a shared workspace.",
    points: ["Shared workspace", "Agents, policies and decisions", "Evidence and audit records"],
    cta: "Test Aegisora",
    href: "/signup",
  },
  {
    name: "Enterprise",
    tag: "Custom",
    body: "For organizations that need governance across teams and environments.",
    points: ["Workspaces and role-based access", "Advanced policy governance", "Approvals, audit and evidence", "Integrations and support"],
    cta: "Talk to Enterprise",
    href: "/enterprise",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="PRICING"
        title="Start free. Scale into governance."
        lead="Every plan shares the same decision model: ALLOW, BLOCK and ESCALATE. Plans differ in how much governance surrounds it."
      />

      <Section>
        <div className="aeg-panel grid gap-px overflow-hidden bg-border md:grid-cols-3">
          {tiers.map((t) => (
            <article key={t.name} className="flex flex-col bg-surface-2 p-6">
              <div className="font-mono text-[11px] tracking-wider text-muted-foreground">{t.tag.toUpperCase()}</div>
              <h2 className="mt-1 text-2xl">{t.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
              <ul className="mt-5 flex-1 space-y-2 border-t border-border pt-5 text-sm">
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link href={t.href} className={`${btnOutline} mt-6`}>{t.cta}</Link>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Prices and final plan contents are not yet published.
        </p>
      </Section>

      <CtaBand title="Decide before the action executes." />
    </>
  );
}