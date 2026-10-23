import type { CardItem, Cta, Row } from "@/components/aegisora/page-kit";

export type ProductData = {
  eyebrow: string;
  title: string;
  intro: string;
  primary: Cta;
  secondary: Cta;
  rows: Row[];
  stepsEyebrow: string;
  stepsTitle: string;
  stepsIntro: string;
  steps: CardItem[];
  stepCols: 2 | 3 | 4;
  featuresTitle: string;
  features: CardItem[];
  ctaTitle: string;
  ctaBody: string;
};

const START: Cta = { label: "Test Aegisora", href: "/signup" };

export const PRODUCTS: Record<string, ProductData> = {
  runtime: {
    eyebrow: "Product / Runtime",
    title: "Request to evidence, stage by stage.",
    intro:
      "Every agent action moves through the same eight-stage pipeline: request, context, policy, risk, decision, enforcement, execution, evidence. Nothing executes outside it.",
    primary: START,
    secondary: { label: "Run live runtime proof", href: "/proof" },
    rows: [
      { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
      { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
      { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
    ],
    stepsEyebrow: "The pipeline",
    stepsTitle: "Eight stages, one path for every action.",
    stepsIntro: "The same path runs for every agent and every action, so behavior is predictable and every outcome can be explained.",
    steps: [
      { n: "01", title: "Request", body: "The agent proposes an action before it runs." },
      { n: "02", title: "Context", body: "Identity, workspace and the active policy version are attached." },
      { n: "03", title: "Policy", body: "The action is matched against the policies that apply to this agent." },
      { n: "04", title: "Risk", body: "The risk of the request is taken into account alongside policy." },
      { n: "05", title: "Decision", body: "The engine returns ALLOW, BLOCK or ESCALATE." },
      { n: "06", title: "Enforcement", body: "The verdict is enforced at the execution boundary." },
      { n: "07", title: "Execution", body: "Only allowed actions reach the real system." },
      { n: "08", title: "Evidence", body: "The result is recorded with a stable evidence id." },
    ],
    stepCols: 4,
    featuresTitle: "Built to sit in front of production systems.",
    features: [
      { icon: "Lock", title: "Fail closed", body: "Without a matching policy the default verdict is BLOCK." },
      { icon: "Gauge", title: "Deterministic evaluation", body: "Context, policy, risk and authorization are checked together, the same way on every call." },
      { icon: "Zap", title: "One API call", body: "Agents send the action they want to take and read the verdict from the response." },
      { icon: "UserCheck", title: "Human in the loop", body: "Escalations route to a human approver before anything executes." },
      { icon: "Layers", title: "Tenant isolation", body: "Workspaces are isolated with row level security." },
      { icon: "Webhook", title: "Signed delivery", body: "Decisions can be pushed to your SIEM and ticketing with signed, retried webhooks." },
    ],
    ctaTitle: "Put the runtime in front of your agents.",
    ctaBody: "Create a test workspace, send one request and read the decision.",
  },

  policies: {
    eyebrow: "Product / Policies",
    title: "Policies that every agent action has to pass.",
    intro:
      "Write a rule once and enforce it on every call. Policies decide what each agent may do, under which conditions, and what has to be redacted.",
    primary: START,
    secondary: { label: "Read the quickstart", href: "/developers/quickstart" },
    rows: [
      { action: "payments.transfer $4,200", meta: "finance-agent · Under approval limit", v: "ALLOW" },
      { action: "files.export salary.csv", meta: "hr-agent · Sensitive data class", v: "ESCALATE" },
      { action: "customers.delete bulk", meta: "billing-agent · No authorization", v: "BLOCK" },
    ],
    stepsEyebrow: "How policies work",
    stepsTitle: "From rule to enforcement in three steps.",
    stepsIntro: "Policies are data, not code paths hidden inside agents, so security teams can review and change them.",
    steps: [
      { n: "01", title: "Define", body: "Describe which agent may take which action, with conditions such as amounts or data classes." },
      { n: "02", title: "Activate", body: "The active policy version is attached to every evaluation, so each decision points to the rule that produced it." },
      { n: "03", title: "Enforce", body: "Every action is checked against policy at the execution boundary. No match means BLOCK." },
    ],
    stepCols: 3,
    featuresTitle: "Control without slowing agents down.",
    features: [
      { icon: "ShieldCheck", title: "Conditions", body: "Allow, block or escalate based on the content of the request, such as an amount over a limit." },
      { icon: "Eye", title: "Redaction", body: "Remove sensitive fields from what an agent sends or receives." },
      { icon: "GitBranch", title: "Versioned", body: "Each decision records the policy version that was active at the time." },
      { icon: "Users", title: "Per agent and action", body: "Scope rules to a single agent, a group of actions or a whole workspace." },
      { icon: "Lock", title: "Default deny", body: "An action with no matching policy is blocked, never silently allowed." },
      { icon: "KeyRound", title: "Protected changes", body: "Governance changes require an MFA step-up session, a password alone is not enough." },
    ],
    ctaTitle: "Write your first policy today.",
    ctaBody: "Start in a test workspace and see how each action is decided.",
  },

  decisions: {
    eyebrow: "Product / Decisions",
    title: "Three verdicts. Every one explained.",
    intro:
      "Each evaluated action returns ALLOW, BLOCK or ESCALATE together with a reason, a decision id and an evidence hash you can look up later.",
    primary: START,
    secondary: { label: "See the proof", href: "/proof" },
    rows: [
      { action: "deploy.rollback prod", meta: "ops-agent · Policy match", v: "ALLOW" },
      { action: "payments.transfer $48,000", meta: "finance-agent · Above approval limit", v: "ESCALATE" },
      { action: "db.drop_table users", meta: "code-agent · Destructive action denied", v: "BLOCK" },
    ],
    stepsEyebrow: "The verdicts",
    stepsTitle: "A small verdict model that stays readable.",
    stepsIntro: "Three outcomes are enough to express what an agent should do next, and easy for engineers and auditors to reason about.",
    steps: [
      { n: "ALLOW", title: "Proceed", body: "The action is within policy and can execute. The decision is still recorded." },
      { n: "BLOCK", title: "Refuse", body: "The action is denied. The agent receives the verdict and the reason and does not touch the system." },
      { n: "ESCALATE", title: "Ask a human", body: "The action waits for an approver. It runs only if the approver says yes." },
    ],
    stepCols: 3,
    featuresTitle: "Every decision leaves a trail.",
    features: [
      { icon: "Fingerprint", title: "Decision id", body: "A stable id for each decision so teams can reference it in tickets and reviews." },
      { icon: "ScrollText", title: "Evidence hash", body: "Each decision is chained into the evidence log and returns its hash." },
      { icon: "FileText", title: "Plain reasons", body: "Verdicts come with a short reason such as within scope or no authorization." },
      { icon: "Workflow", title: "Traces", body: "Follow an agent run from request to decision in the dashboard." },
      { icon: "Webhook", title: "Pushed to your tools", body: "Send decisions to a SIEM or ticketing system with signed webhooks." },
      { icon: "Gauge", title: "Risk aware", body: "Risk is evaluated together with policy, not as an afterthought." },
    ],
    ctaTitle: "See a decision for your own action.",
    ctaBody: "Send one request from a test workspace and read the verdict.",
  },

  approvals: {
    eyebrow: "Product / Approvals",
    title: "Human approval, only where it matters.",
    intro:
      "Escalations pause a risky action and route it to a human approver. Everything else keeps running, so approval does not become a bottleneck.",
    primary: START,
    secondary: { label: "Talk to Enterprise", href: "/enterprise" },
    rows: [
      { action: "payments.transfer $48,000", meta: "finance-agent · Waiting for approver", v: "ESCALATE" },
      { action: "files.export salary.csv", meta: "hr-agent · Waiting for approver", v: "ESCALATE" },
      { action: "crm.read_ticket", meta: "support-agent · Within scope", v: "ALLOW" },
    ],
    stepsEyebrow: "How approvals work",
    stepsTitle: "Pause, review, decide.",
    stepsIntro: "An escalation creates an approval that a person resolves. The outcome is recorded like every other decision.",
    steps: [
      { n: "01", title: "Escalate", body: "A policy returns ESCALATE and the response carries an approval id." },
      { n: "02", title: "Review", body: "An approver sees the agent, the action and why it was escalated." },
      { n: "03", title: "Resolve", body: "The approver allows or denies the action and the outcome is written to the evidence log." },
    ],
    stepCols: 3,
    featuresTitle: "Approvals that fit how teams work.",
    features: [
      { icon: "UserCheck", title: "Real people decide", body: "Escalated actions never execute until an approver acts on them." },
      { icon: "Users", title: "Role based", body: "Owner, Admin, Operator and Viewer roles are enforced server side on every request." },
      { icon: "Scale", title: "Narrow by design", body: "Only actions that match an escalation rule wait, the rest stay fast." },
      { icon: "ScrollText", title: "Recorded", body: "Requests and outcomes are part of the tamper-evident evidence log." },
      { icon: "Webhook", title: "Connected", body: "Push approval events to ticketing with signed, retried webhooks." },
      { icon: "Clock", title: "Visible", body: "Pending approvals are listed in the dashboard so nothing is forgotten." },
    ],
    ctaTitle: "Keep humans in the loop without slowing agents.",
    ctaBody: "Try an escalation in a test workspace.",
  },

  evidence: {
    eyebrow: "Product / Evidence",
    title: "Proof you can verify, not promises.",
    intro:
      "Every decision is written to a SHA-256 hash-chained log. If a record changes later, the chain no longer matches, and you can check that yourself.",
    primary: START,
    secondary: { label: "See the proof", href: "/proof" },
    rows: [
      { action: "evidence.append decision", meta: "Hash chained to previous record", v: "ALLOW" },
      { action: "evidence.verify chain", meta: "Independent verification", v: "ALLOW" },
      { action: "evidence.edit record", meta: "Tampering breaks the chain", v: "BLOCK" },
    ],
    stepsEyebrow: "How evidence works",
    stepsTitle: "A log that shows if it was touched.",
    stepsIntro: "Each record includes the hash of the one before it. Changing any earlier record changes every hash after it.",
    steps: [
      { n: "01", title: "Record", body: "Every decision, including BLOCK and ESCALATE, is appended to the log." },
      { n: "02", title: "Chain", body: "Each entry carries a SHA-256 hash that links it to the previous entry." },
      { n: "03", title: "Verify", body: "Recompute the chain independently to confirm nothing was altered." },
    ],
    stepCols: 3,
    featuresTitle: "Built for audits and incident reviews.",
    features: [
      { icon: "Fingerprint", title: "Tamper evident", body: "Alterations are detectable because the hash chain stops matching." },
      { icon: "ScrollText", title: "Complete", body: "Allowed, blocked and escalated actions are all recorded." },
      { icon: "Terminal", title: "Independently verifiable", body: "You do not have to trust the dashboard, the chain can be checked outside it." },
      { icon: "Webhook", title: "Streamed to your SIEM", body: "Signed webhooks push decisions to the systems your security team already uses." },
      { icon: "Layers", title: "Tenant isolated", body: "Evidence is separated per workspace with row level security." },
      { icon: "FileText", title: "Stable ids", body: "Each decision has an id and an evidence hash you can cite in a review." },
    ],
    ctaTitle: "Start collecting evidence from day one.",
    ctaBody: "Every request in a test workspace is already chained.",
  },
};