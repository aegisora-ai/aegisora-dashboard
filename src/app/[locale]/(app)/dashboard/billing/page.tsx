import type { Metadata } from "next";
import Link from "next/link";
import { UsageCard } from "./usage-card";

export const metadata: Metadata = { title: "Billing" };

const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL;
const MAIL_SUBJECT = "Aegisora design-partner pilot request";

const included = [
  "One customer-owned non-production workspace",
  "One workflow and one framework, after a technical-fit check confirms the integration is supported",
  "Up to three explicit allow / block / escalate policies",
  "A controlled test plan using synthetic or customer-approved low-risk data",
  "One kickoff, weekly reviews, and a closeout session",
  "Closeout packet: configured policy set, observed decision outcomes, failure notes, and an evidence export",
];

const excluded = [
  "Production traffic, or sensitive personal, health, or payment data",
  "Autonomous execution controlled by Aegisora",
  "SLA, uptime, latency, accuracy, ROI, or compliance guarantees",
  "SSO/SCIM, dedicated VPC or on-premises delivery, custom integrations, 24/7 incident response, certification claims",
  "Use of customer name, logo, quotations, or metrics in marketing without separate written consent",
];

const terms = [
  "Fixed fee and currency are agreed for the exact scope before signature.",
  "Tax treatment and invoice issuer are verified before any invoice is issued.",
  "Invoice schedule, due date, payment method, cancellation, and refund terms are written in the order form.",
  "Work starts only after both signatures, payment arrangement, technical owner, test environment, data boundaries, and rollback contact are confirmed.",
];

const btn = "inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted";

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-light tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plan and commercial status for this workspace.</p>
      </header>

      <section aria-labelledby="plan-heading" className="aeg-panel space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="plan-heading" className="text-sm font-medium">Paid design-partner pilot</h2>
            <p className="mt-1 text-sm text-muted-foreground">Four weeks. Validates one non-production AI-agent workflow at the point right before a consequential tool action.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Fee</p>
            <p className="text-sm font-medium">Price on request</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Status: no pilot agreement is recorded for this workspace.</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Included</h3>
            <List items={included} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Not included</h3>
            <List items={excluded} />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium">How it works</h3>
          <List items={terms} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          You keep the final tool-execution decision. A tool must not run unless your integration receives an ALLOW result. ESCALATE is not an approval and must pause the action for your human reviewer.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {SALES_EMAIL ? (
            <a href={"mailto:" + SALES_EMAIL + "?subject=" + encodeURIComponent(MAIL_SUBJECT)} className={btn}>Request a pilot</a>
          ) : (
            <Link href="/pricing" className={btn}>Request a pilot</Link>
          )}
          <Link href="/pricing" className="text-sm underline underline-offset-4">Pilot pricing status</Link>
        </div>
      </section>

      <UsageCard />

      <section aria-labelledby="billing-status" className="aeg-panel p-5">
        <h2 id="billing-status" className="text-sm font-medium">Payment and invoices</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          No subscription or online checkout is available, and no payment details are collected in this application. Pilots are agreed in a signed quote and invoiced outside the product.
        </p>
      </section>
    </div>
  );
}