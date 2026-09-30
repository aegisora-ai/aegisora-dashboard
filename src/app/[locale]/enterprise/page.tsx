import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/aegisora/public-shell";
import { btnPrimary, btnOutline } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enterprise" };

const cards = [
  { title: "Workspace-scoped API", copy: "API keys and persisted decisions are associated with a workspace; cross-workspace ownership checks have runtime evidence.", index: "01" },
  { title: "Four workspace roles", copy: "OWNER, ADMIN, OPERATOR, and VIEWER team permissions have a real Supabase JWT test. Invite and member-removal flows are not available yet.", index: "02" },
  { title: "Decision and evidence paths", copy: "The API records runtime decisions and evidence. End-to-end governance coverage is still being validated; no complete audit-ledger claim is made.", index: "03" },
  { title: "Identity federation planned", copy: "A provider boundary is documented, but customer SAML/OIDC and automated provisioning are not configured or verified.", index: "04" },
];

export default function EnterprisePage() {
  return (
    <PublicShell>
      <section className="aeg-grid-bg border-b border-border bg-surface-1 px-6 py-20">
        <div className="mx-auto max-w-[80rem]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            ENTERPRISE
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight md:text-5xl">
            Scoped pilots for runtime control of AI agent actions.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Aegisora is seeking design partners to test a policy decision before a consequential tool action. Production hosting, customer SSO, and full audit operations are not yet verified.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={cn(btnPrimary)}>
              Create an account
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/developers" className={cn(btnOutline)}>
              Review the API
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-[80rem] gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <article key={card.title} className="bg-surface-2 p-6">
              <span className="font-mono text-xs text-muted-foreground">{card.index}</span>
              <h3 className="mt-3 text-base font-medium">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
