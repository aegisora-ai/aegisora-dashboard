import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Developers" };

const cards = [
  { title: "Framework independent", copy: "The boundary sits beneath your agent stack.", index: "01" },
  { title: "Provider aware", copy: "Provider execution can pass through the same enforcement path.", index: "02" },
  { title: "Deterministic results", copy: "Use explicit ALLOW, BLOCK and ESCALATE states.", index: "03" },
  { title: "Runtime evidence", copy: "Carry decision and evidence identity downstream.", index: "04" },
];

export default function DevelopersPage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            DEVELOPERS
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            Build agents around a real enforcement boundary.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Aegisora is designed to sit underneath the agent orchestration layer, where requests become executable actions.
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