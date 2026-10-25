"use client";

import type { ComponentType } from "react";
import {
  Activity, Bot, ClipboardList, CreditCard, FileSearch, KeyRound, LayoutDashboard,
  Route, Scale, ScrollText, Settings, ShieldCheck, TriangleAlert, UserCheck, Users, Webhook,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: ComponentType<{ className?: string }> };
type Section = { id: string; title?: string; items: Item[] };

const sections: Section[] = [
  {
    id: "overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    id: "runtime",
    title: "Runtime",
    items: [
      { label: "Live Activity", href: "/dashboard/activity", icon: Activity },
      { label: "Decisions", href: "/dashboard/decisions", icon: Scale },
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck },
      { label: "Traces", href: "/dashboard/traces", icon: Route },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    items: [
      { label: "Agents", href: "/dashboard/agents", icon: Bot },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText },
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch },
      { label: "Audit", href: "/dashboard/audit", icon: ClipboardList },
    ],
  },
  {
    id: "platform",
    title: "Platform",
    items: [
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
    ],
  },
  {
    id: "organization",
    title: "Organization",
    items: [
      { label: "Team", href: "/dashboard/team", icon: Users },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Identity", href: "/dashboard/identity", icon: ShieldCheck },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Aegisora Control" className="space-y-5 p-3">
      {sections.map((section) => (
        <div key={section.id}>
          {section.title ? (
            <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
                      focusRing,
                      active
                        ? "bg-surface-4 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
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