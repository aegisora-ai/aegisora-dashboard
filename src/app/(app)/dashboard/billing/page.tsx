import type { Metadata } from "next";
import { billing, invoices } from "@/lib/demo-billing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

const statusTone: Record<string, string> = { PAID: "text-allow", OPEN: "text-cyan", OVERDUE: "text-block" };

function UsageBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-xs">{used.toLocaleString()} / {total.toLocaleString()} {unit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-sm bg-surface-3">
        <div className={cn("h-full", pct > 90 ? "bg-block" : pct > 70 ? "bg-escalate" : "bg-cyan")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plan, usage, and invoice history.</p>
      </header>

      <section aria-labelledby="plan-title" className="aeg-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="plan-title" className="text-sm font-medium">Current plan</h2>
            <div className="mt-2 text-2xl font-light">{billing.plan}</div>
            <p className="mt-1 text-xs text-muted-foreground">Renews {billing.renewalDate} &middot; {billing.paymentMethod}</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Seats</div>
            <div className="mt-1 font-mono text-sm">{billing.seatsUsed} / {billing.seatsIncluded}</div>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <UsageBar label="Seats used" used={billing.seatsUsed} total={billing.seatsIncluded} unit="seats" />
          <UsageBar label="Requests this cycle" used={billing.requestsUsed} total={billing.requestsIncluded} unit="reqs" />
        </div>
      </section>

      <section aria-labelledby="invoices-title">
        <h2 id="invoices-title" className="mb-3 text-sm font-medium">Invoices</h2>
        <div className="aeg-panel overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-sm">{inv.period}</td>
                  <td className="px-4 py-3 font-mono text-xs">{inv.amount}</td>
                  <td className={cn("px-4 py-3 font-mono text-[11px] tracking-wider", statusTone[inv.status])}>{inv.status}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.issuedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}