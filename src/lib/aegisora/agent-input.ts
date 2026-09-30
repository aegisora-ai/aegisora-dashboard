import { maskSensitiveData, maskSensitiveText } from "@/lib/aegisora/redaction";

export type AgentSource = "manual" | "import";
export type AgentWrite = {
  workspace_id: string;
  name: string;
  description: string | null;
  framework: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  source: AgentSource;
};

export function normalizeAgentInput(
  value: unknown,
  workspaceId: string,
  source: AgentSource,
): { row: AgentWrite | null; error: string | null } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { row: null, error: "Agent must be an object." };
  const agent = value as Record<string, unknown>;
  const name = typeof agent.name === "string" ? agent.name.trim() : "";
  if (!name || name.length > 120) return { row: null, error: "Agent name must contain 1–120 characters." };
  if (maskSensitiveText(name) !== name) return { row: null, error: "Agent name must not contain personal data or credentials." };

  if (agent.external_id != null && typeof agent.external_id !== "string") {
    return { row: null, error: "External ID must be a string." };
  }
  const externalId = agent.external_id == null ? null : agent.external_id.trim();
  if (externalId && (externalId.length > 200 || maskSensitiveText(externalId) !== externalId)) {
    return { row: null, error: "External ID must not contain personal data or credentials and must be at most 200 characters." };
  }

  const description = typeof agent.description === "string" ? maskSensitiveText(agent.description.slice(0, 1000)) : null;
  const framework = typeof agent.framework === "string" ? maskSensitiveText(agent.framework.slice(0, 80)) : null;
  const metadata = agent.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
    ? maskSensitiveData(agent.metadata) as Record<string, unknown>
    : {};

  return {
    row: { workspace_id: workspaceId, name, description, framework, external_id: externalId || null, metadata, source },
    error: null,
  };
}
