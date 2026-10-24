"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Database,
  Eye,
  FileCheck2,
  Fingerprint,
  Lock,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Accordion, Btn, Eyebrow, MockWindow, Reveal, VerdictBadge } from "@/components/zp/ui";
import type { Verdict } from "@/components/zp/ui";

/* ------------------------------------------------------------------ data */

const CAPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ShieldCheck, title: "Policy at the boundary", body: "Default BLOCK without a match" },
  { icon: Database, title: "Tenant isolation", body: "Postgres RLS per workspace" },
  { icon: Fingerprint, title: "MFA step-up", body: "AAL2 for governance changes" },
  { icon: FileCheck2, title: "Verifiable evidence", body: "Hash-chained, offline verifier" },
];

const ACTIONS = [
  "payments.transfer",
  "db.drop_table",
  "files.export",
  "secrets.read",
  "customers.delete",
  "deploy.rollback",
  "web.fetch",
  "crm.read_ticket",
  "email.send",
  "iam.grant_role",
];

type Ev = { id: number; agent: string; action: string; verdict: Verdict; reason: string };
const FEED: Omit<Ev, "id">[] = [
  { agent: "support-agent", action: "crm.read_ticket", verdict: "ALLOW", reason: "Within scope" },
  { agent: "finance-agent", action: "payments.transfer $48,000", verdict: "ESCALATE", reason: "Above approval limit" },
  { agent: "code-agent", action: "db.drop_table users", verdict: "BLOCK", reason: "Destructive action denied" },
  { agent: "ops-agent", action: "deploy.rollback prod", verdict: "ALLOW", reason: "Policy match" },
  { agent: "hr-agent", action: "files.export salary.csv", verdict: "ESCALATE", reason: "Sensitive data class" },
  { agent: "research-agent", action: "web.fetch external", verdict: "ALLOW", reason: "Allow-listed domain" },
  { agent: "billing-agent", action: "customers.delete bulk", verdict: "BLOCK", reason: "No authorization" },
];

const POLICY_ITEMS = [
  { title: "Policy engine", body: "Write policies once and enforce them on every agent action, with conditions and redaction built in." },
  { title: "Human approval", body: "ESCALATE routes sensitive actions to an approver before anything executes." },
  { title: "Role-based access", body: "Owner, Admin, Operator and Viewer roles, enforced server-side on every request." },
  { title: "Default BLOCK", body: "Without a matching policy, the answer is BLOCK. Nothing runs by accident." },
  { title: "Scoped API keys", body: "Hashed at rest, rate limited per key and per IP, and revocable at any time." },
];

const EVIDENCE_ITEMS = [
  { title: "Hash-chained evidence", body: "Every decision is written to a SHA-256 hash chain with gapless sequence numbers." },
  { title: "Offline verifier", body: "Export the chain and verify it on your own machine with a standalone Python script." },
  { title: "Signed webhooks", body: "Push decisions to your SIEM and ticketing tools with signed, retried deliveries." },
  { title: "Complete exports", body: "Each export contains every field needed to recompute every hash." },
];

const AUDIT_ROWS = [
  { seq: "0412", action: "payments.transfer", v: "ESCALATE" as Verdict, hash: "3fa9…c21e" },
  { seq: "0413", action: "db.drop_table", v: "BLOCK" as Verdict, hash: "91d0…7b4a" },
  { seq: "0414", action: "crm.read_ticket", v: "ALLOW" as Verdict, hash: "c7e2…05fd" },
  { seq: "0415", action: "files.export", v: "ESCALATE" as Verdict, hash: "5b18…e9a3" },
  { seq: "0416", action: "deploy.rollback", v: "ALLOW" as Verdict, hash: "a04c…12d8" },
  { seq: "0417", action: "customers.delete", v: "BLOCK" as Verdict, hash: "e63f…88b0" },
];

const MODES: {
  key: string;
  verdict: Verdict | null;
  name: string;
  blurb: string;
  title: string;
  accent: string;
  body: string;
  flow: string[];
}[] = [
  {
    key: "allow",
    verdict: "ALLOW",
    name: "Allow",
    blurb: "The action matches a policy and runs. The decision is recorded.",
    title: "Allow:",
    accent: "Routine read",
    body: "A support agent reads a ticket. It is in scope, so it runs immediately and leaves a record.",
    flow: ["crm.read_ticket", "Policy match", "ALLOW: runs", "Evidence recorded"],
  },
  {
    key: "escalate",
    verdict: "ESCALATE",
    name: "Escalate",
    blurb: "Sensitive actions wait for a human approver before anything executes.",
    title: "Escalate:",
    accent: "Payment above the limit",
    body: "A transfer above the approval limit is held. An approver decides, and the outcome is recorded next to the request.",
    flow: ["payments.transfer $48,000", "Above approval limit", "Approver reviews", "Runs or is denied"],
  },
  {
    key: "block",
    verdict: "BLOCK",
    name: "Block",
    blurb: "Stopped at the boundary. Without a matching policy the default is BLOCK.",
    title: "Block:",
    accent: "Destructive change",
    body: "A destructive database change has no policy that allows it. It never reaches the system, and the reason is on record.",
    flow: ["db.drop_table users", "No policy allows it", "BLOCK: stopped", "Reason recorded"],
  },
  {
    key: "verify",
    verdict: null,
    name: "Verify",
    blurb: "Export the evidence chain and check it without trusting our servers.",
    title: "Verify:",
    accent: "Checked on your machine",
    body: "Auditors export the chain and recompute every hash offline. The check uses only the Python standard library.",
    flow: ["Export evidence", "verify_evidence.py", "Hashes recomputed", "Result on your machine"],
  },
];

