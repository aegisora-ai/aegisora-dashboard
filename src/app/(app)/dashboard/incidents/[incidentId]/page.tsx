import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RiskIndicator } from "@/components/aegisora/state-badge";
import { getIncident } from "@/lib/demo-incidents";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ incidentId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { incidentId } = await params;
  return { title: `Incident ${incidentId}` };
}

const statusTone: Record<string, string> = { OPEN: "text-block", INVESTIGATING: "text-escalate", RESOLVED: "text-allow" };

export default async function IncidentDetailPage({ params }: Props) {
  const { incidentId } = await params;
  const i = getIncident(incidentId);
  if (!i) notFound();

  return (
    <div className="mx-auto max-w-[80rem] space-y-8">
      <header>
        <p className="font-mono text-xs text-muted-foreground">
          <Link href="/dashboard/incidents" className="hover:text-foreground">Incidents</Link> / {i.id}
        </p>
        <h1 className="mt-1 text-3xl font-light tracking-tight">{i.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <RiskIndicator level={i.severity} />
          <span className={cn("font-mono text-[11px] tracking-wider", statusTone[i.status])}>{i.status}</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="summary-title" className="aeg-panel p-5">
          <h2 id="summary-title" className="text-sm font-medium">Summary</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.summary}</p>
          <dl className="mt-5 divide-y divide-border/60 border-t border-border">
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Agent</dt>
              <dd className="font-mono text-xs">{i.agent}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Opened</dt>
              <dd className="font-mono text-xs">{i.openedAt}</dd>
            </div>
            {i.resolvedAt && (
              <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
                <dt className="text-muted-foreground">Resolved</dt>
                <dd className="font-mono text-xs">{i.resolvedAt}</dd>
              </div>
            )}
            {i.decisionId && (
              <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
                <dt className="text-muted-foreground">Related decision</dt>
                <dd className="font-mono text-xs">
                  <Link href={`/dashboard/decisions/${i.decisionId}`} className="text-cyan underline-offset-4 hover:underline">{i.decisionId}</Link>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="timeline-title" className="aeg-panel p-5">
          <h2 id="timeline-title" className="text-sm font-medium">Timeline</h2>
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            {i.timeline.map((t) => (
              <li key={t.at} className="relative">
                <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-cyan" />
                <p className="font-mono text-[11px] text-muted-foreground">{t.at}</p>
                <p className="mt-0.5 text-sm">{t.label}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}