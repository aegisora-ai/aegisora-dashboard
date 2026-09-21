import Link from "next/link";
import type { Metadata } from "next";
import { demoProviders } from "@/lib/demo-providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Providers" };

const statusTone: Record<string, string> = { CONNECTED: "text-allow", DEGRADED: "text-escalate", NOT_CONNECTED: "text-muted-foreground" };
const statusLabel: Record<string, string> = { CONNECTED: "Connected", DEGRADED: "Degraded", NOT_CONNECTED: "Not connected" };

export default function ProvidersPage() {
  const connected = demoProviders.filter((p) => p.status !== "NOT_CONNECTED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Providers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Model providers Aegisora Core evaluates requests against.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{connected} / {demoProviders.length} CONNECTED</span>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {demoProviders.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/providers/${p.id}`}
            className="aeg-panel flex flex-col gap-4 p-5 transition-colors hover:bg-surface-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-sm bg-surface-4 font-mono text-sm">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.kind}</div>
                </div>
              </div>
              <span className={cn("font-mono text-[11px] tracking-wider", statusTone[p.status])}>{statusLabel[p.status]}</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.notes}</p>
            <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</div>
                <div className="mt-1 font-mono text-xs">{p.region}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Requests today</div>
                <div className="mt-1 font-mono text-xs">{p.requestsToday || "-"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg latency</div>
                <div className="mt-1 font-mono text-xs">{p.avgLatencyMs ? `${p.avgLatencyMs} ms` : "-"}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}