"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  Activity, Bot, ClipboardList, CreditCard, FileSearch, KeyRound, LayoutDashboard, Plus,
  Route, Scale, ScrollText, Settings, ShieldCheck, TriangleAlert, UserCheck, Users, Webhook,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: ComponentType<{ className?: string }> };
type Section = { id: string; title?: string; items: Item[] };

const CREATE: Item[] = [
  { label: "Policy", href: "/dashboard/policies", icon: ScrollText },
  { label: "Agent", href: "/dashboard/agents", icon: Bot },
  { label: "API key", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Webhook", href: "/dashboard/webhooks", icon: Webhook },
  
];

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

function CreateMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative px-3 pt-3" onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn("flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover", focusRing)}
      >
        <Plus className="size-4" aria-hidden="true" />
        Create
      </button>
      {open && (
        <ul role="menu" className="absolute inset-x-3 top-full z-30 mt-1 rounded-md border border-border bg-popover p-1 shadow-lg">
          {CREATE.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.href} role="none">
                <Link role="menuitem" href={c.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm hover:bg-surface-3", focusRing)}>
                  <Icon className="size-4 text-primary" />
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <CreateMenu />
      <nav aria-label="Aegisora Control" className="space-y-4 p-3">
        {sections.map((section, index) => (
          <div key={section.id} className={index > 0 ? "border-t border-border/60 pt-3" : undefined}>
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
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        focusRing,
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}