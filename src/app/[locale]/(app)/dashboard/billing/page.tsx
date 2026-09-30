import type { Metadata } from "next";
import Link from "next/link";
import { UsageCard } from "./usage-card";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Billing status for this workspace.</p>
      </header>
      <UsageCard />
      <section aria-labelledby="billing-status" className="aeg-panel p-5">
        <h2 id="billing-status" className="text-sm font-medium">No billing account connected</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          This workspace has no verified plan, payment method, invoice history, or usage-metering connection. Aegisora does not provide Stripe checkout or subscription billing yet.
        </p>
        <Link href="/pricing" className="mt-5 inline-flex text-sm underline underline-offset-4">Review current pilot pricing status</Link>
      </section>
    </div>
  );
}
