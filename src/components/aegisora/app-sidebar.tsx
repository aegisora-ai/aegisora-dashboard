"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
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
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  built: boolean;
};

const nav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, built: true },
  { label: "Live Activity", href: "/dashboard/activity", icon: Activity, built: false },
  { label: "Agents", href: "/dashboard/agents", icon: Bot, built: false },
  { label: "Policies", href: "/dashboard/policies", icon: ScrollText, built: false },
  { label: "Risk", href: "/dashboard/risk", icon: Gauge, built: false },
  { label: "Decisions", href: "/dashboard/decisions", icon: Scale, built: true },
  { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck, built: false },
  { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert, built: false },
  { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch, built: false },
  { label: "Audit", href: "/dashboard/audit", icon: ClipboardList, built: false },
  { label: "Traces", href: "/dashboard/traces", icon: Route, built: false },
  { label: "Providers", href: "/dashboard/providers", icon: Server, built: false },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug, built: false },
  { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook, built: false },
  { label: "Usage", href: "/dashboard/usage", icon: Bell, built: false },
  { label: "Team", href: "/dashboard/team", icon: Users, built: false },
  { label: "Identity", href: "/dashboard/identity", icon: Fingerprint, built: false },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard, built: false },
  { label: "Workspace", href: "/dashboard/workspace", icon: Building2, built: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, built: false },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface-1 lg:flex">
      <div className="border-b border-border px-5 py-4">
        <div className="text-sm font-semibold tracking-[0.2em]">AEGISORA</div>
        <div className="mt-0.5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
          CONTROL
        </div>
      </div>

      <nav aria-label="Aegisora Control" className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {nav.map((item) => {
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
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground/40"
                  >
                    <Icon className="size-4" />
                    {item.label}
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
                    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    active
                      ? "bg-surface-4 text-foreground"
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
      </nav>
    </aside>
  );
}