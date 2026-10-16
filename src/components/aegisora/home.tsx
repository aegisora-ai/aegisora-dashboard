"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Check,
  KeyRound,
  Layers,
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

const TRUST = ["MIT open source", "Tenant isolation (RLS)", "MFA step-up (AAL2)", "Signed webhooks", "SHA-256 evidence chain"];

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
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="aeg-hero relative">
        <div
          aria-hidden
          className="aeg-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{ maskImage: "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)" }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
          <div>
            <motion.p {...fadeUp(0)} className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan">
              <span className="size-1.5 rounded-full bg-primary" />
              Open-source runtime security
            </motion.p>
            <motion.h1 {...fadeUp(1)} className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Secure what your AI agents are{" "}
              <span className="bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">allowed to do.</span>
            </motion.h1>
            <motion.p {...fadeUp(2)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is evaluated against
              context, policy, risk and authorization before it reaches the real environment.
            </motion.p>
            <motion.div {...fadeUp(3)} className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">
                Test Aegisora <ArrowRight className="size-4" />
              </Link>
              <Link href="/enterprise" className="inline-flex h-11 items-center rounded-md border border-border bg-surface-1 px-5 text-sm font-semibold transition hover:bg-surface-3">
                Talk to Enterprise
              </Link>
            </motion.div>
          </div>
          <motion.div {...fadeUp(2)}>
            <LiveConsole />
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-surface-1">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6">
          {TRUST.map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-allow" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div {...fadeUp()} className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">One decision point for every agent action.</h2>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i)} className="aeg-panel p-6">
              <span className="font-mono text-sm text-primary">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Platform</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Built for security teams that need proof, not promises.</h2>
          </motion.div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i)} className={`aeg-panel group p-6 transition hover:border-primary/60 ${f.span}`}>
                <f.icon className="size-6 text-primary" />
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPERS */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <motion.div {...fadeUp()}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Developers</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">One API call between your agent and production.</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            Send the action, get a decision. Integrate with any agent framework and keep a verifiable record of every call.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/developers" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Developer docs <ArrowRight className="size-4" />
            </Link>
            <a href="https://github.com/aegisora-ai/aegisora" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface-1 px-5 text-sm font-semibold hover:bg-surface-3">
              <Layers className="size-4" /> View on GitHub
            </a>
          </div>
        </motion.div>
        <motion.div {...fadeUp(1)} className="aeg-panel overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-block/70" />
            <span className="size-2.5 rounded-full bg-escalate/70" />
            <span className="size-2.5 rounded-full bg-allow/70" />
            <span className="ml-3 font-mono text-xs text-muted-foreground">illustrative request</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">{SNIPPET}</pre>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24">
        <motion.div {...fadeUp()} className="aeg-hero mx-auto max-w-7xl rounded-xl border border-border bg-surface-1 px-8 py-16 text-center">
          <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight">Put a decision point in front of your agents today.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Create a test workspace, or talk to us about a scoped enterprise pilot.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Test Aegisora <ArrowRight className="size-4" />
            </Link>
            <Link href="/enterprise" className="inline-flex h-11 items-center rounded-md border border-border bg-background px-6 text-sm font-semibold hover:bg-surface-3">
              Talk to Enterprise
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}