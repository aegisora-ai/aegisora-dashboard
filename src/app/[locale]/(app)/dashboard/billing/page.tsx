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

const YEARLY: Record<string, { price: string; detail: string }> = {
  pro: { price: "$490", detail: "per year, about $41 per month, 2 months free" },
  team: { price: "$2,990", detail: "per year, about $249 per month, 2 months free" },
};

function displayPrice(card: PlanCard, yearly: boolean) {
  return yearly && YEARLY[card.id] ? YEARLY[card.id] : { price: card.price, detail: card.detail };
}

const PLAN_INFO: Record<string, { label: string; agents: string; decisions: string; members: string; rpm: string }> = {
  free: { label: "Free", agents: "1", decisions: "1,000", members: "2", rpm: "60" },
  pro: { label: "Pro", agents: "5", decisions: "25,000", members: "5", rpm: "120" },
  team: { label: "Team", agents: "25", decisions: "250,000", members: "25", rpm: "300" },
  pilot: { label: "Pilot", agents: "5", decisions: "25,000", members: "5", rpm: "60" },
  founder_pilot: { label: "Pilot", agents: "5", decisions: "25,000", members: "5", rpm: "60" },
  business: { label: "Business", agents: "Unlimited", decisions: "2,000,000", members: "Unlimited", rpm: "600" },
  enterprise: { label: "Enterprise", agents: "Unlimited", decisions: "Unlimited", members: "Unlimited", rpm: "1,200" },
};

function planLabel(key: string) {
  return PLAN_INFO[key]?.label ?? key.replaceAll("_", " ");
}

function PlanDetails({ planKey }: { planKey: string }) {
  const info = PLAN_INFO[planKey];
  if (!info) return null;
  const stats = [
    { k: "Agents", v: info.agents },
    { k: "Decisions per month", v: info.decisions },
    { k: "Members", v: info.members },
    { k: "API requests per minute", v: info.rpm },
  ];
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">What {info.label} includes</p>
      <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-lg border border-border p-5">
            <dt className="text-xs text-muted-foreground">{s.k}</dt>
            <dd className="mt-3 text-2xl font-semibold tracking-tight">{s.v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
        <li>ALLOW, BLOCK and ESCALATE decisions</li>
        <li>Default BLOCK when no policy matches</li>
      </ul>
    </div>
  );
}

const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : "-");

export default function BillingPage() {
  const locale = useLocale();
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<Plan | null>(null);
  const [portalWorking, setPortalWorking] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [banner, setBanner] = useState<"" | "pending" | "active" | "delayed" | "cancelled">("");

  useEffect(() => {
    const flag = new URLSearchParams(window.location.search).get("checkout");
    let timer: number | undefined;
    if (flag === "cancelled") {
      setBanner("cancelled");
    } else if (flag === "success") {
      setBanner("pending");
      let tries = 0;
      timer = window.setInterval(async () => {
        tries += 1;
        let done = false;
        try {
          const res = await fetch("/api/billing/status", { cache: "no-store" });
          const d = (await res.json()) as {
            success?: boolean;
            customer?: BillingState["customer"];
            subscription?: BillingState["subscription"];
            entitlement?: BillingState["entitlement"];
          };
          if (d.success) {
            setState({ customer: d.customer ?? null, subscription: d.subscription ?? null, entitlement: d.entitlement ?? null });
            const key = d.entitlement?.status === "active" ? d.entitlement.plan_key : d.subscription?.plan_key;
            if (key && key !== "free") {
              done = true;
              setBanner("active");
              window.dispatchEvent(new Event("aegisora-billing-updated"));
            }
          }
        } catch {
          // keep polling
        }
        if (done) {
          window.clearInterval(timer);
        } else if (tries >= 10) {
          window.clearInterval(timer);
          setBanner("delayed");
        }
      }, 2000);
    }
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, []);

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
        body: JSON.stringify({ plan, locale, interval: yearly ? "year" : "month" }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(
          (response.status === 503
            ? (data.error ?? "This plan is not available for self-service checkout yet. Please contact us and we will set it up with you.")
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

      {banner ? (
        <div
          className={
            "mt-6 rounded-lg border px-4 py-3 text-sm " +
            (banner === "active"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : banner === "cancelled"
                ? "border-border bg-card text-muted-foreground"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200")
          }
        >
          {banner === "active"
            ? "Payment received. Your plan is now active."
            : banner === "pending"
              ? "Payment received. Activating your plan..."
              : banner === "delayed"
                ? "Payment received, but activation is taking longer than usual. Refresh in a minute or contact support."
                : "Checkout was cancelled. No charge was made."}
        </div>
      ) : null}

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
                {loading || !activePlan ? (
                  loading ? "Loading..." : "No active plan"
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlanOpen(!planOpen)}
                    aria-expanded={planOpen}
                    className="inline-flex items-center gap-4 text-left"
                  >
                    <span>{planLabel(activePlan)}</span>
                    <span className="text-xs font-normal text-muted-foreground">{planOpen ? "Hide plan details" : "View plan details"}</span>
                  </button>
                )}
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

      {planOpen && activePlan ? (
        <section className="mt-4 rounded-xl border border-border bg-card p-6 md:p-8">
          <PlanDetails planKey={activePlan} />
        </section>
      ) : null}

      <section className="mt-4 rounded-xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          aria-expanded={detailsOpen}
          className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium"
        >
          <span>Subscription details</span>
          <span aria-hidden="true" className="text-muted-foreground">{detailsOpen ? "-" : "+"}</span>
        </button>
        {detailsOpen ? (
          <div className="border-t border-border px-6 py-5 text-sm">
            {state?.subscription ? (
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Plan</dt>
                  <dd className="mt-1 font-medium capitalize">{activePlan ? activePlan.replaceAll("_", " ") : "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium capitalize">{String(state.subscription.status ?? "-").replaceAll("_", " ")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {state.subscription.cancel_at_period_end ? "Access ends on" : "Renews on"}
                  </dt>
                  <dd className="mt-1 font-medium">{fmtDate(state.subscription.current_period_end ?? state.entitlement?.current_period_end)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Cancellation</dt>
                  <dd className="mt-1 font-medium">{state.subscription.cancel_at_period_end ? "Cancels at period end" : "Not scheduled"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Billing email</dt>
                  <dd className="mt-1 font-medium">{state.customer?.email ?? "-"}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground">
                No paid subscription for this workspace. You are on the {activePlan ? activePlan.replaceAll("_", " ") : "Free"} plan.
              </p>
            )}
            {state?.customer?.stripe_customer_id && state?.subscription ? (
              <button
                type="button"
                onClick={() => void openPortal()}
                disabled={portalWorking}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition hover:bg-muted"
              >
                {portalWorking ? "Opening..." : "Manage billing"}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {SELF_SERVE ? (
        <section className="mt-10">
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">PLANS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose the access level for this workspace.</h2>
            <div className="mt-4 inline-flex rounded-md border border-border p-1 text-sm" role="group" aria-label="Billing interval">
              <button
                type="button"
                aria-pressed={!yearly}
                onClick={() => setYearly(false)}
                className={"rounded px-3 py-1.5 transition " + (!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={yearly}
                onClick={() => setYearly(true)}
                className={"rounded px-3 py-1.5 transition " + (yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Yearly <span className="ml-1 text-xs opacity-80">2 months free</span>
              </button>
            </div>
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
                    <div className="text-2xl font-semibold tracking-tight">{displayPrice(card, yearly).price}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{displayPrice(card, yearly).detail}</div>
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