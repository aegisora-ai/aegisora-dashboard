// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type WebhookStatus = "ACTIVE" | "FAILING" | "DISABLED";

export type DemoDelivery = {
  id: string;
  event: string;
  statusCode: number;
  success: boolean;
  attempt: number;
  sentAt: string;
  durationMs: number;
};

export type DemoWebhook = {
  id: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  createdAt: string;
  lastDeliveryAt: string;
  successRate: number;
  deliveries: DemoDelivery[];
};

export const demoWebhooks: DemoWebhook[] = [
  {
    id: "wh_3f9a1c",
    url: "https://hooks.internal.example.com/aegisora/incidents",
    events: ["incident.opened", "incident.resolved"],
    status: "ACTIVE",
    createdAt: "2026-05-10",
    lastDeliveryAt: "2026-09-21 22:20:20Z",
    successRate: 99.4,
    deliveries: [
      { id: "dlv_1", event: "incident.opened", statusCode: 200, success: true, attempt: 1, sentAt: "2026-09-21 22:20:20Z", durationMs: 145 },
      { id: "dlv_2", event: "incident.opened", statusCode: 200, success: true, attempt: 1, sentAt: "2026-09-21 21:40:05Z", durationMs: 132 },
      { id: "dlv_3", event: "incident.resolved", statusCode: 200, success: true, attempt: 1, sentAt: "2026-09-20 15:10:14Z", durationMs: 118 },
    ],
  },
  {
    id: "wh_7b2e88",
    url: "https://hooks.internal.example.com/aegisora/approvals",
    events: ["approval.requested", "approval.resolved"],
    status: "FAILING",
    createdAt: "2026-06-02",
    lastDeliveryAt: "2026-09-21 22:14:10Z",
    successRate: 61.2,
    deliveries: [
      { id: "dlv_4", event: "approval.requested", statusCode: 503, success: false, attempt: 3, sentAt: "2026-09-21 22:14:10Z", durationMs: 3040 },
      { id: "dlv_5", event: "approval.requested", statusCode: 503, success: false, attempt: 2, sentAt: "2026-09-21 22:14:07Z", durationMs: 2980 },
      { id: "dlv_6", event: "approval.resolved", statusCode: 200, success: true, attempt: 1, sentAt: "2026-09-20 11:02:00Z", durationMs: 154 },
    ],
  },
  {
    id: "wh_c19d40",
    url: "https://hooks.internal.example.com/aegisora/decisions",
    events: ["decision.blocked"],
    status: "DISABLED",
    createdAt: "2026-04-20",
    lastDeliveryAt: "2026-08-30 09:00:00Z",
    successRate: 100,
    deliveries: [
      { id: "dlv_7", event: "decision.blocked", statusCode: 200, success: true, attempt: 1, sentAt: "2026-08-30 09:00:00Z", durationMs: 98 },
    ],
  },
];

export function getWebhook(id: string) {
  return demoWebhooks.find((w) => w.id === id);
}