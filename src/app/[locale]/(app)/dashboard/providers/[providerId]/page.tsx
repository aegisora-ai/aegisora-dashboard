import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvider } from "@/lib/demo-providers";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ providerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { providerId } = await params;
  return { title: `Provider ${providerId}` };
}

const statusTone: Record<string, string> = { CONNECTED: "text-allow", DEGRADED: "text-escalate", NOT_CONNECTED: "text-muted-foreground" };
const statusLabel: Record<string, string> = { CONNECTED: "Connected", DEGRADED: "Degraded", NOT_CONNECTED: "Not connected" };

export default async function ProviderDetailPage({ params }: Props) {
  const { providerId } = await params;
  const p = getProvider(providerId);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/dashboard/providers" className="hover:text-foreground">Providers</Link> / {p.id}
          </p>
          <h1 className="mt-1 text-3xl font-light tracking-tight">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{p.kind} &middot; {p.region}</p>
        </div>
        <span className={cn("font-mono text-[11px] tracking-wider", statusTone[p.status])}>{statusLabel[p.status]}</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Requests today</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{p.requestsToday || "-"}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg latency</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{p.avgLatencyMs ? `${p.avgLatencyMs}` : "-"}<span className="text-base text-muted-foreground"> ms</span></div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Connected since</div>
          <div className="mt-2 font-mono text-sm">{p.connectedSince ?? "-"}</div>
        </div>
      </section>

      <section aria-labelledby="models-title">
        <h2 id="models-title" className="mb-3 text-sm font-medium">Models</h2>
        <div className="aeg-panel overflow-x-auto">
          {p.models.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No models configured for this provider.</p>
          ) : (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Context window</th>
                  <th className="px-4 py-3 font-medium">Avg latency</th>
                </tr>
              </thead>
              <tbody>
                {p.models.map((m) => (
                  <tr key={m.name} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{m.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.contextWindow}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.avgLatencyMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section aria-labelledby="notes-title" className="aeg-panel p-5">
        <h2 id="notes-title" className="text-sm font-medium">Notes</h2>
        <p className="mt-2 text-sm text-muted-foreground">{p.notes}</p>
      </section>
    </div>
  );
}