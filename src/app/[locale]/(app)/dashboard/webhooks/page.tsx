import Link from "next/link";
import type { Metadata } from "next";
import { demoWebhooks } from "@/lib/demo-webhooks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Webhooks" };

const statusTone: Record<string, string> = { ACTIVE: "text-allow", FAILING: "text-block", DISABLED: "text-muted-foreground" };

export default function WebhooksPage() {
  const active = demoWebhooks.filter((w) => w.status === "ACTIVE").length;
  const failing = demoWebhooks.filter((w) => w.status === "FAILING").length;

  return (
    <div className="mx-auto max-w-[80rem] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Webhooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Outbound event delivery endpoints.</p>
        </div>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground">SAMPLE DATA</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Endpoints</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{demoWebhooks.length}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Active</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-allow">{active}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Failing</div>
          <div className="mt-2 text-3xl font-light tabular-nums text-block">{failing}</div>
        </div>
      </section>

      <div className="aeg-panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Endpoint</th>
              <th className="px-4 py-3 font-medium">Events</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Success rate</th>
              <th className="px-4 py-3 font-medium">Last delivery</th>
            </tr>
          </thead>
          <tbody>
            {demoWebhooks.map((w) => (
              <tr key={w.id} className="border-b border-border/60 last:border-0 hover:bg-surface-3">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/webhooks/${w.id}`} className="font-mono text-xs text-cyan underline-offset-4 hover:underline">{w.url}</Link>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{w.events.join(", ")}</td>
                <td className={cn("px-4 py-3 font-mono text-[11px] tracking-wider", statusTone[w.status])}>{w.status}</td>
                <td className="px-4 py-3 font-mono text-xs">{w.successRate}%</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{w.lastDeliveryAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}