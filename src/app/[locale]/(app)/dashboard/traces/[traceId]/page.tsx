import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { getTrace } from "@/lib/demo-traces";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ traceId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { traceId } = await params;
  return { title: `Trace ${traceId}` };
}

export default async function TraceDetailPage({ params }: Props) {
  const { traceId } = await params;
  const t = getTrace(traceId);
  if (!t) notFound();

  const maxMs = Math.max(...t.stages.map((s) => s.durationMs), 1);

  return (
    <div className="mx-auto max-w-[80rem] space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/dashboard/traces" className="hover:text-foreground">Traces</Link> / {t.id}
          </p>
          <h1 className="mt-1 text-3xl font-light tracking-tight">{t.agent} / {t.action}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/dashboard/decisions/${t.decisionId}`} className="text-cyan underline-offset-4 hover:underline">{t.decisionId}</Link>
            {" "}&middot; {t.environment} &middot; started {t.startedAt}
          </p>
        </div>
        <DecisionBadge state={t.outcome} />
      </header>

      <section aria-labelledby="stages-title" className="aeg-panel p-5">
        <div className="flex items-center justify-between">
          <h2 id="stages-title" className="text-sm font-medium">Stage timing</h2>
          <span className="font-mono text-xs text-muted-foreground">{t.durationMs} ms total</span>
        </div>
        <ol className="mt-5 space-y-3">
          {t.stages.map((s, i) => (
            <li key={s.name} className="grid grid-cols-[24px_120px_1fr_60px] items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("font-mono text-xs tracking-wider", s.status === "skipped" && "text-muted-foreground/50")}>{s.name}</span>
              <div className="h-2 overflow-hidden rounded-sm bg-surface-3">
                {s.status === "done" && (
                  <div className="h-full bg-cyan" style={{ width: `${Math.max((s.durationMs / maxMs) * 100, 4)}%` }} />
                )}
              </div>
              <span className="text-right font-mono text-xs text-muted-foreground">
                {s.status === "skipped" ? "skipped" : `${s.durationMs} ms`}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}