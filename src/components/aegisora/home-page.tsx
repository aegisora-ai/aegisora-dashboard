import "@/styles/home-page.css";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CardGrid, CodeBlock, CtaBand, Section, Steps, type CardItem } from "@/components/aegisora/page-kit";
import { DecisionDemo } from "@/components/aegisora/decision-demo";

/* One data set drives the hero diagram on desktop and the stacked list on phones. */
const LANES = [
  {
    action: "crm.read_ticket",
    meta: "support-agent, in scope",
    verdict: "ALLOW",
    tone: "allow",
    outTitle: "Ticket system",
    outMeta: "Read completed",
  },
  {
    action: "payments.transfer",
    meta: "finance-agent, $48,000",
    verdict: "ESCALATE",
    tone: "escalate",
    outTitle: "Approval queue",
    outMeta: "Waiting for a person",
  },
  {
    action: "db.drop_table users",
    meta: "code-agent, destructive",
    verdict: "BLOCK",
    tone: "block",
    outTitle: "Not executed",
    outMeta: "Stopped at the boundary",
  },
] as const;

const PROBLEMS: CardItem[] = [
  {
    icon: "KeyRound",
    title: "Access is checked once",
    body: "A role granted at setup says little about the specific payment, deletion or export an agent requests later.",
  },
  {
    icon: "Eye",
    title: "Logs describe, they do not decide",
    body: "Activity logs are useful after the fact. On their own they do not stop a destructive call before it runs.",
  },
  {
    icon: "Fingerprint",
    title: "Reviewers need proof",
    body: "Security teams and auditors need the decision, the policy behind it, and a record that cannot be quietly rewritten.",
  },
];

const STEPS: [string, string][] = [
  ["Request", "The agent proposes an action with its context, such as the tool, the target and any amount involved."],
  ["Evaluate", "Aegisora checks the request against policy, risk and the authority the agent holds."],
  ["Decide", "The verdict is ALLOW, ESCALATE or BLOCK. With no matching policy, the default is BLOCK."],
  ["Record", "Each decision carries a decision id, a reason and an evidence hash, stored in a hash-chained log."],
];

const PILLARS: CardItem[] = [
  {
    icon: "ShieldCheck",
    title: "Policies",
    body: "Rules with conditions and redaction, enforced on every call and versioned.",
    href: "/docs/technical#authority",
  },
  {
    icon: "UserCheck",
    title: "Approvals",
    body: "Human review for the narrow set of actions that need it. Execution waits until a person decides.",
    href: "/docs/technical#approvals",
  },
  {
    icon: "ScrollText",
    title: "Evidence",
    body: "A SHA-256 hash-chained log that you can verify independently.",
    href: "/docs/technical#evidence",
  },
];

const CHAIN = [
  { id: "dec_0001", verdict: "ALLOW", tone: "allow", prev: "start of log", hash: "9c41f2...e07a" },
  { id: "dec_0002", verdict: "ESCALATE", tone: "escalate", prev: "9c41f2...e07a", hash: "b27d10...4f93" },
  { id: "dec_0003", verdict: "BLOCK", tone: "block", prev: "b27d10...4f93", hash: "e15a8c...71d0" },
];

const CODE = [
  "const decision = await checkAction({ agent, action, context });",
  "",
  "switch (decision.verdict) {",
  '  case "ALLOW":',
  "    return runTool(action);",
  '  case "ESCALATE":',
  "    return queueForApproval(decision.id);",
  "  default:",
  "    // BLOCK, or any verdict you do not recognize: fail closed",
  "    return stop(decision.reason);",
  "}",
].join("\n");

