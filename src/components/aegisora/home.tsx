"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
import { HeroBlue } from "@/components/aegisora/hero-blue";

type Verdict = "ALLOW" | "BLOCK" | "ESCALATE";
type Ev = { id: number; agent: string; action: string; verdict: Verdict; reason: string };

const VERDICT_STYLE: Record<Verdict, string> = {
  ALLOW: "bg-emerald-400/15 text-emerald-300",
  BLOCK: "bg-red-400/15 text-red-300",
  ESCALATE: "bg-amber-400/15 text-amber-300",
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

const CARD = "rounded-2xl border border-white/10 bg-white/[0.04]";
const EYEBROW = "text-xs font-medium uppercase tracking-[0.16em] text-sky-300";
const LINK = "inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-sky-300";

function LiveConsole() {
  const reduce = useReducedMotion();
  const nextId = useRef(5);
  const [items, setItems] = useState<Ev[]>(() =>
    FEED.slice(0, 5).map((e, i) => ({ ...e, id: i })),
  );

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
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#030f3d]">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70">
          <Activity className="size-4 text-sky-300" />
          Runtime decisions
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-300">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>
      <ul className="h-[18.75rem] divide-y divide-white/10 overflow-hidden">
        {items.map((e) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-[3.75rem] items-center justify-between gap-3 px-4"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-white">{e.action}</p>
              <p className="truncate text-xs text-white/60">
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

const TRUST = ["Tenant isolation (RLS)", "MFA step-up (AAL2)", "Signed webhooks", "SHA-256 evidence chain"];

const STEPS = [
  { n: "01", title: "Intercept", body: "Every sensitive agent action is captured at the execution boundary, before it touches a real system." },
  { n: "02", title: "Evaluate", body: "Context, policy, risk and authorization are checked together, deterministically, on every call." },
  { n: "03", title: "Decide", body: "The runtime returns ALLOW, BLOCK or ESCALATE. Escalations route to a human approver." },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Policy engine", body: "Write policies once and enforce them on every agent action, with conditions and redaction built in." },
  { icon: Users, title: "Role-based access", body: "Owner, Admin, Operator and Viewer roles enforced server-side on every request." },
  { icon: Lock, title: "MFA step-up", body: "Governance changes require an AAL2 session. Password alone is never enough." },
  { icon: ScrollText, title: "Tamper-evident evidence", body: "Decisions are written to a hash-chained evidence log you can verify independently." },
  { icon: Webhook, title: "Signed webhooks", body: "Push decisions to your SIEM and ticketing with signed, retried deliveries." },
  { icon: KeyRound, title: "Scoped API keys", body: "Hashed at rest, rate limited per key and per IP, revocable at any time." },
];

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
    <div className="dark overflow-x-clip bg-[#020b2e] text-white">
      <HeroBlue />

      {/* TRUST STRIP */}
      <section className="border-y border-white/10 bg-[#020b2e]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-10">
          {TRUST.map((t) => (
            <span key={t} className="flex items-center gap-2 text-sm text-white/70">
              <Check className="size-4 text-emerald-300" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="relative isolate"
        style={{ background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(21,100,255,0.28) 0%, rgba(2,11,46,0) 70%), #020b2e" }}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-28">
          <motion.div {...fadeUp()} className="max-w-3xl">
            <p className={EYEBROW}>How it works</p>
            <h2 className="mt-4 text-4xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              One decision point for every agent action.
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp(i)} className={`${CARD} p-6 md:p-8`}>
                <span className={EYEBROW}>{s.n}</span>
                <h3 className="mt-4 text-2xl font-medium sm:text-3xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-white/70">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE CONSOLE */}
      <section className="border-y border-white/10 bg-[#031249]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.2fr] lg:py-28">
          <motion.div {...fadeUp()}>
            <p className={EYEBROW}>Live decision console</p>
            <h2 className="mt-4 text-4xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-5xl">
              Every action gets a decision.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              Agents send the action they want to take. Aegisora evaluates it against policy, risk and authorization before it reaches the real environment.
            </p>
            <Link href="/developers/quickstart" className={`${LINK} mt-6`}>
              Evaluate your first action <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp(1)} className={`${CARD} p-3 sm:p-5`}>
            <LiveConsole />
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#020b2e]">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-28">
          <motion.div {...fadeUp()} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={EYEBROW}>Platform</p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.02em] sm:text-5xl lg:text-6xl">Aegisora Runtime</h2>
              <p className="mt-3 text-lg text-white/70 sm:text-xl">Built for security teams that need proof, not promises.</p>
            </div>
            <Link href="/developers" className={LINK}>
              Learn about the platform <ArrowRight className="size-4" />
            </Link>
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i)} className={`${CARD} p-6 transition hover:border-sky-400/50`}>
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="border-t border-white/10"
        style={{ background: "radial-gradient(ellipse 45% 70% at 90% 100%, rgba(15,155,255,0.45) 0%, rgba(2,11,46,0) 70%), radial-gradient(ellipse 40% 60% at 5% 0%, rgba(21,153,255,0.35) 0%, rgba(2,11,46,0) 70%), #001a6e" }}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-28">
          <h2 className="max-w-3xl text-4xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Put a decision point in front of your agents today.
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className={`${CARD} grid items-center gap-8 p-6 md:grid-cols-2 md:p-10`}>
              <div>
                <p className={`${EYEBROW} flex items-center gap-2`}>
                  <span className="size-1.5 rounded-full bg-emerald-300" /> Start today
                </p>
                <h3 className="mt-4 text-3xl font-medium sm:text-4xl">Evaluate your first agent action</h3>
                <p className="mt-4 leading-relaxed text-white/70">
                  Create a test workspace, send one request and read the decision. Without a matching policy the default is BLOCK.
                </p>
                <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                  <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90">
                    Test Aegisora
                  </Link>
                  <Link href="/enterprise" className={LINK}>
                    Talk to Enterprise <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#030f3d]">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-3 font-mono text-xs text-white/60">illustrative request</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-sky-100">{SNIPPET}</pre>
              </div>
            </div>

            <div className={`${CARD} p-6 md:p-8`}>
              <p className={EYEBROW}>More information</p>
              <ul className="mt-5 divide-y divide-white/10">
                {[
                  ["/developers/quickstart", "Quickstart"],
                  ["/developers", "Developer docs"],
                  ["/blog", "Blog"],
                  ["/enterprise", "Enterprise"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center gap-3 py-3 text-sm font-semibold transition hover:text-sky-300">
                      <span className="size-1.5 rounded-full bg-sky-400" /> {label} <ArrowRight className="ml-auto size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}