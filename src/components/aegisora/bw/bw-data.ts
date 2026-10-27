export type Verdict = "ALLOW" | "ESCALATE" | "BLOCK";

export type Sample = {
  id: string;
  action: string;
  agent: string;
  context: string;
  policy: string | null;
  verdict: Verdict;
  reason: string;
  evidence: string;
  keys: string[];
  chip: string;
};

/* Illustrative sample data. Not read from a live workspace. */
export const SAMPLES: Sample[] = [
  {
    id: "transfer",
    action: "payments.transfer",
    agent: "finance-agent",
    context: "Amount: $48,000",
    policy: "transfer-approval-limit",
    verdict: "ESCALATE",
    reason: "The amount is above the approval limit. A person must approve before the action runs.",
    evidence: "b27d10...4f93",
    keys: ["payments.transfer", "transfer", "payment", "48000", "wire"],
    chip: "payments.transfer",
  },
  {
    id: "drop-table",
    action: "db.drop_table",
    agent: "code-agent",
    context: "Target: users",
    policy: "deny-destructive-sql",
    verdict: "BLOCK",
    reason: "Destructive action denied by policy.",
    evidence: "e15a8c...71d0",
    keys: ["db.drop_table", "drop", "delete table", "truncate"],
    chip: "db.drop_table",
  },
  {
    id: "read-ticket",
    action: "crm.read_ticket",
    agent: "support-agent",
    context: "Ticket 4821 in the support queue",
    policy: "support-read-scope",
    verdict: "ALLOW",
    reason: "Within the read scope granted to support-agent.",
    evidence: "9c41f2...e07a",
    keys: ["crm.read_ticket", "ticket", "crm", "read"],
    chip: "crm.read_ticket",
  },
  {
    id: "bank-export",
    action: "vendors.export_bank_details",
    agent: "ops-agent",
    context: "Bulk export from a scheduled job",
    policy: null,
    verdict: "BLOCK",
    reason: "No matching policy. The default is BLOCK.",
    evidence: "0d6f3b...c8a2",
    keys: ["vendors.export_bank_details", "bank", "vendor", "iban"],
    chip: "export_bank_details",
  },
  {
    id: "files-export",
    action: "files.export",
    agent: "ops-agent",
    context: "Export to an external destination",
    policy: "export-review",
    verdict: "ESCALATE",
    reason: "External exports wait for a person to review them.",
    evidence: "3a9e77...d512",
    keys: ["files.export", "export", "files", "download"],
    chip: "files.export",
  },
];

export const CHIP_ORDER = ["read-ticket", "transfer", "drop-table", "bank-export", "files-export"];

export const ACTIONS = [
  "payments.transfer",
  "db.drop_table",
  "email.send",
  "crm.read_ticket",
  "files.export",
  "code.execute",
  "browser.navigate",
  "vendors.export_bank_details",
];

export const FLOW = [
  {
    id: "request",
    label: "Request",
    step: "01",
    title: "The agent proposes an action",
    body: "Before a sensitive tool runs, your application sends the action with its context: the tool, the target and any amount involved.",
  },
  {
    id: "evaluate",
    label: "Evaluate",
    step: "02",
    title: "Aegisora checks policy and authority",
    body: "The request is evaluated against your policies, the authority the agent holds and the risk of the action.",
  },
  {
    id: "decide",
    label: "Decide",
    step: "03",
    title: "A verdict comes back before execution",
    body: "ALLOW runs the tool. ESCALATE waits for a person. BLOCK stops it. With no matching policy, the default is BLOCK.",
  },
  {
    id: "record",
    label: "Record",
    step: "04",
    title: "The decision is written to the evidence log",
    body: "Each record carries a decision id, a reason and the hash of the record before it, so earlier entries cannot be rewritten quietly.",
  },
];

export type Mark = "yes" | "partial" | "no";

export const COMPARE_COLS = ["Aegisora", "Access roles", "Activity logs", "Prompt guardrails"];
export const COMPARE: { feature: string; icon: string; cells: Mark[] }[] = [
  { feature: "Decision before the action runs", icon: "zap", cells: ["yes", "partial", "no", "partial"] },
  { feature: "Judges the request and its context", icon: "search", cells: ["yes", "no", "no", "partial"] },
  { feature: "Human approval for sensitive actions", icon: "users", cells: ["yes", "no", "no", "no"] },
  { feature: "Tamper-evident decision record", icon: "file", cells: ["yes", "no", "partial", "no"] },
  { feature: "Fails closed when nothing matches", icon: "lock", cells: ["yes", "yes", "no", "no"] },
  { feature: "Rules per agent and per tool", icon: "target", cells: ["yes", "partial", "no", "no"] },
  { feature: "A reason recorded for every decision", icon: "eye", cells: ["yes", "no", "partial", "no"] },
  { feature: "Works on any tool call", icon: "settings", cells: ["yes", "partial", "partial", "no"] },
];

export const FAQ = [
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
  {
    q: "Who controls execution?",
    a: "Your application. Aegisora returns a verdict; your code acts on ALLOW, holds on ESCALATE and stops on BLOCK.",
  },
  {
    q: "What does ESCALATE do?",
    a: "The action waits in an approval queue. Execution resumes only after a person decides.",
  },
];

export const SCENARIOS = [
  {
    quote: "A finance agent asks to move $48,000. The amount is above the limit, so a person decides before anything runs.",
    tag: "Payments",
    note: "Scenario",
    verdict: "ESCALATE" as Verdict,
  },
  {
    quote: "A code agent tries to drop the users table. Destructive SQL is denied by policy and the attempt is recorded.",
    tag: "Databases",
    note: "Scenario",
    verdict: "BLOCK" as Verdict,
  },
  {
    quote: "A support agent reads a ticket inside its granted scope. The read is allowed and logged with its reason.",
    tag: "Support",
    note: "Scenario",
    verdict: "ALLOW" as Verdict,
  },
  {
    quote: "A scheduled job exports vendor bank details. No policy matches, so the default applies and the export is blocked.",
    tag: "Operations",
    note: "Scenario",
    verdict: "BLOCK" as Verdict,
  },
];

export const SECTION_LINKS: { label: string; desc: string; href: string; icon: string }[] = [
  { label: "Platform", desc: "Policies, approvals and evidence", href: "/#platform", icon: "layers" },
  { label: "How it works", desc: "From request to recorded decision", href: "/#how-it-works", icon: "route" },
  { label: "Benefits", desc: "Control that scales with agents", href: "/#benefits", icon: "gauge" },
  { label: "Decision views", desc: "ALLOW, ESCALATE and BLOCK", href: "/#decisions", icon: "eye" },
  { label: "Tool calls", desc: "Actions Aegisora decides on", href: "/#integrations", icon: "plug" },
  { label: "Evidence", desc: "A log you can verify", href: "/#evidence", icon: "file" },
  { label: "Access", desc: "Test workspaces and pilots", href: "/#access", icon: "key" },
  { label: "FAQs", desc: "Questions before a pilot", href: "/#faq", icon: "help" },
];