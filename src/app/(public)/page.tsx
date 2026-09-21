import Link from "next/link";
import { RuntimeSimulator } from "@/components/aegisora/runtime-simulator";
import { DecisionBadge } from "@/components/aegisora/state-badge";
import { btnOutline, btnPrimary } from "@/lib/ui";

const architecture = [
  ["REQUEST", "An agent proposes an action against a tool, system or resource.", "Request record"],
  ["CONTEXT", "Workspace, identity, access and environment are resolved. Security analysis runs on the request.", "Resolved context"],
  ["POLICY", "The applicable policy is evaluated against the request.", "Policy result"],
  ["RISK", "A risk level (LOW, MEDIUM, HIGH, CRITICAL) is assessed from the action and its context.", "Risk assessment"],
  ["DECISION", "ALLOW, BLOCK or ESCALATE is resolved.", "Decision ID"],
  ["ENFORCEMENT", "The execution gate opens, stops or pauses.", "Enforcement status"],
  ["EXECUTION", "The action runs in the environment, or it does not.", "Execution ID"],
  ["EVIDENCE", "The decision chain is recorded for audit.", "Evidence and audit IDs"],
];

const outcomes = [
  {
    state: "ALLOW",
    edge: "border-allow",
    text: "text-allow",
    gate: "Gate open",
    body: "The action passed applicable governance checks. The execution boundary lets it proceed.",
    result: "Execution proceeds",
  },
  {
    state: "BLOCK",
    edge: "border-block",
    text: "text-block",
    gate: "Gate closed",
    body: "The action violates a policy, security condition or protected boundary. The execution path is stopped.",
    result: "Execution does not happen",
  },
  {
    state: "ESCALATE",
    edge: "border-escalate",
    text: "text-escalate",
    gate: "Gate paused",
    body: "The action cannot proceed automatically. Execution is paused and routed to an authorized human.",
    result: "Execution waits for approval",
  },
];

const evidenceChain = [
  ["Decision", "dec_01J8XQ4M2K"],
  ["Enforcement", "Gate paused"],
  ["Execution", "exe_5b10d8e4"],
  ["Evidence", "evd_a24c07f1"],
  ["Audit", "aud_3e9b62d0"],
];

const enterprise = [
  ["Workspace isolation", "Agents, policies, decisions and evidence belong to a workspace."],
  ["Role-based access", "owner, admin, developer, analyst, auditor and viewer roles."],
  ["Policy governance", "Versioned policies with defined bindings."],
  ["Human approval", "High-risk actions pause until an authorized person resolves them."],
  ["Audit trail", "Who did what, through which agent, under which policy."],
  ["Evidence records", "Decision-linked records with trace and execution identifiers."],
  ["Provider control", "Governance over the providers agents execute through."],
  ["Incidents and alerts", "Alerts, incidents and webhooks for operational response."],
];

const developerSteps = [
  ["Integrate at the execution boundary", "Route an agent's proposed actions through the Aegisora runtime before they execute."],
  ["Define policy", "Describe which agents may perform which actions, in which environments."],
  ["Evaluate requests", "Each request is evaluated against context, policy and risk."],
  ["Enforce decisions", "The execution gate opens, stops or pauses according to the decision."],
  ["Inspect evidence", "Every decision leaves a trace you can inspect."],
];

const tiers = [
  {
    name: "Developer",
    tag: "Open source",
    body: "Run and integrate the open-source runtime in your own environment.",
    points: ["Runtime and policy evaluation", "Local development and testing"],
    cta: "Test Aegisora",
    href: "/signup",
  },
  {
    name: "Team",
    tag: "Growth",
    body: "For teams operating agents in a shared workspace.",
    points: ["Shared workspace", "Agents, policies and decisions", "Evidence and audit records"],
    cta: "Test Aegisora",
    href: "/signup",
  },
  {
    name: "Enterprise",
    tag: "Custom",
    body: "For organizations that need governance across teams and environments.",
    points: [
      "Workspaces and role-based access",
      "Advanced policy governance",
      "Approvals, audit and evidence",
      "Integrations and support",
    ],
    cta: "Talk to Enterprise",
    href: "/#enterprise",
  },
];

