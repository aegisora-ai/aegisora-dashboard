// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type ProviderStatus = "CONNECTED" | "DEGRADED" | "NOT_CONNECTED";

export type DemoModel = { name: string; contextWindow: string; avgLatencyMs: number };

export type DemoProvider = {
  id: string;
  name: string;
  kind: string;
  status: ProviderStatus;
  region: string;
  connectedSince?: string;
  requestsToday: number;
  avgLatencyMs: number;
  models: DemoModel[];
  notes: string;
};

export const demoProviders: DemoProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    kind: "LLM provider",
    status: "CONNECTED",
    region: "us-east-1",
    connectedSince: "2026-04-02",
    requestsToday: 3820,
    avgLatencyMs: 410,
    models: [
      { name: "gpt-4.1", contextWindow: "128K", avgLatencyMs: 480 },
      { name: "gpt-4.1-mini", contextWindow: "128K", avgLatencyMs: 260 },
    ],
    notes: "Primary provider for finance-operator and ops-assistant.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "LLM provider",
    status: "CONNECTED",
    region: "us-west-2",
    connectedSince: "2026-04-02",
    requestsToday: 2140,
    avgLatencyMs: 520,
    models: [
      { name: "claude-sonnet-4-6", contextWindow: "200K", avgLatencyMs: 540 },
      { name: "claude-haiku-4-5", contextWindow: "200K", avgLatencyMs: 210 },
    ],
    notes: "Used by report-builder for long-context analytics summaries.",
  },
  {
    id: "azure-openai",
    name: "Azure OpenAI",
    kind: "Cloud AI platform",
    status: "DEGRADED",
    region: "eu-west-1",
    connectedSince: "2026-05-19",
    requestsToday: 640,
    avgLatencyMs: 910,
    models: [{ name: "gpt-4o", contextWindow: "128K", avgLatencyMs: 910 }],
    notes: "Elevated latency reported by the EU workspace since 2026-09-20.",
  },
  {
    id: "aws-bedrock",
    name: "AWS Bedrock",
    kind: "Cloud AI platform",
    status: "NOT_CONNECTED",
    region: "-",
    requestsToday: 0,
    avgLatencyMs: 0,
    models: [],
    notes: "Not yet configured for this workspace.",
  },
];

export function getProvider(id: string) {
  return demoProviders.find((p) => p.id === id);
}