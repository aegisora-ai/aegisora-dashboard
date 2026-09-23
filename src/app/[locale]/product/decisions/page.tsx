import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Decisions" };

const cards = [
  { title: "Explicit states", copy: "ALLOW, BLOCK or ESCALATE -- never an implicit pass-through.", index: "01" },
  { title: "Full context", copy: "See the agent, action, environment and policy behind every decision.", index: "02" },
  { title: "Searchable ledger", copy: "Filter the decision history by agent, state or time range.", index: "03" },
  { title: "Linked evidence", copy: "Every decision resolves to a downstream evidence record.", index: "04" },
];

export default function ProductDecisionsPage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            PRODUCT / DECISIONS
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            The decision inspector.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every ALLOW, BLOCK and ESCALATE is a first-class, inspectable record -- the policy version, the risk signal and the exact reasoning behind it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={cn(btnPrimary)}>
              Test Aegisora
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/proof" className={cn(btnOutline)}>
              Run live runtime proof
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-[80rem] gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.title} className="bg-surface-2 p-6">
              <span className="font-mono text-xs text-muted-foreground">{card.index}</span>
              <h3 className="mt-3 text-base font-medium">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}