import type { Metadata } from "next";
import { demoIntegrations } from "@/lib/demo-integrations";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  const categories = Array.from(new Set(demoIntegrations.map((i) => i.category)));
  const connected = demoIntegrations.filter((i) => i.status === "CONNECTED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Third-party tools connected to Aegisora Core.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">{connected} / {demoIntegrations.length} CONNECTED</span>
      </header>

      {categories.map((cat) => (
        <section key={cat} aria-labelledby={`${cat}-title`}>
          <h2 id={`${cat}-title`} className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoIntegrations.filter((i) => i.category === cat).map((i) => (
              <div key={i.id} className="aeg-panel flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-sm bg-surface-4 font-mono text-xs">
                    {i.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={cn("font-mono text-[10px] tracking-wider", i.status === "CONNECTED" ? "text-allow" : "text-muted-foreground")}>
                    {i.status === "CONNECTED" ? "CONNECTED" : "NOT CONNECTED"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium">{i.name}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{i.description}</p>
                </div>
                <div className="mt-auto border-t border-border pt-3 text-[11px] text-muted-foreground">
                  {i.status === "CONNECTED" ? (
                    <>Synced: <span className="font-mono">{i.syncedItem}</span> &middot; since {i.connectedSince}</>
                  ) : (
                    "Not configured for this workspace"
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}