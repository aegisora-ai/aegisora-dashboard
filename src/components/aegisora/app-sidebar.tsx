"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Building2,
  ClipboardList,
  CreditCard,
  FileSearch,
  Fingerprint,
  Gauge,
  LayoutDashboard,
  Plug,
  Route,
  ScrollText,
  Server,
  Settings,
  Scale,
  TriangleAlert,
  UserCheck,
  Users,
  Webhook,
} from "lucide-react";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  built: boolean;
};

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Runtime",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, built: true },
      { label: "Live Activity", href: "/dashboard/activity", icon: Activity, built: true },
      { label: "Agents", href: "/dashboard/agents", icon: Bot, built: true },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText, built: true },
      { label: "Risk", href: "/dashboard/risk", icon: Gauge, built: true },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Decisions", href: "/dashboard/decisions", icon: Scale, built: true },
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck, built: true },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert, built: true },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch, built: true },
      { label: "Audit", href: "/dashboard/audit", icon: ClipboardList, built: true },
      { label: "Traces", href: "/dashboard/traces", icon: Route, built: true },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Providers", href: "/dashboard/providers", icon: Server, built: false },
      { label: "Integrations", href: "/dashboard/integrations", icon: Plug, built: false },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook, built: false },
    ],
  },
  {
    title: "Organization",
    items: [
      { label: "Team", href: "/dashboard/team", icon: Users, built: false },
      { label: "Identity", href: "/dashboard/identity", icon: Fingerprint, built: false },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard, built: false },
      { label: "Workspace", href: "/dashboard/workspace", icon: Building2, built: false },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, built: false },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Aegisora Control" className="space-y-5 p-3">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="px-3 pb-1.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            {g.title.toUpperCase()}
          </div>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              if (!item.built) {
                return (
                  <li key={item.href}>
                    <span
                      aria-disabled="true"
                      className="flex cursor-not-allowed items-center gap-2.5 rounded-sm px-3 py-1.5 text-sm text-muted-foreground/50"
                    >
                      <Icon className="size-4" />
                      <span className="flex-1">{item.label}</span>
                      <span className="font-mono text-[9px] tracking-wider">SOON</span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
                      focusRing,
                      active
                        ? "bg-surface-4 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}