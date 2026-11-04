"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  Activity, Bot, ChevronDown, ClipboardList, CreditCard, FileSearch, KeyRound, LayoutDashboard, Plus,
  Route, Scale, ScrollText, Settings, ShieldCheck, TriangleAlert, UserCheck, Users, Webhook,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { usePendingApprovals } from "@/lib/aegisora/use-pending-approvals";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: ComponentType<{ className?: string }>; badge?: "approvals" };
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
    id: "monitor",
    title: "Monitor",
    items: [
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck, badge: "approvals" },
      { label: "Live Activity", href: "/dashboard/activity", icon: Activity },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
    ],
  },
  {
    id: "govern",
    title: "Govern",
    items: [
      { label: "Agents", href: "/dashboard/agents", icon: Bot },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText },
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch },
    ],
  },
  {
    id: "workspace",
    title: "Workspace",
    items: [
      { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "Team", href: "/dashboard/team", icon: Users },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const advanced: Item[] = [
  { label: "Decisions", href: "/dashboard/decisions", icon: Scale },
  { label: "Traces", href: "/dashboard/traces", icon: Route },
  { label: "Audit", href: "/dashboard/audit", icon: ClipboardList },
  { label: "Identity", href: "/dashboard/identity", icon: ShieldCheck },
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
        className={cn("flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-3", focusRing)}
      >
        <Plus className="size-4" aria-hidden="true" />
        New
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
  const pending = usePendingApprovals();
  const [advOpen, setAdvOpen] = useState(false);
  const advActive = advanced.some((i) => isActive(pathname, i.href));
  const showAdvanced = advOpen || advActive;

  function renderItem(item: Item) {
    const Icon = item.icon;
    const active = isActive(pathname, item.href);
    const count = item.badge === "approvals" ? pending : 0;
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
          <span className="truncate">{item.label}</span>
          {count > 0 && (
            <span className="ml-auto rounded-full bg-escalate px-1.5 text-[10px] font-semibold leading-4 text-black">{count > 99 ? "99+" : count}</span>
          )}
        </Link>
      </li>
    );
  }

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
            <ul className="space-y-0.5">{section.items.map(renderItem)}</ul>
          </div>
        ))}
        <div className="border-t border-border/60 pt-3">
          <button
            type="button"
            aria-expanded={showAdvanced}
            onClick={() => setAdvOpen((v) => !v)}
            className={cn("flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground", focusRing)}
          >
            Advanced
            <ChevronDown className={cn("size-3.5 transition-transform", showAdvanced && "rotate-180")} aria-hidden="true" />
          </button>
          {showAdvanced && <ul className="mt-1 space-y-0.5">{advanced.map(renderItem)}</ul>}
        </div>
      </nav>
    </>
  );
}