const SECURITY: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Database, title: "Tenant isolation", body: "Postgres row-level security per workspace" },
  { icon: Fingerprint, title: "MFA step-up", body: "AAL2 session for governance changes" },
  { icon: Lock, title: "Role-based access", body: "Server-side on every request" },
  { icon: FileCheck2, title: "Tamper-evident evidence", body: "Hash-chained, verifiable offline" },
  { icon: Eye, title: "Full decision history", body: "Every ALLOW, BLOCK and ESCALATE" },
];

const CONTROLS = ["Default BLOCK", "Scoped API keys", "Per-key rate limits", "Key revocation", "Signed webhooks", "Offline verification"];

const STEPS = [
  { n: "01", title: "Apply", body: "Tell us about your agents and the scenarios you want to test." },
  { n: "02", title: "Review", body: "We confirm scope and data handling together before anything starts." },
  { n: "03", title: "Invite", body: "You receive a secure invitation into an isolated workspace." },
  { n: "04", title: "Test", body: "Run the agreed scenarios against your own agents." },
  { n: "05", title: "Report", body: "Get a report built from recorded events, reviewed together." },
];

const SNIPPET = `curl -X POST https://aegisora.org/api/v1/evaluate \\
  -H "Authorization: Bearer aeg_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "agent": "finance-agent",
        "action": "payments.transfer",
        "risk": 70,
        "input": { "amount": 48000 } }'

# -> e.g. { "effect": "ESCALATE", "approval_id": "<uuid>",
#          "decision_id": "<uuid>", "evidence_hash": "<hash>" }`;

/* ------------------------------------------------------------ small parts */

function Pill({ children, tone, n }: { children: ReactNode; tone?: "bad" | "good"; n?: number }) {
  return (
    <span className={"zp-pill" + (tone ? ` zp-pill--${tone}` : "")}>
      {n ? <i>{n}</i> : null}
      {children}
    </span>
  );
}

function Seq({ items, tone }: { items: ReactNode[]; tone?: "bad" | "good" }) {
  const reduce = useReducedMotion();
  return (
    <>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {i > 0 ? <span className="zp-link-v" /> : null}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.18 }}
          >
            <Pill tone={i === items.length - 1 ? tone : undefined} n={i + 1}>
              {it}
            </Pill>
          </motion.div>
        </div>
      ))}
    </>
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
    <MockWindow title="Sample runtime decisions" tag="Illustrative">
      <ul className="zp-mock-list">
        {items.map((e) => (
          <motion.li
            key={e.id}
            className="zp-mock-row"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ minWidth: 0 }}>
              <p className="zp-mock-act">{e.action}</p>
              <p className="zp-mock-sub">
                {e.agent} · {e.reason}
              </p>
            </div>
            <VerdictBadge v={e.verdict} />
          </motion.li>
        ))}
      </ul>
    </MockWindow>
  );
}

