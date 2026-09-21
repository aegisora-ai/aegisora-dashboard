// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export const riskTrend = [
  { day: 1, low: 40, medium: 12, high: 4, critical: 1 },
  { day: 2, low: 44, medium: 14, high: 3, critical: 0 },
  { day: 3, low: 41, medium: 16, high: 5, critical: 1 },
  { day: 4, low: 48, medium: 15, high: 4, critical: 0 },
  { day: 5, low: 46, medium: 18, high: 6, critical: 2 },
  { day: 6, low: 52, medium: 17, high: 5, critical: 1 },
  { day: 7, low: 50, medium: 20, high: 7, critical: 1 },
  { day: 8, low: 55, medium: 19, high: 6, critical: 0 },
  { day: 9, low: 53, medium: 22, high: 8, critical: 2 },
  { day: 10, low: 58, medium: 21, high: 6, critical: 1 },
  { day: 11, low: 57, medium: 24, high: 9, critical: 2 },
  { day: 12, low: 61, medium: 23, high: 7, critical: 1 },
];

export const riskByAgent: { agent: string; low: number; medium: number; high: number; critical: number }[] = [
  { agent: "finance-operator", low: 720, medium: 84, high: 32, critical: 5 },
  { agent: "ops-assistant", low: 1140, medium: 60, high: 20, critical: 2 },
  { agent: "report-builder", low: 2280, medium: 20, high: 2, critical: 0 },
  { agent: "support-bot", low: 1490, medium: 100, high: 30, critical: 3 },
];