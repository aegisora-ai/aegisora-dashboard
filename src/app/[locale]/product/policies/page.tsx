import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Policies" };

const cards = [
  { title: "Versioned", copy: "Every policy change is tracked and attributable.", index: "01" },
  { title: "Scoped", copy: "Apply per agent, per workspace, or per environment.", index: "02" },
  { title: "Testable", copy: "Dry-run a policy against historical decisions before activating it.", index: "03" },
  { title: "Enforced", copy: "The runtime evaluates policy on every request, not on a schedule.", index: "04" },
];

export default function ProductPoliciesPage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            PRODUCT / POLICIES
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            Executable governance controls.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Policies are versioned, testable and enforced at the execution boundary -- not guidelines an agent can choose to follow.
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