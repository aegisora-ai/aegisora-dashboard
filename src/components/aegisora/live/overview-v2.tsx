"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { Bucket } from "./decision-charts";

export function StatCard({ label, value, href, warn }: { label: string; value: string; href: string; warn?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("block rounded-2xl border border-[color:var(--aeg-card-line)] bg-surface-1 p-4 transition-colors hover:bg-surface-2", focusRing)}
    >
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className={cn("mt-2 block text-3xl font-semibold tabular-nums tracking-tight", warn ? "text-escalate" : "text-foreground")}>{value}</span>
    </Link>
  );
}

export function HourlyBars({ buckets, labels }: { buckets: Bucket[]; labels: string[] }) {
  const totals = buckets.map((b) => b.allow + b.escalate + b.block);
  const max = Math.max(1, ...totals);
  const peak = totals.some((t) => t > 0) ? totals.indexOf(Math.max(...totals)) : null;
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? peak;
  const heightOf = (t: number) => (t === 0 ? 1.5 : Math.max(5, (t / max) * 100));
  const b = active !== null ? buckets[active] : null;

  return (
    <div>
      <div className="relative h-56" onPointerLeave={() => setHover(null)}>
        <div role="img" aria-label="Decisions per hour, last 24 hours" className="flex h-full items-end gap-1.5 sm:gap-2">
          {totals.map((t, i) => (
            <div key={i} className="flex h-full flex-1 cursor-pointer items-end" onPointerEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <span
                className={cn("block w-full rounded-t-md transition-colors", i === active ? "bg-[#22d3ee] shadow-[0_0_28px_rgb(34_211_238/0.5)]" : "bg-[#1a6b78]")}
                style={{ height: heightOf(t) + "%" }}
              />
            </div>
          ))}
        </div>
        {active !== null && b && totals[active] > 0 && (
          <div
            className="pointer-events-none absolute z-10 w-40 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-xs shadow-xl"
            style={{
              left: "clamp(5rem, " + ((active + 0.5) / 24) * 100 + "%, calc(100% - 5rem))",
              bottom: "min(calc(" + heightOf(totals[active]) + "% + 12px), calc(100% - 96px))",
            }}
          >
            <p className="font-medium text-foreground">{labels[active]}:00</p>
            <p className="mt-1 text-muted-foreground">{totals[active] + (totals[active] === 1 ? " decision" : " decisions")}</p>
            <p className="mt-1.5 flex justify-between text-allow"><span>Allow</span><span>{b.allow}</span></p>
            <p className="flex justify-between text-escalate"><span>Escalate</span><span>{b.escalate}</span></p>
            <p className="flex justify-between text-block"><span>Block</span><span>{b.block}</span></p>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-muted-foreground sm:gap-2">
        {labels.map((l, i) => (
          <span key={i} className="min-w-0 flex-1 text-center">{i % 3 === 0 ? l : ""}</span>
        ))}
      </div>
    </div>
  );
}