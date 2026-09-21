import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { getPolicy } from "@/lib/demo-policies";
import { demoDecisions } from "@/lib/demo-data";

type Props = { params: Promise<{ policyId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { policyId } = await params;
  return { title: `Policy ${policyId}` };
}

export default async function PolicyDetailPage({ params }: Props) {
  const { policyId } = await params;
  const p = getPolicy(policyId);
  if (!p) notFound();

  const related = demoDecisions.filter((d) => d.policy === p.id).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/dashboard/policies" className="hover:text-foreground">Policies</Link> / {p.id}
          </p>
          <h1 className="mt-1 text-3xl font-light tracking-tight">{p.name}-{p.version}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{p.description}</p>
        </div>
        <DecisionBadge state={p.decision} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="meta-title" className="aeg-panel p-5">
          <h2 id="meta-title" className="text-sm font-medium">Details</h2>
          <dl className="mt-4 divide-y divide-border/60 border-t border-border">
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Agent</dt>
              <dd className="font-mono text-xs">
                <Link href={`/dashboard/agents/${p.agent}`} className="text-cyan underline-offset-4 hover:underline">{p.agent}</Link>
              </dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Action</dt>
              <dd className="font-mono text-xs">{p.action}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Environment</dt>
              <dd className="font-mono text-xs">{p.environment}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-mono text-xs">{p.updatedAt}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
              <dt className="text-muted-foreground">Matches today</dt>
              <dd className="font-mono text-xs">{p.matchesToday}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Conditions</div>
            <ul className="mt-2 space-y-1.5">
              {p.conditions.map((c) => (
                <li key={c} className="rounded-sm bg-surface-3 px-3 py-1.5 font-mono text-[11px]">{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="related-title" className="aeg-panel p-5">
          <h2 id="related-title" className="text-sm font-medium">Related decisions</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {related.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No related decisions recorded yet.</li>}
            {related.map((d) => (
              <li key={d.id}>
                <Link href={`/dashboard/decisions/${d.id}`} className="flex items-center gap-3 py-2.5 hover:text-foreground">
                  <span className="font-mono text-[11px] text-muted-foreground">{d.timestamp}</span>
                  <span className="font-mono text-xs">{d.agent} / {d.action}</span>
                  <span className="ml-auto"><DecisionBadge state={d.state} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}