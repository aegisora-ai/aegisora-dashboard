import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, DataTable, PageHero, Section } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";
import { runtimeStages } from "@/lib/runtime-model";
import { btnOutline, btnPrimary } from "@/lib/ui";

export const metadata = meta(
  "Product",
  "Aegisora is an execution-control and runtime-governance system for autonomous AI agents. Every proposed action is evaluated before it executes.",
);

const areas = [
  ["Runtime", "/product/runtime", "How a request becomes a decision, an enforcement result and a record."],
  ["Policies", "/product/policies", "Governance controls that define what an agent may execute."],
  ["Decisions", "/product/decisions", "The inspector that shows why an action was allowed, blocked or escalated."],
  ["Approvals", "/product/approvals", "Human authorization as a runtime control boundary."],
  ["Evidence", "/product/evidence", "Decision-linked records for audit and forensics."],
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="PRODUCT"
        title="Agent execution control, end to end."
        lead="Aegisora is a control plane around agent execution. It decides whether an action an agent proposes is permitted to run, enforces that decision, and keeps the evidence."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
          <Link href="/product/runtime" className={btnOutline}>See the runtime</Link>
        </div>
      </PageHero>

      <Section eyebrow="THE MODEL" title="Eight stages between intent and consequence.">
        <DataTable head={["Stage", "What happens", "Produces"]} rows={runtimeStages} mono={[0, 2]} />
      </Section>

      <Section tone="tinted" eyebrow="EXPLORE" title="Product areas">
        <ul className="aeg-panel divide-y divide-border">
          {areas.map(([label, href, body]) => (
            <li key={href}>
              <Link href={href} className="group flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-surface-3">
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-sm text-muted-foreground">{body}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title="Decide before the action executes." />
    </>
  );
}