function AuditMock() {
  return (
    <MockWindow title="Evidence log" tag="Illustrative">
      <div className="zp-mock-wrap">
        <table className="zp-mock-table">
          <thead>
            <tr>
              <th>Seq</th>
              <th>Action</th>
              <th>Decision</th>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_ROWS.map((r) => (
              <tr key={r.seq}>
                <td className="zp-mono">{r.seq}</td>
                <td className="zp-mono">{r.action}</td>
                <td>
                  <VerdictBadge v={r.v} />
                </td>
                <td className="zp-mono">{r.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="zp-mock-foot">Chain intact. Sequence numbers are gapless.</p>
    </MockWindow>
  );
}

function Modes() {
  const [i, setI] = useState(0);
  const m = MODES[i];
  return (
    <div>
      <div className="zp-track" aria-hidden>
        {MODES.map((x, k) => (
          <span key={x.key} className="zp-track-dot" data-on={k <= i} style={{ left: `${(k + 0.5) * 25}%` }} />
        ))}
      </div>
      <div className="zp-tabs" role="tablist" aria-label="Decision modes">
        {MODES.map((x, k) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            id={`mode-tab-${x.key}`}
            aria-selected={k === i}
            aria-controls="mode-panel"
            className="zp-tab"
            onClick={() => setI(k)}
          >
            <b>
              {x.name}
              {x.verdict ? <VerdictBadge v={x.verdict} /> : <FileCheck2 size={14} aria-hidden />}
            </b>
            <span>{x.blurb}</span>
          </button>
        ))}
      </div>
      <div className="zp-mode" role="tabpanel" id="mode-panel" aria-labelledby={`mode-tab-${m.key}`}>
        <div className="zp-art zp-art--flow">
          <div className="zp-flow">
            {m.flow.map((f, k) => (
              <div key={f} style={{ display: "contents" }}>
                {k > 0 ? <span className="zp-flow-line" /> : null}
                <div className="zp-flow-box">{k === 0 ? <code>{f}</code> : f}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="zp-mode-text">
          <h3>
            {m.title} <span className="zp-em">{m.accent}</span>
          </h3>
          <p>{m.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export default function Home() {
  const marquee = [...ACTIONS, ...ACTIONS];
  return (
    <div className="zp" style={{ overflowX: "clip" }}>
      {/* HERO */}
      <section className="zp-hero">
        <div className="zp-container">
          <Eyebrow plain>Runtime security for AI agents</Eyebrow>
          <h1 className="zp-h2xl">Your control layer for the agentic era</h1>
          <p className="zp-lead">
            Aegisora evaluates every sensitive agent action against your policy before it runs. ALLOW, BLOCK, or
            ESCALATE to a human, with an evidence record you can verify yourself.
          </p>
          <div className="zp-btn-row zp-btn-row--center">
            <Btn href="/pilot">Request a pilot</Btn>
            <Btn href="/docs" kind="outline">
              Read the docs <ArrowRight size={16} aria-hidden />
            </Btn>
          </div>
          <p style={{ marginTop: 14, fontSize: 14 }} className="zp-muted">
            Or{" "}
            <Link href="/signup" className="zp-textlink">
              create a test workspace
            </Link>
          </p>

          <ul className="zp-caps">
            {CAPS.map((c) => (
              <li key={c.title} className="zp-cap">
                <c.icon size={20} aria-hidden />
                <b>{c.title}</b>
                <span>{c.body}</span>
              </li>
            ))}
          </ul>

          <div className="zp-marquee-wrap">
            <p className="zp-marquee-label">Illustrative actions evaluated at the execution boundary</p>
            <div className="zp-marquee" aria-hidden>
              <div className="zp-marquee-track">
                {marquee.map((a, k) => (
                  <span key={a + k}>{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / COMPARISON */}
      <section className="zp-section">
        <div className="zp-container">
          <Reveal className="zp-center" >
            <h2 className="zp-hlg" style={{ maxWidth: "20ch", marginInline: "auto" }}>
              Don’t let agents act on trust alone
            </h2>
            <p className="zp-lead" style={{ marginTop: 20 }}>
              Teams give agents real tool access long before anyone can say what they may do. Aegisora puts one
              decision point in front of every sensitive action, so moving fast does not mean losing control.
            </p>
          </Reveal>
          <div className="zp-compare">
            <div className="zp-compare-head">
              <div>Without a decision point</div>
              <div>With Aegisora</div>
            </div>
            <div className="zp-compare-body">
              <div className="zp-compare-col">
                <Seq
                  tone="bad"
                  items={[
                    <code key="a" className="zp-mono">agent: payments.transfer</code>,
                    "Tool executes immediately",
                    "Found in the logs later",
                  ]}
                />
              </div>
              <div className="zp-compare-col">
                <Seq
                  tone="good"
                  items={[
                    <code key="a" className="zp-mono">agent: payments.transfer</code>,
                    "Policy evaluated",
                    "ESCALATE to an approver",
                    "Evidence hash recorded",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL */}
      <section className="zp-section zp-section--alt zp-section--line">
        <div className="zp-container">
          <div className="zp-feature">
            <Reveal className="zp-feature-text">
              <Eyebrow>Control</Eyebrow>
              <h2 className="zp-hlg">Define exactly what runs</h2>
              <p className="zp-lead">
                Every action returns one of three decisions, evaluated against context, policy, risk and authorization
                before it reaches a real system.
              </p>
              <Accordion items={POLICY_ITEMS} />
              <div className="zp-btn-row">
                <Btn href="/docs" kind="dark">
                  Read the docs
                </Btn>
                <Btn href="/pilot" kind="outline">
                  Request a pilot
                </Btn>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="zp-art">
                <LiveConsole />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* OBSERVE */}
      <section className="zp-section zp-section--line">
        <div className="zp-container">
          <div className="zp-feature zp-feature--rev">
            <Reveal className="zp-feature-text">
              <Eyebrow>Observe</Eyebrow>
              <h2 className="zp-hlg">Get full insight into every action</h2>
              <p className="zp-lead">
                Every decision becomes a tamper-evident record. Customers and auditors can verify the chain without
                trusting us.
              </p>
              <Accordion items={EVIDENCE_ITEMS} />
              <div className="zp-btn-row">
                <Btn href="/security" kind="dark">
                  Read about security
                </Btn>
              </div>
            </Reveal>
            <Reveal i={1}>
              <div className="zp-art">
                <AuditMock />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DECISION MODES */}
      <section className="zp-section zp-section--alt zp-section--line">
        <div className="zp-container">
          <Reveal>
            <Eyebrow>One decision per action</Eyebrow>
            <h2 className="zp-hlg" style={{ marginTop: 16 }}>
              The Aegisora difference
            </h2>
            <p className="zp-lead" style={{ marginTop: 16 }}>
              Three outcomes and one record. Pick a mode to see how a request moves from the agent to a decision.
            </p>
          </Reveal>
          <Modes />
        </div>
      </section>

      {/* PRINCIPLE BAND */}
      <section className="zp-band zp-section">
        <div className="zp-container">
          <div className="zp-quote-rule" style={{ background: "rgba(255,255,255,.22)" }} />
          <div className="zp-quote">
            <Reveal>
              <blockquote>
                Prompts are not controls. A policy at the execution boundary is.
              </blockquote>
              <cite>Why Aegisora sits between the agent and the action</cite>
            </Reveal>
            <Reveal i={1}>
              <div className="zp-art">
                <div className="zp-facts">
                  {[
                    ["Default BLOCK", "Without a matching policy, nothing runs."],
                    ["Gapless evidence", "Hash-chained records with sequential numbers."],
                    ["Verified offline", "A standalone verifier on your own machine."],
                  ].map(([t, b]) => (
                    <div key={t} className="zp-fact">
                      <b>{t}</b>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="zp-section zp-section--alt">
        <div className="zp-container">
          <Reveal className="zp-center">
            <Eyebrow plain>Security at scale</Eyebrow>
            <h2 className="zp-hlg" style={{ marginTop: 16 }}>
              Security built into <span className="zp-accent">every action</span>
            </h2>
          </Reveal>
          <Reveal i={1}>
            <div style={{ marginTop: 48 }}>
              <div className="zp-lines zp-lines--5">
                {SECURITY.map((s) => (
                  <div key={s.title} className="zp-sec-cell">
                    <s.icon size={18} aria-hidden />
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="zp-sec-join">
                <span>
                  <Plus size={14} aria-hidden />
                </span>
              </div>
              <div className="zp-controls">
                <p className="zp-controls-title">Platform controls</p>
                <div className="zp-chips">
                  {CONTROLS.map((c) => (
                    <span key={c} className="zp-chip">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ marginTop: 20, textAlign: "center" }}>
                <Link href="/security" className="zp-textlink">
                  Read about security <ArrowRight size={14} aria-hidden />
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PILOT */}
      <section className="zp-section zp-section--line">
        <div className="zp-container">
          <Reveal>
            <Eyebrow>Enterprise pilot</Eyebrow>
            <h2 className="zp-hlg" style={{ marginTop: 16, maxWidth: "18ch" }}>
              From first call to a report you can review
            </h2>
            <p className="zp-lead" style={{ marginTop: 16 }}>
              A scoped, time-boxed evaluation on your own agents, in an isolated workspace.
            </p>
          </Reveal>
          <Reveal i={1}>
            <div className="zp-lines zp-lines--5" style={{ marginTop: 48 }}>
              {STEPS.map((s) => (
                <div key={s.n} className="zp-step">
                  <span className="zp-step-n">{s.n}</span>
                  <h3 className="zp-hsm">{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link href="/pilot" className="zp-textlink">
                Apply for the pilot <ArrowRight size={14} aria-hidden />
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="zp-band zp-cta zp-section">
        <div className="zp-container">
          <div className="zp-cta-grid">
            <div>
              <h2 className="zp-hxl">Go from agent demo to governed production</h2>
              <p className="zp-lead">
                Create a test workspace, send one request and read the decision. Without a matching policy the default
                is BLOCK.
              </p>
              <div className="zp-btn-row">
                <Btn href="/pilot">Request a pilot</Btn>
                <Btn href="/signup" kind="outline">
                  Test Aegisora
                </Btn>
              </div>
            </div>
            <div className="zp-code">
              <div className="zp-code-bar">
                <i style={{ background: "#f87171" }} />
                <i style={{ background: "#fbbf24" }} />
                <i style={{ background: "#34d399" }} />
                <span style={{ marginLeft: 10 }}>illustrative request</span>
              </div>
              <pre>{SNIPPET}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
