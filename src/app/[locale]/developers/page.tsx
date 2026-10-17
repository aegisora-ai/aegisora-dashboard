import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PublicShell } from "@/components/aegisora/public-shell";
import { PageHero } from "@/components/aegisora/page-kit";
import { Reveal } from "@/components/aegisora/fx/reveal";
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
      <PageHero
        eyebrow="DEVELOPERS"
        title="Build agents around a real enforcement boundary."
        lead="Aegisora is designed to sit underneath the agent orchestration layer, where requests become executable actions."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className={cn(btnPrimary)}>
            Test Aegisora
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link href="/proof" className={cn(btnOutline)}>
            Run live runtime proof
          </Link>
          <Link href="/developers/quickstart" className={cn(btnOutline)}>
            Quickstart
          </Link>
        </div>
      </PageHero>

      <section className="px-4 py-16 sm:px-6">
        <Reveal className="mx-auto grid max-w-[1280px] gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger>
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-border bg-surface-1 p-6">
              <span className="font-mono text-xs text-primary">{card.index}</span>
              <h3 className="mt-3 text-base font-semibold">{card.title}</h3>
              <p className="aeg-body-text mt-2 text-sm leading-relaxed">{card.copy}</p>
            </article>
          ))}
        </Reveal>
      </section>
    </PublicShell>
  );
}