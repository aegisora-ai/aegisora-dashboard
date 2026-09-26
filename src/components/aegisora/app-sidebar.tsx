"use client";

import { useState } from "react";
import {
  Activity, Bot, Building2, ChevronRight, ClipboardList, FileSearch,
  LayoutDashboard, Route, Scale, ScrollText, Server,
  Settings, TriangleAlert, UserCheck, Webhook, KeyRound,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
type Group = { id: string; title: string; icon: React.ComponentType<{ className?: string }>; items: Item[] };

const groups: Group[] = [
  {
    id: "runtime", title: "Runtime", icon: Activity,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Live Activity", href: "/dashboard/activity", icon: Activity },
      { label: "Agents", href: "/dashboard/agents", icon: Bot },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText },
    ],
  },
  {
    id: "governance", title: "Governance", icon: Scale,
    items: [
      { label: "Decisions", href: "/dashboard/decisions", icon: Scale },
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch },
      { label: "Audit", href: "/dashboard/audit", icon: ClipboardList },
      { label: "Traces", href: "/dashboard/traces", icon: Route },
    ],
  },
  {
    id: "platform", title: "Platform", icon: Server,
    items: [
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
    ],
  },
  {
    id: "organization", title: "Organization", icon: Building2,
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();
  const activeGroupId = groups.find((x) => x.items.some((i) => isActive(pathname, i.href)))?.id;
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Aegisora Control" className="space-y-1 p-3">
      {groups.map((g) => {
        const isOpen = openOverrides[g.id] ?? g.id === activeGroupId;
        const GroupIcon = g.icon;
        return (
          <div key={g.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`nav-${g.id}`}
              onClick={() => setOpenOverrides((o) => ({ ...o, [g.id]: !isOpen }))}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3",
                focusRing,
              )}
            >
              <GroupIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 text-left">{g.title}</span>
              <ChevronRight
                className={cn("size-4 text-muted-foreground transition-transform duration-300 ease-out", isOpen && "rotate-90")}
              />
            </button>
            <div
              id={`nav-${g.id}`}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <ul className="ml-[18px] mt-0.5 space-y-0.5 border-l border-border pb-2 pl-2">
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-sm px-3 py-1.5 text-[13px] transition-colors",
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
            </div>
          </div>
        );
      })}
    </nav>
  );
}

