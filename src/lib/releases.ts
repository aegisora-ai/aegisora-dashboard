export type ReleaseSection = { title: string; body?: string; items?: string[] };
export type Release = {
  version: string;
  title: string;
  kind?: string;
  commit: string;
  summary: string;
  tagline?: string;
  chains?: { label: string; steps: string[] }[];
  sections: ReleaseSection[];
  validation?: string[];
  next?: string;
};

// Repo linki verirsen commit ve compare linkleri otomatik acilir. Ornek: "https://github.com/ozereray/aegisora"
export const REPO_URL = "";

export const RELEASES: Release[] = [
  {
    version: "3.0.0",
    title: "Enterprise Governance Runtime",
    kind: "Latest",
    commit: "338fbce",
    summary:
      "Aegisora v3.0 introduces the enterprise governance runtime for autonomous AI agents.",
    tagline: "Don't just secure the model. Secure what the agent is allowed to do.",
    chains: [
      {
        label: "Enterprise governance chain",
        steps: ["Agent", "Request", "Context", "Risk", "Policy", "Decision", "Enforcement", "Execution", "Evidence", "Audit"],
      },
    ],
    sections: [
      { title: "Runtime Enforcement", items: [
        "ALLOW / BLOCK / ESCALATE execution decisions",
        "Enforcement at the execution boundary",
        "BLOCK prevents provider and tool execution",
        "ESCALATE stops execution pending approval",
      ]},
      { title: "Enterprise Identity and Access", items: [
        "Workspace isolation",
        "RBAC",
        "Server-side authorization",
        "Tenant boundary enforcement",
      ]},
      { title: "Agent and Provider Governance", items: [
        "Agent registry and discovery",
        "Provider and model registry",
        "Governed model resolution",
        "Provider and model identity integrity",
      ]},
      { title: "Policy and Risk", items: [
        "Policy Studio",
        "Policy versioning",
        "Risk detection",
        "Deterministic governance decision precedence",
      ]},
      { title: "Approval Engine", items: [
        "Enterprise approval lifecycle",
        "PENDING to APPROVED / REJECTED / EXPIRED",
        "Workspace isolation",
        "Runtime approval enforcement",
        "Resolution synchronization",
      ]},
      { title: "Evidence and Audit", items: [
        "Tamper-evident evidence ledger",
        "Runtime evidence persistence",
        "Enterprise audit ledger",
        "Trace, decision, execution and evidence correlation",
      ]},
      { title: "Tool Security", items: [
        "Tool security evaluation",
        "ToolRegistry enforcement",
        "External tool governance",
        "MCP tool governance",
      ]},
      { title: "Realtime Operations", items: [
        "Enterprise realtime events",
        "Runtime-to-enterprise event bridge",
        "Persistent realtime writers",
        "Event subscriptions",
      ]},
      { title: "Incidents, Alerts and Webhooks", items: [
        "Enterprise incident ledger",
        "Governance orchestration",
        "Alert rules",
        "Webhook governance",
      ]},
      { title: "Usage and Entitlements", items: [
        "Enterprise usage ledger",
        "Usage metering",
        "Persistent usage projection",
        "Execution entitlements",
        "Provider-level entitlement enforcement",
        "Execution quota enforcement",
      ]},
      { title: "Enterprise Contracts", items: [
        "Billing state contracts",
        "SSO identity contracts",
        "SCIM provisioning contracts",
        "Enterprise recovery contracts",
      ]},
      { title: "Security Model", body:
        "Aegisora enforces governance before execution. A blocked or escalated action does not reach the provider. The runtime is designed around zero-trust execution, tenant isolation, auditable decisions and evidence-backed enforcement." },
    ],
    validation: [
      "Extensive enterprise and runtime regression coverage across governance decisions and execution enforcement",
      "Approval lifecycle, evidence persistence and audit integrity",
      "Tool security and realtime behavior",
      "Usage and entitlements",
      "Tenant isolation and provider execution boundaries",
    ],
  },
  {
    version: "2.0.0",
    title: "Governance Platform",
    kind: "Major",
    commit: "08033e3",
    summary:
      "The 1.x line hardened the runtime. v2.0.0 turns that hardened runtime into a broader platform for governing autonomous AI-agent execution.",
    chains: [
      {
        label: "From runtime security to governance platform",
        steps: ["Identity", "Permission", "Policy", "Security", "Risk", "Decision", "Enforcement", "Authorization", "Execution", "Evidence", "Audit"],
      },
    ],
    sections: [
      { title: "Explicit Security Boundary", body: "The decision boundary stays explicit: ALLOW, BLOCK, ESCALATE." },
      { title: "Platform Surface", items: [
        "@aegisora/audit",
        "@aegisora/core",
        "@aegisora/observability",
        "@aegisora/plugins",
        "@aegisora/policy-engine",
        "@aegisora/runtime",
        "@aegisora/sdk",
        "@aegisora/security-engine",
        "@aegisora/storage",
        "All nine packages aligned at 2.0.0",
      ]},
      { title: "Runtime Security", items: [
        "Canonical provider identity and canonical model identity",
        "Provider/model consistency",
        "Protected agent execution boundaries",
        "Forged identity rejection",
        "Governance-before-resolution ordering",
        "Fail-closed BLOCK and ESCALATE behavior",
        "Canonical correlation integrity",
      ]},
      { title: "Evidence and Observability", items: [
        "Runtime-generated security identity preserved through governance and execution",
        "Release artifacts regenerated from the final release tree",
        "SHA256 evidence shipped with every artifact",
      ]},
    ],
    validation: [
      "77/77 runtime tests passed",
      "Build passed",
      "Typecheck passed",
      "Package metadata consistency passed",
      "Release evidence integrity passed",
      "9/9 package tarballs regenerated",
      "9/9 SHA256 files regenerated",
      "Release gate metadata rebound to the final commit",
      "Final candidate worktree verified clean",
    ],
    next: "v3.0.0 adds the enterprise governance runtime: approvals, evidence ledger, realtime operations and entitlements.",
  },
  {
    version: "1.8.0",
    title: "Runtime Hardening",
    commit: "99da016",
    summary: "The final runtime-hardening step before the governance-platform transition.",
    sections: [
      { title: "Correlation Identity Integrity", body:
        "The runtime rejects attacker-controlled correlation identifiers as canonical identity. Runtime-generated identifiers remain authoritative across governance, enforcement, execution, evidence and audit.",
        items: ["traceId", "decisionId", "executionId", "evidenceId", "correlationId"] },
      { title: "Security Property", body:
        "Request identity must remain canonical throughout the security record. Metadata may describe a request, but it cannot redefine the runtime's authoritative identity." },
    ],
    validation: [
      "Trace 96: Correlation Identity Integrity",
      "77/77 runtime tests passed",
      "Build passed",
      "Typecheck passed",
      "Diff integrity check passed",
    ],
    next: "v2.0.0 turns the hardened runtime into the Governance Platform.",
  },
  {
    version: "1.7.0",
    title: "Governance Boundary",
    commit: "94521df",
    summary: "The governance boundary becomes a contract rather than an implication.",
    chains: [
      { label: "Governance boundary", steps: ["Request", "Governance", "Decision", "Enforcement", "Execution", "Evidence", "Audit"] },
    ],
    sections: [
      { title: "Canonical Correlation", body: "Each governance decision remains independently identifiable.",
        items: ["traceId", "decisionId", "executionId", "evidenceId"] },
      { title: "Fail-Closed Behavior", items: [
        "Forged runtime identities are rejected",
        "BLOCK prevents execution and preserves the prevented / not-attempted state",
        "ALLOW carries canonical correlation into governed execution",
        "Audit and evidence stay tied to runtime-generated identity, not attacker-controlled metadata",
      ]},
      { title: "Security Coverage", items: [
        "Governance-gated model resolution",
        "Provider and model identity immutability",
        "Post-governance model integrity",
        "Provider/model consistency",
        "Cross-provider resolution authority",
        "Protected agent execution boundaries",
        "Governance-boundary contract validation",
      ]},
    ],
    next: "v1.8.0 hardens the identity itself at the governance boundary.",
  },
  {
    version: "1.6.0",
    title: "Canonical Authority",
    commit: "3090fd5",
    summary: "Changes who is allowed to speak for execution.",
    chains: [
      { label: "Canonical authority model", steps: ["Governance", "ToolRegistry", "Authorization Capability", "AgentExecutor", "RuntimeTool", "Execution"] },
      { label: "Provider governance ordering", steps: ["Request", "Governance", "Provider Resolution", "Model Resolution", "Provider Invocation"] },
    ],
    sections: [
      { title: "Single Canonical Authority", body:
        "ToolRegistry became the single canonical authority for governed tool execution." },
      { title: "Legacy Authority Elimination", body:
        "Overlapping legacy runtime authority surfaces were removed so execution could no longer be governed by competing implementations. The objective was not simply deletion, but removing ambiguity from the security authority graph." },
      { title: "Capability-Based Execution", items: [
        "Execution requires valid, scoped authorization",
        "The runtime validates authorization existence, validity, scope and single-use consumption",
        "Single-use authorization gives replay resistance at the execution boundary",
      ]},
      { title: "Provider Governance Ordering", body:
        "BLOCK and ESCALATE prevent downstream provider and model resolution." },
    ],
    next: "v1.7.0 makes the governance boundary explicit, correlated and fail-closed.",
  },
  {
    version: "1.5.0",
    title: "Evidence Integrity",
    commit: "e24aee3",
    summary: "Establishes the evidence contract that later governance releases depend on.",
    chains: [
      { label: "Canonical security record", steps: ["Request", "Identity", "Permission", "Policy", "Security", "Risk", "Decision", "Enforcement", "Execution", "Evidence", "Audit"] },
    ],
    sections: [
      { title: "Evidence as a First-Class Security Object", items: [
        "Canonical evidence creation at the enforcement boundary",
        "Persistent evidence storage",
        "Deterministic trace, decision, execution and evidence correlation",
        "Synchronized evidence finalization",
        "Evidence retention for blocked and prevented actions",
        "Evidence retrieval by trace, decision and agent",
      ]},
      { title: "Enforcement Semantics", body:
        "The release formalized the difference between enforcement state and execution outcome, so you can answer both: what did governance decide, and what actually happened at the execution boundary?",
        items: [
          "Enforcement: not_executed, executed, prevented, escalated",
          "Execution: not_attempted, succeeded, failed",
        ]},
    ],
    validation: [
      "Evidence persistence and finalization",
      "Query behavior and BLOCK-path persistence",
      "Storage isolation",
      "Build, typecheck and release-state verification",
    ],
    next: "v1.6.0 removes competing execution authorities and establishes the canonical runtime authority model.",
  },
  {
    version: "0.1.4",
    title: "Release Hardening",
    commit: "02e5479",
    summary: "Where Aegisora's engineering process started becoming measurable.",
    sections: [
      { title: "Security and Release Hardening", items: [
        "Stronger controls around measurable security evidence",
        "Security Readiness CI enforcement",
        "Package metadata validation",
        "npm tarball and package-scope validation",
        "Build, typecheck, runtime and example verification",
        "Automated release validation and reproducible release controls",
      ]},
      { title: "Supply-Chain Discipline", body:
        "Release-time checks run against actual package artifacts rather than relying only on source-tree inspection. This became the basis for the evidence-driven release process of later versions." },
    ],
    validation: [
      "Build validation",
      "Typecheck validation",
      "Runtime test validation",
      "Example smoke tests",
      "Package metadata validation",
      "npm package content validation",
      "Security Readiness validation",
    ],
    next: "v1.5.0 turns that release discipline into runtime evidence integrity and zero-trust enforcement.",
  },
  {
    version: "0.1.2",
    title: "Stabilization",
    commit: "01a74b7",
    summary: "Makes the original open-source foundation easier to maintain, evolve and integrate.",
    sections: [
      { title: "Stability Before Expansion", body:
        "Focused on runtime refinement, package organization, repository maintenance, documentation improvements, developer onboarding and infrastructure stabilization. The goal was deliberately conservative: strengthen the foundation before increasing the security contract's complexity." },
      { title: "Developer Experience", body:
        "Continued the move from an initial runtime prototype toward a structured package ecosystem and a more predictable developer workflow." },
      { title: "Engineering Direction", body:
        "The architecture stayed centered on governed execution while the surrounding project structure matured." },
    ],
    next: "v0.1.4 moves from general stabilization into measurable security and release hardening.",
  },
  {
    version: "0.1.0",
    title: "Foundation",
    kind: "First release",
    commit: "a494e78",
    summary: "Autonomous agents should not receive unrestricted execution authority. v0.1.0 is the first public foundation for that idea.",
    chains: [
      { label: "First runtime boundary", steps: ["Request", "Context", "Security", "Policy", "Decision", "Enforcement", "Execution", "Audit"] },
    ],
    sections: [
      { title: "The First Runtime Boundary", body:
        "Agent actions are evaluated before reaching external tools and providers, with explicit ALLOW, BLOCK and ESCALATE outcomes." },
      { title: "Developer Foundations", items: [
        "Runtime request interception",
        "Policy evaluation",
        "Security analysis",
        "Execution enforcement",
        "Runtime observability",
        "Audit-oriented execution tracking",
        "LangChain / LangGraph integration",
      ]},
      { title: "Why It Matters", body:
        "The architectural starting point of Aegisora's later security and governance model: governance at the execution boundary, not after an agent has already acted." },
    ],
    next: "v0.1.2 refines the foundation, v0.1.4 hardens release security, and the 1.x line turns the runtime into a canonical governance architecture.",
  },
];