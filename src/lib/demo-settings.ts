// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type DemoApiKey = { id: string; label: string; prefix: string; createdAt: string; lastUsed: string; scopes: string[] };

export const apiKeys: DemoApiKey[] = [
  { id: "key_1", label: "CI pipeline", prefix: "aeg_live_4f2a...", createdAt: "2026-05-02", lastUsed: "2026-09-21 22:10:00Z", scopes: ["decisions:read", "traces:read"] },
  { id: "key_2", label: "Local dev", prefix: "aeg_test_9c31...", createdAt: "2026-06-11", lastUsed: "2026-09-18 09:44:00Z", scopes: ["decisions:read"] },
];

export const notificationPreferences: { label: string; channel: string; enabled: boolean }[] = [
  { label: "Critical incidents", channel: "Slack + Email", enabled: true },
  { label: "Approval requests", channel: "Slack", enabled: true },
  { label: "Weekly digest", channel: "Email", enabled: true },
  { label: "Policy changes", channel: "Email", enabled: false },
];

export const account = {
  name: "Maradona Özer",
  email: "maradona@aegisora.dev",
  timezone: "Europe/Berlin",
};