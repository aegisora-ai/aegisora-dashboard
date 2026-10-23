export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "code"; text: string };

export type Post = {
  slug: string;
  title: string;
  date: string;
  readMinutes: number;
  category: string;
  excerpt: string;
  body: Block[];
};

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const POSTS: Post[] = [
  {
    slug: "why-every-agent-action-needs-a-decision-point",
    title: "Why every agent action needs a decision point",
    date: "2026-10-14",
    readMinutes: 5,
    category: "Runtime security",
    excerpt: "Once an agent can act, the question changes from whether its answer is good to whether the action should happen at all.",
    body: [
      { t: "p", text: "Agents no longer only answer questions. They call APIs, move money, change records and run code. The moment an agent can act, the question changes from whether its answer is good to whether the action should happen at all." },
      { t: "h2", text: "Prompts are not controls" },
      { t: "p", text: "Instructions in a prompt are requests to a model, not enforcement. A model can misread them, be misled by content it reads along the way, or simply be wrong. A real control has to sit outside the model and be able to say no." },
      { t: "h2", text: "Check at the execution boundary" },
      { t: "p", text: "The dependable place for that check is the point where an action leaves the agent and reaches a real system. There you know the exact action, the identity of the agent and the inputs. A decision made there applies no matter how the agent arrived at the action." },
      { t: "h2", text: "What a decision point returns" },
      { t: "ul", items: ["ALLOW: the action is within policy and can proceed.", "BLOCK: the action is refused and never reaches the system.", "ESCALATE: the action waits until a human approves it."] },
      { t: "p", text: "Keeping the answer to three outcomes makes it easy for agents to handle, easy for engineers to test and easy for auditors to read. Every outcome is recorded, so the decision point is also where evidence starts." },
    ],
  },
  {
    slug: "allow-block-escalate-a-verdict-model-that-stays-simple",
    title: "ALLOW, BLOCK, ESCALATE: a verdict model that stays simple",
    date: "2026-10-07",
    readMinutes: 4,
    category: "Product",
    excerpt: "Why three outcomes are enough to govern agent behavior, and what each one promises to the agent and to the team.",
    body: [
      { t: "p", text: "It is tempting to give a policy engine many outcomes: warn, throttle, log only, sandbox. In practice every extra outcome is another branch that agent developers have to handle and security teams have to explain. Three outcomes cover what an agent actually needs to know next." },
      { t: "h2", text: "ALLOW means proceed, and still record" },
      { t: "p", text: "An allowed action runs, but the decision is still written to the evidence log. Allowed does not mean unseen. When something goes wrong later, the record shows which policy permitted the action." },
      { t: "h2", text: "BLOCK means the system is never touched" },
      { t: "p", text: "A blocked action is refused before execution. The agent receives the verdict and a short reason, so it can stop or choose another path without guessing what went wrong." },
      { t: "h2", text: "ESCALATE hands the decision to a person" },
      { t: "p", text: "Some actions are neither clearly safe nor clearly forbidden, such as a large transfer or an export of sensitive data. ESCALATE pauses them and returns an approval id. The action runs only if an approver agrees." },
      { t: "p", text: "Because the model is small, it stays predictable. The same three words appear in the API response, the dashboard and the evidence log." },
    ],
  },
  {
    slug: "default-deny-what-happens-without-a-matching-policy",
    title: "Default deny: what happens without a matching policy",
    date: "2026-09-30",
    readMinutes: 4,
    category: "Policies",
    excerpt: "An action that no policy covers should not slip through. Here is why fail closed is the safer default for agents.",
    body: [
      { t: "p", text: "Every policy system has to answer one uncomfortable question: what happens to an action nobody wrote a rule for? Agents are creative, and they will eventually try something the policy authors did not anticipate." },
      { t: "h2", text: "Open by default hides gaps" },
      { t: "p", text: "If unmatched actions are allowed, a missing rule looks exactly like a safe action. The gap only shows up after the damage. The people who wrote the policy have no signal that anything was missed." },
      { t: "h2", text: "Closed by default makes gaps visible" },
      { t: "p", text: "In Aegisora an action without a matching policy is blocked. That can be inconvenient while you are setting up, and that is the point: the blocked action appears in the decision log, and you decide deliberately whether to allow it, escalate it or leave it blocked." },
      { t: "h2", text: "A practical way to start" },
      { t: "ul", items: ["Run your agents in a test workspace and watch what gets blocked.", "Add narrow policies for the actions you expect.", "Use escalation for the actions that need a human.", "Review remaining blocks before moving to production."] },
      { t: "p", text: "The result is a policy set that describes what your agents are allowed to do, rather than a list of things somebody remembered to forbid." },
    ],
  },
  {
    slug: "evidence-you-can-verify-hash-chained-decision-logs",
    title: "Evidence you can verify: hash-chained decision logs",
    date: "2026-09-23",
    readMinutes: 5,
    category: "Evidence",
    excerpt: "How chaining each record to the one before it makes a decision log tamper evident, and why that matters in a review.",
    body: [
      { t: "p", text: "After an incident, the first thing a security team asks is what the agent actually did and who allowed it. A log helps only if people believe it. If records can be edited quietly, the log is a story, not evidence." },
      { t: "h2", text: "The idea behind a hash chain" },
      { t: "p", text: "Each record stores a SHA-256 hash that is computed from its own content and the hash of the previous record. Change an old record and its hash changes. That breaks the link to the next record, and every record after it no longer matches." },
      { t: "h2", text: "Why it is useful in practice" },
      { t: "ul", items: ["Tampering is detectable instead of silent.", "Verification does not require trusting the dashboard.", "Every decision is covered, including BLOCK and ESCALATE.", "A single evidence hash can be cited in a ticket or a review."] },
      { t: "h2", text: "What it does not do" },
      { t: "p", text: "A hash chain shows that records were not changed. It does not prove the policy was a good one. That is why Aegisora records the policy version with each decision, so a reviewer can see both what was decided and under which rules." },
    ],
  },
  {
    slug: "human-approval-without-the-bottleneck",
    title: "Human approval without the bottleneck",
    date: "2026-09-16",
    readMinutes: 4,
    category: "Approvals",
    excerpt: "Human review is valuable when it is rare and well informed. Here is how to keep approvals narrow so agents stay fast.",
    body: [
      { t: "p", text: "Putting a person in the loop sounds safe until every action waits for a click. Approvals only work when they are rare enough that people take them seriously and informative enough that they can decide quickly." },
      { t: "h2", text: "Escalate a narrow set of actions" },
      { t: "p", text: "Start from the actions where a mistake is expensive or hard to undo: large payments, exports of sensitive data, bulk changes. Write escalation rules for those and let well understood actions be allowed automatically." },
      { t: "h2", text: "Give approvers the context" },
      { t: "p", text: "An approver should see which agent asked, what the action is and why the policy escalated it. With that, most approvals are a quick read rather than an investigation." },
      { t: "h2", text: "Record the outcome" },
      { t: "p", text: "The approval and its result are written to the same evidence log as every other decision. If someone later asks who approved a transfer, the answer is in the record." },
      { t: "p", text: "Used this way, approval is a precise tool rather than a blanket brake, and the agents keep moving everywhere else." },
    ],
  },
];