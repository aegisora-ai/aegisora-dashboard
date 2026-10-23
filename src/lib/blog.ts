export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "code"; code: string; caption?: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  hue: string;
  body: Block[];
};

export const CATEGORIES = ["Product", "Concepts", "Policy", "Security", "Guides"] as const;

export const POSTS: Post[] = [
  {
    slug: "what-aegisora-does",
    title: "What Aegisora does, in plain language",
    excerpt:
      "AI agents can now take real actions. Aegisora decides, before each action runs, whether it is allowed.",
    category: "Product",
    date: "2026-10-23",
    hue: "from-blue-600/25 via-blue-500/10 to-transparent",
    body: [
      { t: "p", text: "Companies are giving AI agents real access: they read tickets, move money, deploy code and export files. When an agent makes a mistake, or is tricked, the result is a real action in a real system." },
      { t: "h2", text: "The idea" },
      { t: "p", text: "Aegisora is a decision point that sits in front of your agents. Before an agent does something sensitive, it asks Aegisora. Aegisora answers with one of three decisions, and only then does the action go ahead." },
      { t: "h2", text: "The three answers" },
      { t: "ul", items: ["ALLOW: the action is within policy and can run", "ESCALATE: a human approver must confirm first", "BLOCK: the action is denied"] },
      { t: "h2", text: "What you get" },
      { t: "ul", items: ["A policy engine that enforces your rules on every agent action", "Role-based access and MFA step-up for governance changes", "A tamper-evident evidence log of every decision", "Signed webhooks to push decisions to your SIEM and ticketing", "Scoped API keys you can revoke at any time"] },
      { t: "p", text: "If no policy matches an action, the default is BLOCK. A new kind of action is safe until your team decides otherwise." },
    ],
  },
  {
    slug: "what-is-the-execution-boundary",
    title: "What the execution boundary is, and why agents need one",
    excerpt:
      "Prompts and model guardrails shape what an agent wants to do. The execution boundary decides what it is actually allowed to do.",
    category: "Concepts",
    date: "2026-10-22",
    hue: "from-sky-600/25 via-sky-500/10 to-transparent",
    body: [
      { t: "p", text: "An autonomous agent does two things: it decides on an action, and it carries that action out. Most safety work focuses on the first step, the prompt, the model and its guardrails. The second step is where damage actually happens, because that is where a real system is touched." },
      { t: "h2", text: "Where the boundary sits" },
      { t: "p", text: "The execution boundary is the point between an agent's decision and the real environment. Aegisora sits exactly there. The agent sends the action it wants to take, and nothing runs until a decision comes back." },
      { t: "h2", text: "What gets checked" },
      { t: "p", text: "On every call, four things are evaluated together and deterministically:" },
      { t: "ul", items: ["Context: who is acting, on what, and in which environment", "Policy: the rules your team has written for this kind of action", "Risk: how sensitive the action is", "Authorization: whether this agent is allowed to do it at all"] },
      { t: "h2", text: "Why not rely on the prompt alone" },
      { t: "p", text: "A prompt is an instruction to a model, not a control on a system. It can be ignored, misread or overridden by injected content. A decision point outside the model does not depend on the model behaving." },
      { t: "code", code: `POST /api/v1/evaluate\n{ "agent": "code-agent", "action": "db.drop_table", "risk": 90 }\n\n-> { "effect": "BLOCK", "decision_id": "<uuid>", "evidence_hash": "<hash>" }`, caption: "Illustrative request and response shape." },
    ],
  },
  {
    slug: "allow-escalate-block",
    title: "ALLOW, ESCALATE, BLOCK: designing decisions for agent actions",
    excerpt:
      "Three outcomes are enough to govern an agent. The hard part is deciding which actions belong in which one.",
    category: "Policy",
    date: "2026-10-21",
    hue: "from-emerald-600/25 via-emerald-500/10 to-transparent",
    body: [
      { t: "p", text: "Every evaluation returns one of three effects. Keeping the set small makes policies easy to read and easy to audit." },
      { t: "h2", text: "ALLOW" },
      { t: "p", text: "The action is within scope and matches a policy. It runs. Reading a support ticket or fetching an allow-listed domain are typical examples." },
      { t: "h2", text: "ESCALATE" },
      { t: "p", text: "The action may be legitimate but needs a human. A payment above an approval limit or an export of a sensitive data class should wait for an approver. The response carries an approval_id so the request can be tracked." },
      { t: "h2", text: "BLOCK" },
      { t: "p", text: "The action is denied. Destructive operations and anything without authorization belong here. Because the default is BLOCK when no policy matches, a new action type is safe until someone decides otherwise." },
      { t: "h2", text: "A practical way to start" },
      { t: "ul", items: ["Start from the default BLOCK and add ALLOW policies for known good actions", "Move high-impact but legitimate actions to ESCALATE", "Keep destructive actions on BLOCK until you have a clear reason to change them", "Use conditions and redaction in the policy rather than writing separate rules per agent"] },
    ],
  },
  {
    slug: "verifiable-evidence-log",
    title: "Evidence you can verify: hash-chained decision logs",
    excerpt:
      "A log you cannot verify is a claim. A hash-chained log lets you check, independently, that decisions were not changed after the fact.",
    category: "Security",
    date: "2026-10-20",
    hue: "from-violet-600/25 via-violet-500/10 to-transparent",
    body: [
      { t: "p", text: "Security and compliance teams are asked to prove what an agent did and why it was allowed. A plain database table is hard to trust for this, because rows can be edited." },
      { t: "h2", text: "How the chain works" },
      { t: "p", text: "Each decision is written to an evidence log with a SHA-256 hash. The hash links to the entry before it, so changing any past entry breaks every hash after it. Every evaluate response includes an evidence_hash you can store on your side." },
      { t: "h2", text: "Verifying independently" },
      { t: "p", text: "Because the chain is made of standard hashes, you can recompute it outside Aegisora. You do not have to take the platform's word for it." },
    ],
  },
  {
    slug: "access-control-for-governance",
    title: "Who can change the rules? Roles, MFA and API keys",
    excerpt:
      "A policy is only as trustworthy as the people and keys that can edit it. Here is how access is controlled around the runtime.",
    category: "Security",
    date: "2026-10-19",
    hue: "from-indigo-600/25 via-indigo-500/10 to-transparent",
    body: [
      { t: "p", text: "Enforcing policy on agents does not help if anyone can quietly change the policy. Aegisora treats governance changes as sensitive actions too." },
      { t: "h2", text: "Roles" },
      { t: "p", text: "Owner, Admin, Operator and Viewer roles are enforced server-side on every request, not just hidden in the interface." },
      { t: "h2", text: "MFA step-up" },
      { t: "p", text: "Governance changes require an AAL2 session. A password alone is never enough to change what your agents are allowed to do." },
      { t: "h2", text: "API keys and webhooks" },
      { t: "ul", items: ["API keys are scoped, hashed at rest, rate limited per key and per IP, and revocable at any time", "Webhooks are signed and retried, so your SIEM and ticketing can verify where an event came from", "Workspaces are isolated from each other with row-level security"] },
    ],
  },
  {
    slug: "first-evaluate-request",
    title: "Your first evaluated action: a walkthrough",
    excerpt:
      "Create a test workspace, send one request and read the decision. This is what the response tells you.",
    category: "Guides",
    date: "2026-10-18",
    hue: "from-cyan-600/25 via-cyan-500/10 to-transparent",
    body: [
      { t: "p", text: "The fastest way to understand Aegisora is to send it one action and read the answer." },
      { t: "h2", text: "Send a request" },
      { t: "p", text: "Create a test workspace and an API key, then call the evaluate endpoint with the agent, the action and a risk value." },
      { t: "code", code: `curl -X POST https://aegisora.org/api/v1/evaluate \\\n  -H "Authorization: Bearer aeg_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{ "agent": "finance-agent",\n        "action": "payments.transfer",\n        "risk": 70,\n        "input": { "amount": 48000 } }'`, caption: "Illustrative request." },
      { t: "h2", text: "Read the response" },
      { t: "ul", items: ["effect: ALLOW, BLOCK or ESCALATE", "decision_id: the identifier of this decision", "approval_id: present when the effect is ESCALATE", "evidence_hash: the hash of the evidence entry for this decision"] },
      { t: "h2", text: "What to expect first" },
      { t: "p", text: "Without a matching policy the default is BLOCK. Add a policy for the action and send the same request again to see the decision change." },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export function readingMinutes(p: Post) {
  const words = p.body
    .map((b) => (b.t === "ul" ? b.items.join(" ") : b.t === "code" ? "" : b.text))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}