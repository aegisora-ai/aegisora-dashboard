import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWebhook } from "@/lib/demo-webhooks";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ webhookId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { webhookId } = await params;
  return { title: `Webhook ${webhookId}` };
}

const statusTone: Record<string, string> = { ACTIVE: "text-allow", FAILING: "text-block", DISABLED: "text-muted-foreground" };

export default async function WebhookDetailPage({ params }: Props) {
  const { webhookId } = await params;
  const w = getWebhook(webhookId);
  if (!w) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/dashboard/webhooks" className="hover:text-foreground">Webhooks</Link> / {w.id}
          </p>
          <h1 className="mt-1 break-all text-2xl font-light tracking-tight">{w.url}</h1>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">{w.events.join(", ")}</p>
        </div>
        <span className={cn("font-mono text-[11px] tracking-wider", statusTone[w.status])}>{w.status}</span>
      </header>

      <section aria-label="Summary" className="aeg-panel grid grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-3">
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Success rate</div>
          <div className="mt-2 text-3xl font-light tabular-nums">{w.successRate}%</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Created</div>
          <div className="mt-2 font-mono text-sm">{w.createdAt}</div>
        </div>
        <div className="bg-surface-2 p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Last delivery</div>
          <div className="mt-2 font-mono text-sm">{w.lastDeliveryAt}</div>
        </div>
      </section>

      <section aria-labelledby="log-title">
        <h2 id="log-title" className="mb-3 text-sm font-medium">Delivery log</h2>
        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Status code</th>
                <th className="px-4 py-3 font-medium">Attempt</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {w.deliveries.map((d) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{d.event}</td>
                  <td className={cn("px-4 py-3 font-mono text-xs", d.success ? "text-allow" : "text-block")}>{d.statusCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.attempt}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.durationMs} ms</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{d.sentAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}