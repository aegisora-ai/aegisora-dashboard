"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Check,
  FileCheck2,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  UserCheck,
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

const EYEBROW = "text-xs font-medium uppercase tracking-[0.16em] text-primary";
const CARD = "rounded-xl border border-border bg-card p-6";
const BTN_PRIMARY =
  "inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover";
const BTN_OUTLINE =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-7 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary";
const LINK = "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary-hover";

function Section({ children, alt = false, id }: { children: ReactNode; alt?: boolean; id?: string }) {
  return (
    <section id={id} className={"border-t border-border " + (alt ? "bg-surface-1" : "bg-background")}>
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-28">{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <motion.div {...fadeUp()} className="max-w-3xl">
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-foreground sm:text-5xl">{title}</h2>
      {intro ? <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p> : null}
    </motion.div>
  );
}

function LiveConsole() {
  const reduce = useReducedMotion();
  const nextId = useRef(5);
  const [items, setItems] = useState<Ev[]>(() => FEED.slice(0, 5).map((e, i) => ({ ...e, id: i })));

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      const n = nextId.current++;
      const base = FEED[n % FEED.length];
      setItems((prev) => [{ ...base, id: n }, ...prev].slice(0, 5));
    }, 2600);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--panel-shadow)]">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Activity className="size-4 text-primary" />
          Sample runtime decisions
        </div>
        <span className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground">Illustrative</span>
      </div>
      <ul className="h-[18.75rem] divide-y divide-border overflow-hidden">
        {items.map((e) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-[3.75rem] items-center justify-between gap-3 px-4"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-foreground">{e.action}</p>
              <p className="truncate text-xs text-muted-foreground">
                {e.agent} · {e.reason}
              </p>
            </div>
            <span className={`shrink-0 rounded px-2 py-1 font-mono text-[11px] font-semibold ${VERDICT_STYLE[e.verdict]}`}>
              {e.verdict}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const PROOF = [
  "Public runtime repository",
  "Tenant isolation with Postgres RLS",
  "MFA step-up for governance changes",
  "Hash-chained evidence, verifiable offline",
];

const PROBLEMS = [
  { title: "Agents call real systems", body: "Payments, databases, files and secrets are one tool call away from an autonomous agent." },
  { title: "Prompts are not controls", body: "Instructions to a model can be ignored or overridden. A policy at the execution boundary cannot." },
  { title: "Logs can be rewritten", body: "Ordinary audit tables are editable. Evidence should be able to prove its own integrity." },
];

const VERDICTS: { verdict: Verdict; icon: typeof ShieldCheck; title: string; body: string }[] = [
  { verdict: "ALLOW", icon: ShieldCheck, title: "Runs", body: "The action matches a policy and proceeds, with the decision recorded." },
  { verdict: "ESCALATE", icon: UserCheck, title: "Waits for a human", body: "Sensitive actions route to an approver before anything executes." },
  { verdict: "BLOCK", icon: Lock, title: "Denied", body: "Stopped at the boundary. Without a matching policy the default is BLOCK." },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Policy engine", body: "Write policies once and enforce them on every agent action, with conditions and redaction built in." },
  { icon: Users, title: "Role-based access", body: "Owner, Admin, Operator and Viewer roles enforced server-side on every request." },
  { icon: Lock, title: "MFA step-up", body: "Governance changes require an AAL2 session. A password alone is never enough." },
  { icon: ScrollText, title: "Tamper-evident evidence", body: "Decisions are written to a hash-chained evidence log you can verify independently." },
  { icon: Webhook, title: "Signed webhooks", body: "Push decisions to your SIEM and ticketing with signed, retried deliveries." },
  { icon: KeyRound, title: "Scoped API keys", body: "Hashed at rest, rate limited per key and per IP, revocable at any time." },
];

const SCENARIOS: { action: string; verdict: Verdict; title: string; body: string }[] = [
  { action: "payments.transfer $48,000", verdict: "ESCALATE", title: "Payment above the limit", body: "Waits for a human approver before any money moves." },
  { action: "secrets.export", verdict: "BLOCK", title: "Secret export", body: "Denied unless a policy explicitly allows it." },
  { action: "db.drop_table users", verdict: "BLOCK", title: "Destructive database change", body: "Stopped at the boundary, with the reason recorded." },
  { action: "files.export salary.csv", verdict: "ESCALATE", title: "Sensitive file export", body: "Routed to a reviewer because of the data class." },
  { action: "customers.delete bulk", verdict: "BLOCK", title: "Bulk customer deletion", body: "No authorization, no execution." },
  { action: "crm.read_ticket", verdict: "ALLOW", title: "Routine read access", body: "Within scope, so it runs and is logged." },
];

const STEPS = [
  { n: "01", title: "Apply", body: "Tell us about your agents and the scenarios you want to test." },
  { n: "02", title: "Review", body: "We confirm scope and data handling together before anything starts." },
  { n: "03", title: "Invite", body: "You receive a secure invitation into an isolated workspace." },
  { n: "04", title: "Test", body: "Run the agreed scenarios against your own agents." },
  { n: "05", title: "Report", body: "Get a report built from recorded events, reviewed together." },
];

const EVIDENCE_SNIPPET = `GET /api/v1/workspace/evidence/export
X-Workspace-Id: <workspace-id>

python verify_evidence.py export.json --workspace <workspace-id>`;

const SNIPPET = `curl -X POST https://aegisora.org/api/v1/evaluate \\
  -H "Authorization: Bearer aeg_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "agent": "finance-agent",
        "action": "payments.transfer",
        "risk": 70,
        "input": { "amount": 48000 } }'

# -> e.g. { "effect": "ESCALATE", "approval_id": "<uuid>", "decision_id": "<uuid>", "evidence_hash": "<hash>", ... }`;

export default function Home() {
  return (
    <div className="overflow-x-clip bg-background text-foreground">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,color-mix(in_srgb,var(--primary)_24%,transparent),transparent_72%)]"
        />
        <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-16 text-center sm:px-6 md:pb-24 md:pt-24">
          <p className={EYEBROW}>Runtime security for AI agents</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-7xl">
            One decision point between every AI agent and the action it takes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Aegisora evaluates every sensitive agent action against your policy before it runs. ALLOW, BLOCK, or ESCALATE to a human, with an evidence record you can verify yourself.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/pilot" className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              Request a pilot
            </Link>
            <Link href="/docs" className={`${BTN_OUTLINE} w-full sm:w-auto`}>
              Read the docs <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              create a test workspace
            </Link>
            .
          </p>
          <motion.div {...fadeUp(1)} className="mx-auto mt-14 max-w-3xl text-left md:mt-20">
            <LiveConsole />
          </motion.div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-10">
          {PROOF.map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-allow" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <Section>
        <Heading eyebrow="The problem" title="Agents are acting. Nothing decides what they may do." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <motion.div key={p.title} {...fadeUp(i)} className={CARD}>
              <h3 className="text-xl font-medium text-foreground">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* DECISIONS */}
      <Section alt>
        <Heading
          eyebrow="Control"
          title="Define exactly what runs."
          intro="Every action returns one of three decisions, evaluated against context, policy, risk and authorization before it reaches a real system."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {VERDICTS.map((v, i) => (
            <motion.div key={v.verdict} {...fadeUp(i)} className={CARD}>
              <div className="flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-surface-3 text-primary">
                  <v.icon className="size-5" />
                </span>
                <span className={`rounded px-2 py-1 font-mono text-[11px] font-semibold ${VERDICT_STYLE[v.verdict]}`}>
                  {v.verdict}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-medium text-foreground">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* EVIDENCE */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp()}>
            <p className={EYEBROW}>Evidence</p>
            <h2 className="mt-4 text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-foreground sm:text-5xl">
              Evidence a customer can verify without trusting us.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every decision is written to a hash-chained log. Export the chain and check it offline with a standalone verifier that uses only the Python standard library.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {["SHA-256 hash chain with gapless sequence numbers", "Export contains every field needed to recompute each hash", "Verification runs on your machine, not on our servers"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp(1)} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">export and verify</div>
            <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-foreground">{EVIDENCE_SNIPPET}</pre>
          </motion.div>
        </div>
      </Section>

      {/* PLATFORM */}
      <Section alt>
        <Heading
          eyebrow="Platform"
          title="Security built into the runtime."
          intro="Built for security teams that need proof, not promises."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i)} className={`${CARD} transition hover:border-primary`}>
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-surface-3 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/security" className={LINK}>
            Read about security <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      {/* SCENARIOS */}
      <Section>
        <Heading
          eyebrow="Scenarios"
          title="What it looks like in practice."
          intro="Illustrative scenarios. In your workspace, your policies decide the outcome."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s, i) => (
            <motion.div key={s.action} {...fadeUp(i)} className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <code className="truncate font-mono text-xs text-muted-foreground">{s.action}</code>
                <span className={`shrink-0 rounded px-2 py-1 font-mono text-[11px] font-semibold ${VERDICT_STYLE[s.verdict]}`}>
                  {s.verdict}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* PILOT */}
      <Section alt>
        <Heading
          eyebrow="Enterprise pilot"
          title="From first call to a report you can review."
          intro="A scoped, time-boxed evaluation on your own agents, in an isolated workspace."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp(i)} className={CARD}>
              <span className={EYEBROW}>{s.n}</span>
              <h3 className="mt-3 text-xl font-medium text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/pilot" className={LINK}>
            Apply for the pilot <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section
        className="dark border-t border-border text-foreground"
        style={{
          background:
            "radial-gradient(ellipse 45% 70% at 90% 100%, rgba(15,155,255,0.45) 0%, rgba(2,11,46,0) 70%), radial-gradient(ellipse 40% 60% at 5% 0%, rgba(21,153,255,0.35) 0%, rgba(2,11,46,0) 70%), #001a6e",
        }}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-5xl">
                Put a decision point in front of your agents.
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-white/75">
                Create a test workspace, send one request and read the decision. Without a matching policy the default is BLOCK.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/pilot" className={BTN_PRIMARY}>
                  Request a pilot
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Test Aegisora
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/15 bg-[#030f3d]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 font-mono text-xs text-white/60">illustrative request</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-sky-100">{SNIPPET}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}