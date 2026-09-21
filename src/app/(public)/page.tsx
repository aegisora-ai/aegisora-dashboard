import Link from "next/link";
import { RuntimeCanvas } from "@/components/aegisora/runtime-canvas";
import { SiteHeader } from "@/components/aegisora/site-header";

const outcomes = [
  {
    state: "ALLOW",
    tone: "border-allow text-allow",
    gate: "Gate open",
    text: "The action passed applicable governance checks. The execution boundary lets it proceed.",
    result: "Execution proceeds",
  },
  {
    state: "BLOCK",
    tone: "border-block text-block",
    gate: "Gate closed",
    text: "The action violates a policy, security condition or protected boundary. The execution path is stopped.",
    result: "Execution does not happen",
  },
  {
    state: "ESCALATE",
    tone: "border-escalate text-escalate",
    gate: "Gate paused",
    text: "The action cannot proceed automatically. Execution is paused and routed to an authorized human.",
    result: "Execution waits for approval",
  },
];

const enterprise = [
  "Workspace isolation",
  "Role-based access",
  "Policy governance",
  "Human approval",
  "Audit trail",
  "Evidence records",
  "Provider control",
  "Incident and alert workflows",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
          <p className="font-mono text-xs tracking-[0.25em] text-cyan">
            AGENT EXECUTION CONTROL
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Secure what your AI agents are allowed to do.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Aegisora sits at the execution boundary of autonomous systems. Every
            sensitive action is evaluated against context, policy, risk and
            authorization before it reaches the real environment.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Test Aegisora
            </Link>
            
              href="#enterprise"
              className="rounded-sm border border-border px-6 py-3 text-sm font-medium hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Talk to Enterprise
            </a>
          </div>
        </section>

        <section id="runtime" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
          <RuntimeCanvas />
        </section>

        <section className="border-y border-border bg-surface-1">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Model output is not execution authority.
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>An AI model can generate an intention. An agent can propose an action.</p>
              <p>
                That does not mean the action should run. Aegisora creates an
                explicit decision boundary between what an agent proposes and
                what reaches your systems.
              </p>
            </div>
          </div>
        </section>

        <section id="outcomes" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
          <p className="font-mono text-xs tracking-[0.25em] text-muted-foreground">
            THREE EXECUTION STATES
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Allow. Block. Escalate.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {outcomes.map((o) => (
              <article key={o.state} className={`border-t-2 bg-surface-2 p-6 ${o.tone.split(" ")[0]}`}>
                <div className={`font-mono text-sm font-semibold tracking-[0.2em] ${o.tone.split(" ")[1]}`}>
                  {o.state}
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{o.gate}</div>
                <p className="mt-5 text-sm leading-relaxed text-foreground">{o.text}</p>
                <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
                  {o.result}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="enterprise" className="scroll-mt-20 border-t border-border bg-surface-1">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Built around the boundary.</h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Enterprise controls follow from the runtime model: who requested
                what, under which policy, with which decision, and what evidence
                remains.
              </p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {enterprise.map((e) => (
                <li key={e} className="bg-surface-2 px-4 py-3.5 text-sm">{e}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span className="font-semibold tracking-[0.2em] text-foreground">AEGISORA</span>
          <span>Runtime security for AI agents</span>
        </div>
      </footer>
    </>
  );
}