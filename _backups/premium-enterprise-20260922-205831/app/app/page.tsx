import Link from "next/link";
import styles from "./page.module.css";

const flow = [
  ["01", "REQUEST", "Agent proposes an action"],
  ["02", "CONTEXT", "Identity, tool, action and runtime context"],
  ["03", "POLICY", "Applicable governance rules"],
  ["04", "RISK", "Runtime security signals"],
  ["05", "DECISION", "ALLOW / BLOCK / ESCALATE"],
  ["06", "EXECUTION", "Only after the boundary is satisfied"],
  ["07", "EVIDENCE", "Traceable decision and execution record"],
];

const outcomes = [
  {
    key: "ALLOW",
    title: "Allow",
    copy: "The action satisfies the active runtime controls and may proceed.",
  },
  {
    key: "BLOCK",
    title: "Block",
    copy: "The action violates a control and must not cross the execution boundary.",
  },
  {
    key: "ESCALATE",
    title: "Escalate",
    copy: "The action requires additional review before execution can continue.",
  },
];

export default function Home() {
  return (
    <main className={styles.site}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="Aegisora home">
          <span className={styles.brandMark}>A</span>
          <span>
            <strong>AEGISORA</strong>
            <small>RUNTIME SECURITY</small>
          </span>
        </Link>

        <div className={styles.navLinks}>
          <a href="#product">Product</a>
          <a href="#how">How it works</a>
          <a href="#evidence">Evidence</a>
          <a href="https://github.com/aegisora-ai/aegisora" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>

        <div className={styles.navActions}>
          <Link href="/proof" className={styles.navSecondary}>Live proof</Link>
          <a href="https://app.aegisora.org" className={styles.navPrimary}>Open platform</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            RUNTIME SECURITY FOR AI AGENTS
          </div>

          <h1>
            Don&apos;t just secure the model.
            <span>Secure what the agent is allowed to do.</span>
          </h1>

          <p className={styles.heroLead}>
            Aegisora sits at the execution boundary of autonomous AI agents,
            evaluating actions before they reach tools, APIs and production systems.
          </p>

          <div className={styles.heroActions}>
            <Link href="/proof" className={styles.primaryButton}>
              Run live runtime proof <span>→</span>
            </Link>
            <a
              href="https://github.com/aegisora-ai/aegisora"
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryButton}
            >
              Inspect the open source
            </a>
          </div>

          <div className={styles.proofStrip}>
            <span>3.0 execution boundary</span>
            <span>Policy enforcement</span>
            <span>Audit &amp; evidence</span>
            <span>Human escalation</span>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Aegisora runtime execution boundary">
          <div className={styles.visualTopline}>
            <span>AGENT ACTION REQUEST</span>
            <span className={styles.muted}>PRE-EXECUTION GATE</span>
          </div>

          <div className={styles.agentNode}>
            <div className={styles.nodeKicker}>SOURCE</div>
            <strong>Autonomous Agent</strong>
            <span>tool.execute</span>
          </div>

          <div className={styles.connector} />

          <div className={styles.gate}>
            <div className={styles.gateHead}>
              <span className={styles.gateBadge}>AEGISORA</span>
              <span>runtime control</span>
            </div>

            <div className={styles.gateSteps}>
              <span>identity</span>
              <span>policy</span>
              <span>risk</span>
              <span>decision</span>
            </div>

            <div className={styles.decisionRow}>
              <span className={styles.allow}>ALLOW</span>
              <span className={styles.block}>BLOCK</span>
              <span className={styles.escalate}>ESCALATE</span>
            </div>
          </div>

          <div className={styles.connector} />

          <div className={styles.executionNode}>
            <div className={styles.nodeKicker}>AFTER DECISION</div>
            <strong>Execution boundary</strong>
            <span>audit / evidence attached</span>
          </div>
        </div>
      </section>

      <section id="product" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>THE PROBLEM</span>
          <h2>
            Agent reasoning is not an authorization system.
          </h2>
          <p>
            Autonomous agents can call tools, access services and change external
            systems. Aegisora makes the decision to allow those actions explicit,
            enforceable and traceable.
          </p>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <span>OBSERVABILITY</span>
            <strong>Shows what happened.</strong>
            <p>Useful for investigation, but it does not itself stop the action.</p>
          </div>

          <div className={`${styles.compareCard} ${styles.compareActive}`}>
            <span>AEGISORA</span>
            <strong>Controls what can happen.</strong>
            <p>
              The action crosses the boundary only after the runtime produces an
              explicit decision.
            </p>
          </div>

          <div className={styles.compareCard}>
            <span>APPLICATION LOGIC</span>
            <strong>Defines intent.</strong>
            <p>Still needs a consistent enforcement boundary around consequential actions.</p>
          </div>
        </div>
      </section>

      <section id="how" className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>HOW AEGISORA WORKS</span>
          <h2>The execution path is the product.</h2>
          <p>
            Every stage exists to answer one question: can this agent action cross
            into the system it wants to affect?
          </p>
        </div>

        <div className={styles.flow}>
          {flow.map(([number, label, copy]) => (
            <div className={styles.flowItem} key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>DECISION ENGINE</span>
          <h2>One boundary. Three explicit outcomes.</h2>
          <p>
            Aegisora&apos;s enforcement model makes the control point visible to
            engineers, security teams and operators.
          </p>
        </div>

        <div className={styles.outcomeGrid}>
          {outcomes.map((outcome) => (
            <article className={styles.outcomeCard} key={outcome.key}>
              <span className={styles.outcomeCode}>{outcome.key}</span>
              <h3>{outcome.title}</h3>
              <p>{outcome.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="evidence" className={`${styles.section} ${styles.evidenceSection}`}>
        <div className={styles.evidenceCopy}>
          <span className={styles.sectionEyebrow}>AUDIT &amp; EVIDENCE</span>
          <h2>Decisions should leave a trail.</h2>
          <p>
            Runtime enforcement produces decision, trace, execution and evidence
            identifiers so teams can connect the security decision to the action
            context.
          </p>
          <Link href="/proof" className={styles.textLink}>
            Run the real 3.0 check →
          </Link>
        </div>

        <div className={styles.evidencePanel}>
          <div className={styles.panelHeader}>
            <span>EXAMPLE RUNTIME EVENT</span>
            <span className={styles.panelLive}>REFERENCE DECISION</span>
          </div>

          <div className={styles.eventRow}><span>agentId</span><strong>example-agent</strong></div>
          <div className={styles.eventRow}><span>tool</span><strong>database.write</strong></div>
          <div className={styles.eventRow}><span>action</span><strong>tool.execute</strong></div>
          <div className={styles.eventRow}><span>policy</span><strong>evaluation-policy</strong></div>
          <div className={styles.eventRow}><span>decision</span><strong className={styles.blockText}>BLOCK</strong></div>
          <div className={styles.eventRow}><span>execution</span><strong>not_attempted</strong></div>
          <div className={styles.eventRow}><span>traceId</span><strong className={styles.mono}>trace_••••••••</strong></div>
          <div className={styles.eventRow}><span>evidenceId</span><strong className={styles.mono}>evidence_••••••</strong></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.enterpriseGrid}>
          <div>
            <span className={styles.sectionEyebrow}>BUILT FOR REAL EVALUATION</span>
            <h2>Give engineering teams something they can actually test.</h2>
            <p>
              The next step is not another marketing page. It is putting a real
              agent action through the runtime, seeing the decision, and keeping
              the resulting evidence.
            </p>
          </div>

          <div className={styles.enterprisePoints}>
            <div><strong>01</strong><span>Connect an agent or action path.</span></div>
            <div><strong>02</strong><span>Apply a concrete policy boundary.</span></div>
            <div><strong>03</strong><span>Observe ALLOW / BLOCK / ESCALATE.</span></div>
            <div><strong>04</strong><span>Review the resulting execution evidence.</span></div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <span className={styles.sectionEyebrow}>NEXT STEP</span>
        <h2>Stop explaining the boundary. Put an action through it.</h2>
        <p>
          Run the live proof against the Aegisora runtime or open the platform for
          a deeper evaluation.
        </p>
        <div className={styles.heroActions}>
          <Link href="/proof" className={styles.primaryButton}>
            Run live runtime proof <span>→</span>
          </Link>
          <a href="https://app.aegisora.org" className={styles.secondaryButton}>
            Open platform
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>AEGISORA</strong>
          <span>Runtime security &amp; governance for autonomous AI agents.</span>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/proof">Live proof</Link>
          <a href="https://github.com/aegisora-ai/aegisora" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://app.aegisora.org">Platform</a>
        </div>
      </footer>
    </main>
  );
}
