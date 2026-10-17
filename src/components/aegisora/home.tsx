"use client";
import { StartBuilding } from "@/components/aegisora/start-building";
import { PlatformTabs } from "@/components/aegisora/platform-tabs";
import { HeroTop } from "@/components/aegisora/hero-top";
import { Reveal } from "@/components/aegisora/fx/reveal";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Check,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Users,
  Webhook,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

type Verdict = "ALLOW" | "BLOCK" | "ESCALATE";
type Ev = { id: number; agent: string; action: string; verdict: Verdict; reason: string };

const VERDICT_STYLE: Record<Verdict, string> = {
  ALLOW: "bg-allow-muted text-allow",
  BLOCK: "bg-block-muted text-block",
  ESCALATE: "bg-escalate-muted text-escalate",
};

const FEED: Omit<Ev, "id">[] = [
  { agent: "support-agent", action: "crm.read_ticket", verdict: "ALLOW", reason: "Within scope" },
  { agent: "finance-agent", action: "payments.transfer $48,000", verdict: "ESCALATE", reason: "Above approval limit" },
  { agent: "code-agent", action: "db.drop_table users", verdict: "BLOCK", reason: "Destructive action denied" },
  { agent: "ops-agent", action: "deploy.rollback prod", verdict: "ALLOW", reason: "Policy match" },
  { agent: "hr-agent", action: "files.export salary.csv", verdict: "ESCALATE", reason: "Sensitive data class" },
  { agent: "research-agent", action: "web.fetch external", verdict: "ALLOW", reason: "Allow-listed domain" },
  { agent: "billing-agent", action: "customers.delete bulk", verdict: "BLOCK", reason: "No authorization" },
];

function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  };
}