const faqs = [
  ["What does Aegisora secure?", "Aegisora secures what an AI agent is allowed to execute. It evaluates each proposed action before it reaches the real environment. It is not focused on model weights or prompts."],
  ["Where does Aegisora sit in an agent architecture?", "At the execution boundary: between the action an agent proposes and the system that would carry it out."],
  ["What is the difference between ALLOW, BLOCK and ESCALATE?", "ALLOW lets the action execute. BLOCK stops it. ESCALATE pauses execution and routes the request to an authorized human."],
  ["Can high-risk actions require human approval?", "Yes. An escalated action becomes a pending approval that can be approved, rejected or expire. Execution waits for that resolution."],
  ["What evidence is recorded?", "Each decision is linked to identifiers such as decision, trace, execution, evidence and audit IDs, together with the agent, workspace, policy, decision state and enforcement result."],
  ["How does workspace isolation work?", "Agents, policies, decisions and evidence belong to a workspace, and access is governed by roles: owner, admin, developer, analyst, auditor and viewer."],
  ["Is Aegisora open source?", "The runtime is developed as an open-source engineering product, so developers can inspect and work with how decisions are made."],
  ["What is Aegisora 3.0?", "Aegisora 3.0 is the current product: runtime security, execution control, policy enforcement, approvals, evidence and audit for autonomous agents, organized by workspace and role."],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs tracking-[0.25em] text-muted-foreground">{children}</p>;
}

