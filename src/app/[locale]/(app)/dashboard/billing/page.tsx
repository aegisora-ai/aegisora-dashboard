"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

type Plan = "pro" | "founder_pilot" | "pilot" | "team" | "business" | "enterprise";

type BillingState = {
  customer: { stripe_customer_id: string; email: string | null } | null;
  subscription: {
    stripe_subscription_id: string;
    plan_key: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
  entitlement: {
    plan_key: string;
    status: string;
    billing_mode: string;
    current_period_end: string | null;
    updated_at: string;
  } | null;
};

// Self-service checkout is off by default: pilots are scoped and agreed in writing.
// To show plans and enable checkout, set NEXT_PUBLIC_BILLING_SELF_SERVE=true and rebuild.
const SELF_SERVE = process.env.NEXT_PUBLIC_BILLING_SELF_SERVE === "true";

type PlanCard = {
  id: string;
  title: string;
  price: string;
  detail: string;
  blurb: string;
  activeKeys: string[];
  action:
    | { type: "none" }
    | { type: "checkout"; plan: Plan }
    | { type: "contact"; label: string };
};

const cards: PlanCard[] = [
  {
    id: "free", title: "Free", price: "$0", detail: "no card needed",
    blurb: "1 agent, 1,000 decisions per month, 2 members.",
    activeKeys: ["free"], action: { type: "none" },
  },
  {
    id: "pro", title: "Pro", price: "$49", detail: "per month",
    blurb: "5 agents, 25,000 decisions per month, 5 members.",
    activeKeys: ["pro"], action: { type: "checkout", plan: "pro" },
  },
  {
    id: "team", title: "Team", price: "$299", detail: "per month",
    blurb: "25 agents, 250,000 decisions per month, 25 members.",
    activeKeys: ["team"], action: { type: "checkout", plan: "team" },
  },
  {
    id: "pilot", title: "Pilot", price: "Free pilot", detail: "scoped with you",
    blurb: "For companies evaluating Aegisora. Scope and duration are agreed together.",
    activeKeys: ["pilot", "founder_pilot"],
    action: { type: "contact", label: "Request pilot access" },
  },
  {
    id: "enterprise", title: "Business & Enterprise", price: "Custom pricing", detail: "based on team size and volume",
    blurb: "Higher limits, tailored policies and support. Pricing is agreed after a short conversation.",
    activeKeys: ["business", "enterprise"],
    action: { type: "contact", label: "Contact sales" },
  },
];

export default function BillingPage() {
  const locale = useLocale();
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<Plan | null>(null);
  const [portalWorking, setPortalWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/billing/status", { cache: "no-store" });
        const data = (await response.json()) as {
          success?: boolean;
          error?: string;
          customer?: BillingState["customer"];
          subscription?: BillingState["subscription"];
          entitlement?: BillingState["entitlement"];
        };
        if (!response.ok || !data.success) {
          throw new Error(data.error ?? "Unable to load billing status.");
        }
        if (!cancelled) {
          setState({
            customer: data.customer ?? null,
            subscription: data.subscription ?? null,
            entitlement: data.entitlement ?? null,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load billing status.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  async function checkout(plan: Plan) {
    setWorking(plan);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, locale }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(
          (response.status === 503
            ? "This plan is not available for self-service checkout yet. Please contact us and we will set it up with you."
            : data.error) ?? "Checkout could not be started.",
        );
      }
      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
      setWorking(null);
    }
  }

  async function openPortal() {
    setPortalWorking(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error("The billing portal is not available for this workspace right now. Please contact us and we will help.");
      }
      window.location.assign(data.url);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Billing portal failed.");
      setPortalWorking(false);
    }
  }

  const activePlan =
    state?.entitlement?.status === "active"
      ? state.entitlement.plan_key
      : (state?.subscription?.plan_key ?? null);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">AEGISORA / BILLING</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Billing & access</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Access and billing for this workspace.
          </p>
        </div>

        {state?.customer?.stripe_customer_id && state?.subscription ? (
          <button
            type="button"
            onClick={() => void openPortal()}
            disabled={portalWorking}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            {portalWorking ? "Opening..." : "Manage billing"}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current access</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">
                {loading ? "Loading..." : activePlan ? activePlan.replaceAll("_", " ") : "No active plan"}
              </h2>
              {activePlan ? (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  {String(state?.entitlement?.status ?? state?.subscription?.status ?? "active").toUpperCase()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {state?.entitlement?.updated_at
              ? `Updated ${new Date(state.entitlement.updated_at).toLocaleString()}`
              : "No billing activity yet"}
          </div>
        </div>
      </section>

      {SELF_SERVE ? (
        <section className="mt-10">
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">PLANS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose the access level for this workspace.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const action = card.action;
              const active = card.activeKeys.includes(activePlan ?? "");
              const busy = action.type === "checkout" && working === action.plan;
              return (
                <article key={card.id} className="flex min-h-[245px] flex-col rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">{card.title}</h3>
                    {active ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-7">
                    <div className="text-2xl font-semibold tracking-tight">{card.price}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{card.detail}</div>
                  </div>
                  <p className="mt-5 text-xs leading-5 text-muted-foreground">{card.blurb}</p>
                  {action.type === "checkout" ? (
                    <button
                      type="button"
                      disabled={active || Boolean(working)}
                      onClick={() => void checkout(action.plan)}
                      className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {active ? "Current plan" : busy ? "Starting checkout..." : "Continue to payment"}
                    </button>
                  ) : action.type === "contact" ? (
                    <Link
                      href="/pilot"
                      className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <div className="mt-auto inline-flex h-10 items-center text-sm text-muted-foreground">
                      {active ? "Current plan" : "Included for every workspace"}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">ACCESS</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Access is arranged with the team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Enterprise pilots are scoped and agreed in writing before they start. Self-service checkout is not enabled for this workspace.
          </p>
          <Link
            href="/pilot"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Talk to the team
          </Link>
        </section>
      )}
    </div>
  );
}