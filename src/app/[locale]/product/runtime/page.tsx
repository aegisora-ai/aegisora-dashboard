import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Runtime" };

const cards = [
  { title: "Request", copy: "The agent proposes an action before it runs.", index: "01" },
  { title: "Context & policy", copy: "Identity, workspace and the active policy version are attached.", index: "02" },
  { title: "Risk & decision", copy: "The engine returns ALLOW, BLOCK or ESCALATE.", index: "03" },
  { title: "Enforcement & evidence", copy: "The result is enforced, then recorded with a stable evidence id.", index: "04" },
];

export default function ProductRuntimePage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            PRODUCT / RUNTIME
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            Request to evidence, stage by stage.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every agent action moves through the same eight-stage pipeline: request, context, policy, risk, decision, enforcement, execution, evidence. Nothing executes outside it.
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