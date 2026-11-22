import { Activity, Bot, LayoutDashboard, ScrollText, Settings, UserCheck, type LucideIcon } from "lucide-react";

export type NavTab = { label: string; href: string };
export type NavGroup = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  prefixes: string[];
  tabs?: NavTab[];
};

export const MAIN_NAV: NavGroup[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard, prefixes: [] },
  { id: "agents", label: "Agents", href: "/dashboard/agents", icon: Bot, prefixes: ["/dashboard/agents"] },
  { id: "approvals", label: "Approvals", href: "/dashboard/approvals", icon: UserCheck, prefixes: ["/dashboard/approvals"] },
  { id: "policies", label: "Policies", href: "/dashboard/policies", icon: ScrollText, prefixes: ["/dashboard/policies"] },
  {
    id: "activity",
    label: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
    prefixes: [
      "/dashboard/activity", "/dashboard/decisions", "/dashboard/incidents",
      "/dashboard/traces", "/dashboard/audit", "/dashboard/evidence",
    ],
    tabs: [
      { label: "Live", href: "/dashboard/activity" },
      { label: "Decisions", href: "/dashboard/decisions" },
      { label: "Incidents", href: "/dashboard/incidents" },
      { label: "Traces", href: "/dashboard/traces" },
      { label: "Audit", href: "/dashboard/audit" },
      { label: "Evidence", href: "/dashboard/evidence" },
    ],
  },
];

export const SETTINGS_NAV: NavGroup = {
  id: "settings",
  label: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
  prefixes: [
    "/dashboard/settings", "/dashboard/workspace", "/dashboard/team", "/dashboard/api-keys",
    "/dashboard/webhooks", "/dashboard/billing", "/dashboard/identity",
  ],
  tabs: [
    { label: "General", href: "/dashboard/settings" },
    { label: "Workspace", href: "/dashboard/workspace" },
    { label: "Team", href: "/dashboard/team" },
    { label: "API keys", href: "/dashboard/api-keys" },
    { label: "Webhooks", href: "/dashboard/webhooks" },
    { label: "Billing", href: "/dashboard/billing" },
    { label: "Identity", href: "/dashboard/identity" },
  ],
};

export const ALL_NAV: NavGroup[] = [...MAIN_NAV, SETTINGS_NAV];

export function activeGroup(pathname: string): NavGroup | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/dashboard") return MAIN_NAV[0];
  return ALL_NAV.find((g) => g.id !== "overview" && g.prefixes.some((x) => p === x || p.startsWith(x + "/"))) ?? null;
}