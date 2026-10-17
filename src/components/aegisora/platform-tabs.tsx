"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type Feature = { title: string; body: string; icon: LucideIcon };
type Verdict = "ALLOW" | "BLOCK" | "ESCALATE";

const EXAMPLES: { action: string; meta: string; verdict: Verdict }[] = [
  { action: "files.export salary.csv", meta: "hr-agent · Sensitive data class", verdict: "ESCALATE" },
  { action: "deploy.rollback prod", meta: "ops-agent · Policy match", verdict: "ALLOW" },
  { action: "db.drop_table users", meta: "code-agent · Destructive action denied", verdict: "BLOCK" },
  { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", verdict: "ESCALATE" },
  { action: "crm.read_ticket", meta: "support-agent · Within scope", verdict: "ALLOW" },
];

const BADGE: Record<Verdict, string> = {
  ALLOW: "bg-allow/15 text-allow",
  BLOCK: "bg-block/15 text-block",
  ESCALATE: "bg-escalate/15 text-escalate",
};

export function PlatformTabs({ features }: { features: readonly Feature[] }) {
  const [active, setActive] = useState(0);
  const f = features[active] ?? features[0];
  if (!f) return null;
  const Icon = f.icon;
  const cards = [0, 1, 2].map((k) => EXAMPLES[(active + k) % EXAMPLES.length]);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div role="tablist" aria-orientation="vertical" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {features.map((x, i) => (
          <button
            key={x.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={
              "shrink-0 border-b-2 px-3 py-2 text-left text-sm transition lg:border-b-0 lg:border-l-2 lg:py-1.5 " +
              (i === active ? "border-primary font-semibold text-foreground" : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {x.title}
          </button>
        ))}
      </div>

      <div key={active} role="tabpanel" className="aeg-tile grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div>
          <Icon className="size-8 text-primary" />
          <h3 className="aeg-display mt-5 text-3xl sm:text-4xl">{f.title}</h3>
          <p className="aeg-body-text mt-4 text-base leading-relaxed">{f.body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link href="/developers/quickstart" className="inline-flex h-11 items-center rounded bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
              Learn more
            </Link>
            <Link href="/developers" className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary">
              Documentation <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div>
          <div className="space-y-3">
            {cards.map((c) => (
              <div key={c.action} className="rounded-xl border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm">{c.action}</span>
                  <span className={"rounded px-2 py-0.5 font-mono text-[11px] font-semibold " + BADGE[c.verdict]}>{c.verdict}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.meta}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">Illustrative decisions</p>
        </div>
      </div>
    </div>
  );
}