"use client";

import { useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { ArrowRight, Bot, KeyRound, Plug, ScrollText, Webhook } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Action = { id: string; title: string; sub: string; href: string; icon: ComponentType<{ className?: string }>; words: string };

const ACTIONS: Action[] = [
  { id: "policy", title: "Policy", sub: "Allow, block or escalate", href: "/dashboard/policies", icon: ScrollText, words: "rule block allow escalate approval limit guardrail payment" },
  { id: "agent", title: "Agent", sub: "Register an AI worker", href: "/dashboard/agents", icon: Bot, words: "register connect import workflow assistant" },
  { id: "key", title: "API key", sub: "Server-side access", href: "/dashboard/api-keys", icon: KeyRound, words: "token secret credential access" },
  { id: "webhook", title: "Webhook", sub: "Event delivery", href: "/dashboard/webhooks", icon: Webhook, words: "notify event callback slack alert" },
  { id: "integration", title: "Integration", sub: "Connect your stack", href: "/dashboard/integrations", icon: Plug, words: "provider connect sdk framework" },
];

export function HomeHero({ workspaceName }: { workspaceName: string }) {
  const [q, setQ] = useState("");
  const firstRef = useRef<HTMLAnchorElement | null>(null);

  const matches = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return ACTIONS.filter((a) => {
      const hay = (a.title + " " + a.sub + " " + a.words).toLowerCase();
      return terms.some((t) => hay.includes(t));
    });
  }, [q]);

  return (
    <div className="space-y-12 pb-2">
      <section aria-labelledby="home-title" className="mx-auto w-full max-w-3xl pt-2 text-center sm:pt-6">
        <p className="text-xs text-muted-foreground">{workspaceName}</p>
        <h1 id="home-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What do you want to secure?</h1>

        <form
          onSubmit={(e) => { e.preventDefault(); firstRef.current?.click(); }}
          className="mt-8 rounded-xl border border-border bg-card text-left shadow-[var(--panel-shadow)] focus-within:border-primary"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs font-medium">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            Quick start
          </div>
          <div className="flex items-end gap-3 px-4 py-3">
            <textarea
              rows={2}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); firstRef.current?.click(); } }}
              placeholder="Describe what you need, e.g. require approval for payments"
              aria-label="Describe what you want to set up"
              className="min-h-14 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Open the best match"
              disabled={!matches.length}
              className={cn("grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:bg-surface-4 disabled:text-muted-foreground", focusRing)}
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">Matches the actions in your own workspace. Nothing here is sent to an AI model.</p>

        {q.trim() && (
          <ul aria-live="polite" className="mt-3 divide-y divide-border/60 rounded-lg border border-border bg-card text-left">
            {matches.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">No match. Press Ctrl K to search everything.</li>
            ) : (
              matches.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <Link ref={i === 0 ? firstRef : undefined} href={a.href} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-3">
                      <Icon className="size-4 text-primary" />
                      <span className="font-medium">{a.title}</span>
                      <span className="text-xs text-muted-foreground">{a.sub}</span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="scratch-title" className="mx-auto w-full max-w-5xl">
        <h2 id="scratch-title" className="text-base font-semibold">Start from scratch</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id}>
                <Link href={a.href} className={cn("flex items-center gap-3 rounded-md border border-border bg-card p-3 transition hover:border-primary/60", focusRing)}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold">{a.title}</span>
                    <span className="block text-xs text-muted-foreground">{a.sub}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}