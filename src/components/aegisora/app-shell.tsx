"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search, ShieldCheck, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { AccountSwitcher } from "@/components/aegisora/account-switcher";
import { CommandPalette } from "@/components/aegisora/command-palette";
import { Logo } from "@/components/aegisora/logo";
import { SectionTabs } from "@/components/aegisora/section-tabs";
import { UserMenu } from "@/components/aegisora/user-menu";
import { TopbarActions } from "@/components/aegisora/topbar-actions";
import { WelcomeTour } from "@/components/aegisora/welcome-tour";
import { WorkspaceProvider } from "@/components/aegisora/workspace-provider";
import { usePendingApprovals } from "@/lib/aegisora/use-pending-approvals";
import { ALL_NAV, MAIN_NAV, SETTINGS_NAV, activeGroup, type NavGroup } from "@/lib/aegisora/nav";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

function RailLink({ item, active, badge }: { item: NavGroup; active: boolean; badge?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex size-11 items-center justify-center rounded-xl transition-colors",
        active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
        focusRing,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {badge && <span className="absolute right-2 top-2 size-2 rounded-full bg-escalate" />}
      <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block group-focus-visible:block">
        {item.label}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notif, setNotif] = useState(false);
  const pending = usePendingApprovals();
  const group = activeGroup(pathname);

  // The dashboard is dark-only: keep the dark class while it is mounted, then restore.
  useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains("dark");
    root.classList.add("dark");
    const mo = new MutationObserver(() => { if (!root.classList.contains("dark")) root.classList.add("dark"); });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => { mo.disconnect(); if (!had) root.classList.remove("dark"); };
  }, []);

  // Route change resets transient shell UI state.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDrawer(false);
      setNotif(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === "Escape") {
        setDrawer(false);
        setNotif(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <WorkspaceProvider>
      <div className="aeg-app flex min-h-screen">
        <aside data-app-sidebar className="sticky top-0 z-40 hidden h-screen w-[68px] shrink-0 flex-col items-center border-r border-border bg-surface-1 py-4 lg:flex">
          <Link href="/dashboard" aria-label="Aegisora" className={cn("mb-6 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground", focusRing)}>
            <ShieldCheck className="size-5" aria-hidden="true" />
          </Link>
          <nav aria-label="Main" className="flex flex-1 flex-col items-center gap-1.5">
            {MAIN_NAV.map((g) => (
              <RailLink key={g.id} item={g} active={group?.id === g.id} badge={g.id === "approvals" && pending > 0} />
            ))}
          </nav>
          <RailLink item={SETTINGS_NAV} active={group?.id === "settings"} />
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-label="Navigation" className="relative h-full w-72 overflow-y-auto bg-surface-1">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo />
                <button type="button" aria-label="Close navigation" onClick={() => setDrawer(false)} className={cn("rounded-md p-1.5", focusRing)}>
                  <X className="size-4" />
                </button>
              </div>
              <nav aria-label="Main" className="space-y-1 p-3">
                {ALL_NAV.map((g) => {
                  const Icon = g.icon;
                  const on = group?.id === g.id;
                  return (
                    <Link
                      key={g.id}
                      href={g.href}
                      aria-current={on ? "page" : undefined}
                      className={cn("flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium", on ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-surface-3 hover:text-foreground", focusRing)}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {g.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <div className="relative isolate flex min-w-0 flex-1 flex-col">
          <div className="aeg-glow" aria-hidden="true" />

          <header className="sticky top-0 z-30 border-b border-border bg-background/60 backdrop-blur-md">
            <div className="flex h-16 items-center gap-3 px-4 md:px-8">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setDrawer(true)}
                className={cn("inline-flex size-10 items-center justify-center rounded-xl border border-border lg:hidden", focusRing)}
              >
                <Menu className="size-4" />
              </button>

              <p className="hidden text-base font-semibold tracking-tight sm:block">{group?.label ?? "Dashboard"}</p>

              <AccountSwitcher />

              <button
                type="button"
                onClick={() => setPalette(true)}
                className={cn(
                  "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface-1 px-3.5 text-sm text-muted-foreground hover:bg-surface-3 sm:mx-auto sm:max-w-md",
                  focusRing,
                )}
              >
                <Search className="size-4" />
                <span className="flex-1 truncate text-left">Search...</span>
                <kbd className="hidden rounded-md border border-border px-1.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notif}
                  onClick={() => setNotif(!notif)}
                  className={cn("relative inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-surface-3", focusRing)}
                >
                  <Bell className="size-4" />
                  {pending > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-escalate" />}
                </button>
                {notif && (
                  <div className="aeg-panel absolute right-0 top-full z-40 mt-2 w-72 p-2">
                    <Link href="/dashboard/approvals" className="block rounded-md px-3 py-2.5 hover:bg-surface-3">
                      <span className="block text-sm font-medium">{pending === 0 ? "Nothing is waiting" : pending === 1 ? "1 approval waiting" : pending + " approvals waiting"}</span>
                      <span className="block text-xs text-muted-foreground">{pending === 0 ? "No actions need a decision." : "Execution is paused until a person decides."}</span>
                    </Link>
                  </div>
                )}
              </div>

              <TopbarActions />
              <UserMenu />
            </div>
          </header>

          <main data-app-main className="relative mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 md:px-8">
            <SectionTabs />
            {children}
          </main>
        </div>

        <CommandPalette open={palette} onClose={() => setPalette(false)} />
        <WelcomeTour />
      </div>
    </WorkspaceProvider>
  );
}