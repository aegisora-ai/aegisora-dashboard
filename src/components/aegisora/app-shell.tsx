"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { AccountSwitcher } from "@/components/aegisora/account-switcher";
import { SidebarNav } from "@/components/aegisora/app-sidebar";
import { CommandPalette } from "@/components/aegisora/command-palette";
import { Logo } from "@/components/aegisora/logo";

import { UserMenu } from "@/components/aegisora/user-menu";
import { WorkspaceProvider } from "@/components/aegisora/workspace-provider";
import { demoApprovals } from "@/lib/demo-approvals";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

const idLike = /^(dec|apr|evd|aud|trc|exe)_/;

function Crumbs() {
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean).slice(1);
  const crumbs = segs.map((s, i) => ({
    label: s,
    href: "/dashboard/" + segs.slice(0, i + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">Control</Link>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const pretty = idLike.test(c.label) ? c.label : c.label.charAt(0).toUpperCase() + c.label.slice(1);
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
  const pending = demoApprovals.filter((a) => a.status === "PENDING").length;

  useEffect(() => {
    setDrawer(false);
    setNotif(false);
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
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface-1 lg:flex">
          <div className="border-b border-border px-5 py-4">
            <Logo />
            <div className="mt-1 pl-[32px] font-mono text-[10px] tracking-[0.25em] text-muted-foreground">CONTROL</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="border-t border-border px-5 py-3 font-mono text-[10px] tracking-wider text-muted-foreground">
            AEGISORA 3.0 / SAMPLE DATA
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

        <div className="flex min-w-0 flex-1 flex-col">
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

              <AccountSwitcher />

              <button
                type="button"
                onClick={() => setPalette(true)}
                className={cn(
                  "ml-auto flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-1 px-3 text-sm text-muted-foreground hover:bg-surface-3 sm:ml-6 sm:w-72",
                  focusRing,
                )}
              >
                <Search className="size-4" />
                <span className="hidden flex-1 text-left sm:inline">Search</span>
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
                      <span className="block text-sm font-medium">{pending} approval waiting</span>
                      <span className="block text-xs text-muted-foreground">Execution is paused until it is resolved.</span>
                    </Link>
                    <p className="px-3 py-2 font-mono text-[10px] tracking-wider text-muted-foreground">SAMPLE DATA</p>
                  </div>
                )}
              </div>

              <UserMenu />
            </div>
            <div className="border-t border-border/60 px-4 py-2 md:px-6">
              <Crumbs />
            </div>
          </header>

          <div className="border-b border-escalate/30 bg-escalate-muted px-4 py-1.5 text-xs text-escalate md:px-6">
            Sample data. This console is not yet connected to Aegisora Core.
          </div>

          <main className="flex-1 px-4 py-8 md:px-6">{children}</main>
        </div>

        <CommandPalette open={palette} onClose={() => setPalette(false)} />
      </div>
    </WorkspaceProvider>
  );
}