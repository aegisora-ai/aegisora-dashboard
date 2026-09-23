import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Evidence" };

const cards = [
  { title: "Stable identity", copy: "Every action gets a durable evidence id at creation.", index: "01" },
  { title: "End-to-end trace", copy: "Follow a single request from proposal to execution.", index: "02" },
  { title: "Tamper-evident", copy: "Evidence records are immutable once written.", index: "03" },
  { title: "Export-ready", copy: "Pull records for audit or compliance review.", index: "04" },
];

export default function EvidenceOverviewPage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            EVIDENCE
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            Every action, reconstructable end to end.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Trace, decision, execution and evidence identity are carried together through the runtime, so nothing has to be pieced back together after the fact.
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