const FAQ = [
  {
    q: "Can I try Aegisora today?",
    a: "Yes. Create a test workspace to evaluate a first agent action. There is no paid plan and no online checkout today.",
  },
  {
    q: "Is pricing published?",
    a: "Not yet. Pricing, hosting and service levels are not published. Any paid pilot is scoped and agreed in writing before customer data or production systems are connected.",
  },
  {
    q: "Where does Aegisora sit in my stack?",
    a: "Between the agent and the tools it calls. Each sensitive action is sent for a decision before the tool call runs.",
  },
  {
    q: "What happens when no policy matches?",
    a: "The action is blocked. Aegisora fails closed by default.",
  },
];

export default function HomePage() {
  return (
    <div className="hm-root">
      <section className="zp zpk-hero">
        <div className="zpk-wrap zpk-hero-in zpk-hero-in--split">
          <div className="zpk-hero-text">
            <p className="zp-eyebrow">Runtime security for AI agents</p>
            <h1 className="zpk-h1">Your agents act. Aegisora decides first.</h1>
            <p className="zpk-typed">Fail closed by default. Evidence you can verify.</p>
            <p className="zpk-lead">
              Aegisora sits at the execution boundary of autonomous systems. Each sensitive action is checked
              against context, policy, risk and authorization, then returned as ALLOW, ESCALATE or BLOCK before it
              executes.
            </p>
            <div className="zpk-actions">
              <Link href="/signup" className="zp-btn zp-btn--primary">
                Test Aegisora
              </Link>
              <Link href="/enterprise" className="zp-btn zp-btn--outline">
                Talk to Enterprise
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <p className="zpk-notice">
              No paid plan and no online checkout today. Design partner pilots are scoped and agreed in writing.
            </p>
          </div>

          <div className="hm-hero-art">
            <div className="hm-frame">
              <div className="hm-frame-bar">
                <b>Runtime decisions</b>
                <span className="zp-tag">Sample data</span>
              </div>

              <svg
                className="hm-art hm-art-wide"
                viewBox="0 0 600 380"
                role="img"
                aria-label="Three agent actions reach the execution boundary. One is allowed, one waits for approval, and one is blocked before it runs."
              >
                <text className="hm-art-label" x="24" y="34">AGENT PROPOSES</text>
                <text className="hm-art-label" x="380" y="34">TOOLS AND SYSTEMS</text>
                <line className="hm-art-boundary" x1="300" y1="50" x2="300" y2="346" />
                <text className="hm-art-label" x="300" y="368" textAnchor="middle">
                  EXECUTION BOUNDARY
                </text>
                {LANES.map((lane, i) => {
                  const top = 56 + i * 108;
                  const mid = top + 36;
                  const blocked = lane.tone === "block";
                  return (
                    <g key={lane.action}>
                      <rect className="hm-art-card" x="24" y={top} width="200" height="72" rx="12" />
                      <text className="hm-art-strong" x="40" y={mid - 6}>
                        {lane.action}
                      </text>
                      <text className="hm-art-muted" x="40" y={mid + 14}>
                        {lane.meta}
                      </text>
                      <path
                        className={"hm-art-line hm-art-line--" + lane.tone}
                        d={blocked ? `M224 ${mid} H292` : `M224 ${mid} H380`}
                      />
                      {blocked ? (
                        <path
                          className="hm-art-cross"
                          d={`M294 ${mid - 6} L306 ${mid + 6} M306 ${mid - 6} L294 ${mid + 6}`}
                        />
                      ) : null}
                      <text
                        className={"hm-art-verdict hm-art-verdict--" + lane.tone}
                        x={blocked ? 258 : 340}
                        y={mid - 10}
                        textAnchor="middle"
                      >
                        {lane.verdict}
                      </text>
                      <rect className="hm-art-card" x="380" y={top} width="196" height="72" rx="12" />
                      <text className="hm-art-strong" x="396" y={mid - 6}>
                        {lane.outTitle}
                      </text>
                      <text className="hm-art-muted" x="396" y={mid + 14}>
                        {lane.outMeta}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <ul className="hm-art-stack" aria-label="Three example decisions">
                {LANES.map((lane) => (
                  <li key={lane.action} className="hm-stack-row">
                    <div>
                      <span className="hm-stack-action">{lane.action}</span>
                      <span className="hm-stack-meta">{lane.meta}</span>
                    </div>
                    <span className={"hm-verdict hm-verdict--" + lane.tone}>{lane.verdict}</span>
                    <span className="hm-stack-out">
                      {lane.outTitle}: {lane.outMeta}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="zp hm-status" aria-label="Availability today">
        <div className="zpk-wrap hm-status-in">
          <p className="hm-status-title">Availability today</p>
          <ul className="hm-status-list">
            <li>
              <span className="hm-dot hm-dot--ok" aria-hidden="true" />
              <span>
                <b>Test workspaces</b> open in early access
              </span>
            </li>
            <li>
              <span className="hm-dot hm-dot--mid" aria-hidden="true" />
              <span>
                <b>Design partner pilots</b> scoped and agreed in writing
              </span>
            </li>
            <li>
              <span className="hm-dot hm-dot--off" aria-hidden="true" />
              <span>
                <b>Production</b> not yet available, hosting and service levels not verified
              </span>
            </li>
          </ul>
        </div>
      </section>

      <Section
        eyebrow="The problem"
        title="Agents take actions. Logs arrive afterwards."
        intro="Permissions are often granted once, at setup. A sensitive action needs a decision at the moment it is requested."
      >
        <CardGrid items={PROBLEMS} cols={3} />
      </Section>

      <Section
        tone="alt"
        eyebrow="How it works"
        title="One decision path for every sensitive action."
        intro="The same path applies whether an action reads a ticket or moves money."
      >
        <Steps items={STEPS} cols={4} />
      </Section>

      <Section
        eyebrow="Interactive example"
        title="Select an action and read the verdict."
        intro="The verdicts below come from a small, illustrative policy set. They are not read from a live workspace."
      >
        <DecisionDemo />
      </Section>

      <Section tone="alt" eyebrow="Platform" title="The parts that make a decision defensible.">
        <CardGrid items={PILLARS} cols={3} />
      </Section>

      <Section
        eyebrow="Evidence"
        title="Records you can check, not just read."
        intro="Every record includes the hash of the record before it. Changing an earlier entry breaks verification for everything after it."
      >
        <ol className="hm-chain" aria-label="Example of a hash-chained evidence log">
          {CHAIN.map((rec) => (
            <li key={rec.id} className="hm-rec">
              <div className="hm-rec-top">
                <span className="hm-rec-id">{rec.id}</span>
                <span className={"hm-verdict hm-verdict--" + rec.tone}>{rec.verdict}</span>
              </div>
              <dl>
                <div>
                  <dt>Previous hash</dt>
                  <dd>{rec.prev}</dd>
                </div>
                <div>
                  <dt>Record hash</dt>
                  <dd>{rec.hash}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
        <p className="hm-chain-note">Example values, truncated for display.</p>
      </Section>

      <Section
        tone="alt"
        eyebrow="For developers"
        title="Put the check in front of every tool call."
        intro="Call Aegisora before a sensitive tool runs. Act on ALLOW, hold on ESCALATE and stop on BLOCK. Your application keeps control of execution."
      >
        <CodeBlock code={CODE} caption="Illustrative pseudo-code. The quickstart shows the actual request format." />
        <div className="zpk-actions">
          <Link href="/docs/quickstart" className="zp-btn zp-btn--primary">
            Read the quickstart
          </Link>
          <Link href="/docs/technical" className="zp-btn zp-btn--outline">
            Technical documentation
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Questions teams ask before a pilot.">
        <div className="zpk-faq">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Test one decision in your own workspace."
        body="Create a test workspace, send one request and read the verdict. Without a matching policy, the default is BLOCK."
        primary={{ label: "Test Aegisora", href: "/signup" }}
        secondary={{ label: "Apply for a design partner pilot", href: "/pilot" }}
      />
    </div>
  );
}