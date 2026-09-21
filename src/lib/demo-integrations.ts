// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type IntegrationStatus = "CONNECTED" | "NOT_CONNECTED";

export type DemoIntegration = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  connectedSince?: string;
  syncedItem: string;
};

export const demoIntegrations: DemoIntegration[] = [
  { id: "slack", name: "Slack", category: "Alerting", description: "Sends incident and approval notifications to workspace channels.", status: "CONNECTED", connectedSince: "2026-05-01", syncedItem: "#aegisora-alerts" },
  { id: "pagerduty", name: "PagerDuty", category: "Alerting", description: "Pages the on-call engineer for CRITICAL incidents.", status: "CONNECTED", connectedSince: "2026-05-03", syncedItem: "Aegisora Escalation Policy" },
  { id: "datadog", name: "Datadog", category: "Observability", description: "Exports trace and latency metrics for external dashboards.", status: "CONNECTED", connectedSince: "2026-06-14", syncedItem: "aegisora.traces" },
  { id: "jira", name: "Jira", category: "Ticketing", description: "Creates tickets automatically from incidents and policy reviews.", status: "NOT_CONNECTED", syncedItem: "-" },
  { id: "okta", name: "Okta", category: "Identity", description: "Syncs users and group membership for workspace access control.", status: "NOT_CONNECTED", syncedItem: "-" },
  { id: "github", name: "GitHub", category: "Developer tooling", description: "Links policy changes to pull requests for review history.", status: "NOT_CONNECTED", syncedItem: "-" },
];