export default function Home() {
  return (
    <>
      <section className="aeg-hero aeg-grid-bg border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-16 md:pt-24">
          <p className="font-mono text-xs tracking-[0.25em] text-cyan">AGENT EXECUTION CONTROL</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.04] md:text-7xl">
            Secure what your AI agents are allowed to do.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Aegisora sits at the execution boundary of autonomous systems. Every sensitive action is
            evaluated against context, policy, risk and authorization before it reaches the real environment.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
            <Link href="/enterprise" className={btnOutline}>Talk to Enterprise</Link>
          </div>
          <div id="runtime" className="mt-14 scroll-mt-24">
            <RuntimeSimulator />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <Eyebrow>THE EXECUTION PROBLEM</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
              Model output is not execution authority.
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>Agents can reason. Agents can act. That does not mean every action should execute.</p>
            <p>
              An AI model can generate an intention and an agent can propose an action. Aegisora creates an
              explicit decision boundary between what the agent proposes and what reaches your systems.
            </p>
            <ol className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border bg-border text-center font-mono text-[11px] tracking-wider text-foreground">
              <li className="bg-surface-2 px-2 py-3">AGENT INTENT</li>
              <li className="bg-surface-4 px-2 py-3 text-cyan">AEGISORA</li>
              <li className="bg-surface-2 px-2 py-3">REAL ENVIRONMENT</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <Eyebrow>RUNTIME ARCHITECTURE</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">From request to evidence.</h2>
        <div className="mt-10 overflow-x-auto rounded-md border border-border bg-surface-2">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">What happens</th>
                <th className="px-4 py-3 font-medium">What it produces</th>
              </tr>
            </thead>
            <tbody>
              {architecture.map(([stage, what, out], i) => (
                <tr key={stage} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold tracking-wider">
                    <span className="mr-3 text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    {stage}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{what}</td>
                  <td className="px-4 py-3 font-mono text-xs">{out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="outcomes" className="scroll-mt-20 border-y border-border bg-surface-1">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Eyebrow>THREE EXECUTION STATES</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Allow. Block. Escalate.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {outcomes.map((o) => (
              <article key={o.state} className={`border-t-2 bg-surface-2 p-6 ${o.edge}`}>
                <div className={`font-mono text-sm font-semibold tracking-[0.2em] ${o.text}`}>{o.state}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{o.gate}</div>
                <p className="mt-5 text-sm leading-relaxed">{o.body}</p>
                <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">{o.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="policy" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-6 py-24 md:grid-cols-2">
        <div>
          <Eyebrow>POLICY CONTROL</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Policies are executable controls.</h2>
          <p className="mt-4 text-muted-foreground">
            A policy states which agent may perform which action, in which environment, and what should
            happen when a threshold is reached.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-md border border-border bg-surface-2 p-4 font-mono text-xs leading-6">
            <code>{`agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`}</code>
          </pre>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">Illustrative policy expression.</p>
        </div>
        <div>
          <Eyebrow>HOW IT RESOLVES</Eyebrow>
          <ol className="mt-4 divide-y divide-border rounded-md border border-border bg-surface-2">
            {[
              "The request matches action external_transfer by finance-operator.",
              "Environment is production and the threshold is elevated, so the rule applies.",
              "Risk resolves to HIGH.",
              "Decision: ESCALATE. The gate pauses and an approval is created as PENDING.",
            ].map((s, i) => (
              <li key={s} className="flex gap-4 px-4 py-3.5 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center gap-3">
            <DecisionBadge state="ESCALATE" />
            <Link href="/dashboard/decisions/dec_01J8XQ4M2K" className="text-sm text-cyan underline-offset-4 hover:underline">
              Open the sample decision inspector
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2">
          <div>
            <Eyebrow>HUMAN APPROVAL</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">A control boundary, not a notification.</h2>
            <p className="mt-4 text-muted-foreground">
              An escalated action pauses execution. The approver sees the requesting agent, the proposed
              action, why it was flagged, the risk level, the policy involved and the workspace context
              before deciding.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border font-mono text-xs tracking-wider">
            <li className="bg-surface-2 px-4 py-3 text-escalate">ESCALATE</li>
            <li className="bg-surface-2 px-4 py-3 text-escalate">PENDING APPROVAL</li>
            <li className="grid grid-cols-3 gap-px bg-border">
              <span className="bg-surface-2 px-4 py-3 text-allow">APPROVED</span>
              <span className="bg-surface-2 px-4 py-3 text-block">REJECTED</span>
              <span className="bg-surface-2 px-4 py-3 text-muted-foreground">EXPIRED</span>
            </li>
          </ol>
        </div>
      </section>

      <section id="evidence" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <Eyebrow>EVIDENCE AND AUDIT</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Every important decision leaves a record.</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {evidenceChain.map(([label, value]) => (
            <li key={label} className="bg-surface-2 p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-2 break-all font-mono text-xs">{value}</div>
            </li>
          ))}
        </ol>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">Sample identifiers.</p>
      </section>

      <section id="enterprise" className="scroll-mt-20 border-y border-border bg-surface-1">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Eyebrow>ENTERPRISE CONTROLS</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">Built around the boundary.</h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {enterprise.map(([title, body]) => (
              <li key={title} className="bg-surface-2 p-5">
                <div className="text-sm font-medium">{title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            To discuss deployment, identity and governance requirements, contact us through the Enterprise
            plan once contact channels are published.
          </p>
        </div>
      </section>

      <section id="developers" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <Eyebrow>FOR DEVELOPERS</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Integrate at the execution boundary.</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-5">
          {developerSteps.map(([title, body], i) => (
            <li key={title} className="bg-surface-2 p-5">
              <div className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-2 text-sm font-medium">{title}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className="scroll-mt-20 border-y border-border bg-surface-1">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Eyebrow>PRICING</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Start free. Scale into governance.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {tiers.map((t) => (
              <article key={t.name} className="flex flex-col bg-surface-2 p-6">
                <div className="font-mono text-[11px] tracking-wider text-muted-foreground">{t.tag.toUpperCase()}</div>
                <h3 className="mt-1 text-xl font-semibold">{t.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-border pt-5 text-sm">
                  {t.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link href={t.href} className={`${btnOutline} mt-6`}>{t.cta}</Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Pricing and final plan contents are not yet published.</p>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-24">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Questions about the execution boundary.</h2>
        <div className="mt-8 divide-y divide-border rounded-md border border-border bg-surface-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-medium outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
                {q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight">
            Decide before the action executes.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
            <Link href="/enterprise" className={btnOutline}>Talk to Enterprise</Link>
          </div>
        </div>
      </section>
    </>
  );
}