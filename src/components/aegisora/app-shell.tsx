"use client";

import { AuroraCanvas } from "@/components/aegisora/aurora-canvas";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { AccountSwitcher } from "@/components/aegisora/account-switcher";
import { SidebarNav } from "@/components/aegisora/app-sidebar";
import { CommandPalette } from "@/components/aegisora/command-palette";
import { Logo } from "@/components/aegisora/logo";

import { UserMenu } from "@/components/aegisora/user-menu";
import { TopbarActions } from "@/components/aegisora/topbar-actions";
import { WelcomeTour } from "@/components/aegisora/welcome-tour";
import { WorkspaceProvider } from "@/components/aegisora/workspace-provider";
import { usePendingApprovals } from "@/lib/aegisora/use-pending-approvals";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

const idLike = /^(dec|apr|evd|aud|trc|exe)_|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CRUMB_LABELS: Record<string, string> = {
  "api-keys": "API Keys",
  activity: "Live Activity",
};

function Crumbs() {
  const pathname = usePathname();
  const all = pathname.split("/").filter(Boolean);
  const segs = all.slice(all.indexOf("dashboard") + 1);
  const crumbs = segs.map((s, i) => ({
    label: s,
    href: "/dashboard/" + segs.slice(0, i + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">Control</Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const pretty = idLike.test(c.label) ? (c.label.length > 20 ? c.label.slice(0, 8) : c.label) : (CRUMB_LABELS[c.label] ?? c.label.charAt(0).toUpperCase() + c.label.slice(1));
        return (
          <span key={c.href} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {last ? (
              <span aria-current="page" className={cn("text-foreground", idLike.test(c.label) && "font-mono")}>{pretty}</span>
            ) : (
              <Link href={c.href} className="hover:text-foreground">{pretty}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notif, setNotif] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try { setCollapsed(window.localStorage.getItem("aegisora.sidebar.collapsed") === "1"); } catch {}
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  function toggleSidebar() {
    setCollapsed((v) => {
      const next = !v;
      try { window.localStorage.setItem("aegisora.sidebar.collapsed", next ? "1" : "0"); } catch {}
      return next;
    });
  }
  const pending = usePendingApprovals();

  // Route change intentionally resets transient shell UI state.
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
        <aside data-app-sidebar className={cn("sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface-1", collapsed ? "lg:hidden" : "lg:flex")}>
          <div className="border-b border-border px-5 py-4">
            <Logo />
            <div className="mt-1 pl-[32px] text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Control</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="border-t border-border px-5 py-3 font-mono text-[10px] tracking-wider text-muted-foreground">
            AEGISORA 4.0
          </div>
        </aside>

        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-label="Navigation" className="relative h-full w-72 overflow-y-auto bg-surface-1">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo />
                <button type="button" aria-label="Close navigation" onClick={() => setDrawer(false)} className={cn("rounded-sm p-1.5", focusRing)}>
                  <X className="size-4" />
                </button>
              </div>
              <SidebarNav />
            </div>
          </div>
        )}

        <div className="relative isolate flex min-w-0 flex-1 flex-col">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"><AuroraCanvas intensity={0.35} /></div>
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setDrawer(true)}
                className={cn("inline-flex size-9 items-center justify-center rounded-sm border border-border lg:hidden", focusRing)}
              >
                <Menu className="size-4" />
              </button>

              <button
                type="button"
                aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
                aria-pressed={collapsed}
                onClick={toggleSidebar}
                className={cn("hidden size-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-surface-3 lg:inline-flex", focusRing)}
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </button>

              <AccountSwitcher />

              <button
                type="button"
                onClick={() => setPalette(true)}
                className={cn(
                  "ml-auto flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface-1 px-3 text-sm text-muted-foreground hover:bg-surface-3 sm:ml-6 sm:max-w-2xl",
                  focusRing,
                )}
              >
                <Search className="size-4" />
                <span className="flex-1 truncate text-left">Search policies, agents, decisions, and more</span>
                <kbd className="hidden rounded-sm border border-border px-1.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
              </button>

              
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notif}
                  onClick={() => setNotif(!notif)}
                  className={cn("relative inline-flex size-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-surface-3", focusRing)}
                >
                  <Bell className="size-4" />
                  {pending > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-escalate" />}
                </button>
                {notif && (
                  <div className="aeg-panel absolute right-0 top-full z-40 mt-2 w-72 p-2">
                    <Link href="/dashboard/approvals" className="block rounded-sm px-3 py-2.5 hover:bg-surface-3">
                      <span className="block text-sm font-medium">{pending === 0 ? "Nothing is waiting" : pending === 1 ? "1 approval waiting" : pending + " approvals waiting"}</span>
                      <span className="block text-xs text-muted-foreground">{pending === 0 ? "No actions need a decision." : "Execution is paused until a person decides."}</span>
                    </Link>
                  </div>
                )}
              </div>

              <TopbarActions />
              <UserMenu />
            </div>
            <div className="border-t border-border/60 px-4 py-2 md:px-6">
              <Crumbs />
            </div>
          </header>

          

          <main data-app-main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 md:px-8">{children}</main>
        </div>

        <CommandPalette open={palette} onClose={() => setPalette(false)} />
        <WelcomeTour />
      </div>
    </WorkspaceProvider>
  );
}