function LiveConsole() {
  const reduce = useReducedMotion();
  const nextId = useRef(4);
  const [items, setItems] = useState<Ev[]>(() =>
    FEED.slice(0, 4).map((e, i) => ({ ...e, id: i })),
  );

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      const n = nextId.current++;
      const base = FEED[n % FEED.length];
      setItems((prev) => [{ ...base, id: n }, ...prev].slice(0, 5));
    }, 2200);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="aeg-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Activity className="size-4 text-primary" />
          Runtime decisions
        </div>
        <span className="flex items-center gap-1.5 text-xs text-allow">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-allow opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-allow" />
          </span>
          Live
        </span>
      </div>
      <ul className="min-h-[19rem] divide-y divide-border">
        <AnimatePresence initial={false}>
          {items.map((e) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-foreground">{e.action}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.agent} · {e.reason}
                </p>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-1 font-mono text-[11px] font-semibold ${VERDICT_STYLE[e.verdict]}`}
              >
                {e.verdict}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const TRUST = ["Tenant isolation (RLS)", "MFA step-up (AAL2)", "Signed webhooks", "SHA-256 evidence chain"];

const STEPS = [
  { n: "01", title: "Intercept", body: "Every sensitive agent action is captured at the execution boundary, before it touches a real system." },
  { n: "02", title: "Evaluate", body: "Context, policy, risk and authorization are checked together, deterministically, on every call." },
  { n: "03", title: "Decide", body: "The runtime returns ALLOW, BLOCK or ESCALATE. Escalations route to a human approver." },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Policy engine", body: "Write policies once and enforce them on every agent action, with conditions and redaction built in.", span: "lg:col-span-2" },
  { icon: Users, title: "Role-based access", body: "Owner, Admin, Operator and Viewer roles enforced server-side on every request.", span: "" },
  { icon: Lock, title: "MFA step-up", body: "Governance changes require an AAL2 session. Password alone is never enough.", span: "" },
  { icon: ScrollText, title: "Tamper-evident evidence", body: "Decisions are written to a hash-chained evidence log you can verify independently.", span: "lg:col-span-2" },
  { icon: Webhook, title: "Signed webhooks", body: "Push decisions to your SIEM and ticketing with signed, retried deliveries.", span: "" },
  { icon: KeyRound, title: "Scoped API keys", body: "Hashed at rest, rate limited per key and per IP, revocable at any time.", span: "" },
];

const SNIPPET = `curl -X POST https://api.aegisora.org/api/v1/evaluate \\
  -H "Authorization: Bearer aeg_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "agent": "finance-agent",
        "action": "payments.transfer",
        "context": { "amount": 48000 } }'

# -> { "decision": "ESCALATE", "approval_required": true }`;

export default function Home() {
  return (
    <div className="aeg-page overflow-x-clip">
      {/* HERO */}
      <section>
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 md:pt-12 lg:pb-20">
          <HeroTop />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6">
          {TRUST.map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-allow" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* LIVE CONSOLE */}
      <section className="relative isolate border-b border-border">
        <div
          aria-hidden
          className="aeg-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{ maskImage: "radial-gradient(ellipse at 50% 40%, black 15%, transparent 75%)" }}
        />
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.2fr] lg:py-24">
          <motion.div {...fadeUp()}>
            <p className="aeg-eyebrow text-xs">Live decision console</p>
            <h2 className="aeg-display mt-4 text-4xl sm:text-5xl lg:text-6xl">Every action gets a decision</h2>
            <p className="aeg-body-text mt-5 max-w-lg text-base leading-relaxed">
              Agents send the action they want to take. Aegisora evaluates it against policy, risk and authorization before it reaches the real environment.
            </p>
            <Link href="/developers/quickstart" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary">
              Evaluate your first action <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp(1)} className="aeg-tile p-3 sm:p-5">
            <LiveConsole />
          </motion.div>
        </div>
      </section>

      {/* START BUILDING */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-24">
          <Reveal><StartBuilding /></Reveal>
        </div>
      </section>

      {/* PLATFORM */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="aeg-display text-5xl sm:text-6xl lg:text-7xl">Aegisora Runtime</h2>
            <Link href="/developers" className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary">
              Learn about the platform <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-3 text-xl sm:text-2xl">Built for security teams that need proof, not promises.</p>
          <div className="mt-12">
            <Reveal><PlatformTabs features={FEATURES} /></Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (light band) */}
      <section className="aeg-light-band">
        <div className="mx-auto max-w-[1280px] px-4 pt-20 sm:px-6 lg:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="aeg-display max-w-3xl text-4xl sm:text-5xl lg:text-6xl">One decision point for every agent action.</h2>
            <Link href="/developers/quickstart" className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary">
              Read the quickstart <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp(i)} className="aeg-tile p-6 md:p-8">
                <span className="aeg-eyebrow text-xs text-primary">{s.n}</span>
                <h3 className="aeg-display mt-4 text-2xl sm:text-3xl">{s.title}</h3>
                <p className="aeg-body-text mt-3 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FINAL */}
        <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-20 sm:px-6 lg:pb-24 lg:pt-24">
          <h2 className="aeg-display max-w-3xl text-4xl sm:text-5xl lg:text-6xl">Put a decision point in front of your agents today.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="aeg-night aeg-tile grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
              <div>
                <p className="aeg-eyebrow flex items-center gap-2 text-xs">
                  <span className="size-1.5 rounded-full bg-allow" /> Start today
                </p>
                <h3 className="aeg-display mt-4 text-3xl sm:text-4xl">Evaluate your first agent action</h3>
                <p className="aeg-body-text mt-4 text-base leading-relaxed">
                  Create a test workspace, send one request and read the decision. Without a matching policy the default is BLOCK.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <Link href="/signup" className="inline-flex h-11 items-center rounded bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
                    Test Aegisora
                  </Link>
                  <Link href="/enterprise" className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-primary">
                    Talk to Enterprise <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-block/70" />
                  <span className="size-2.5 rounded-full bg-escalate/70" />
                  <span className="size-2.5 rounded-full bg-allow/70" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">illustrative request</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">{SNIPPET}</pre>
              </div>
            </div>

            <div className="aeg-tile p-6 md:p-8">
              <p className="aeg-eyebrow text-xs">More information</p>
              <ul className="mt-5 divide-y divide-border">
                <li>
                  <Link href="/developers/quickstart" className="flex items-center gap-3 py-3 text-sm font-semibold transition hover:text-primary">
                    <span className="size-1.5 rounded-full bg-primary" /> Quickstart <ArrowRight className="ml-auto size-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/developers" className="flex items-center gap-3 py-3 text-sm font-semibold transition hover:text-primary">
                    <span className="size-1.5 rounded-full bg-primary" /> Developer docs <ArrowRight className="ml-auto size-4" />
                  </Link>
                </li>
                <li>
                  <Link href="/enterprise" className="flex items-center gap-3 py-3 text-sm font-semibold transition hover:text-primary">
                    <span className="size-1.5 rounded-full bg-primary" /> Enterprise <ArrowRight className="ml-auto size-4" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}