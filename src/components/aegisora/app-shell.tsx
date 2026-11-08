"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, ArrowUpRight, Bell, Bot, ClipboardList, CreditCard, FileSearch, KeyRound, Layers,
  LayoutDashboard, LogOut, Menu, Route, Scale, ScrollText, Search, Settings, ShieldCheck,
  TriangleAlert, UserCheck, Users, Volume2, VolumeX, Webhook, type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { AccountSwitcher } from "@/components/aegisora/account-switcher";
import { CommandPalette } from "@/components/aegisora/command-palette";
import { UserMenu } from "@/components/aegisora/user-menu";
import { WelcomeTour } from "@/components/aegisora/welcome-tour";
import { WorkspaceProvider, useWorkspace } from "@/components/aegisora/workspace-provider";
import { usePendingApprovals } from "@/lib/aegisora/use-pending-approvals";
import { play, setSoundEnabled, soundEnabled } from "@/lib/aegisora/sound";
import { createClient } from "@/lib/supabase/client";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: LucideIcon; badge?: boolean };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Approvals", href: "/dashboard/approvals", icon: UserCheck, badge: true },
    ],
  },
  {
    title: "Govern",
    items: [
      { label: "Agents", href: "/dashboard/agents", icon: Bot },
      { label: "Policies", href: "/dashboard/policies", icon: ScrollText },
      { label: "Evidence", href: "/dashboard/evidence", icon: FileSearch },
    ],
  },
  {
    title: "Monitor",
    items: [
      { label: "Live activity", href: "/dashboard/activity", icon: Activity },
      { label: "Decisions", href: "/dashboard/decisions", icon: Scale },
      { label: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
      { label: "Traces", href: "/dashboard/traces", icon: Route },
      { label: "Audit log", href: "/dashboard/audit", icon: ClipboardList },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "API keys", href: "/dashboard/api-keys", icon: KeyRound },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { label: "Team", href: "/dashboard/team", icon: Users },
      { label: "Workspace", href: "/dashboard/workspace", icon: Layers },
      { label: "Identity", href: "/dashboard/identity", icon: ShieldCheck },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    title: "Billing",
    items: [{ label: "Plan and billing", href: "/dashboard/billing", icon: CreditCard }],
  },
];

const isOn = (p: string, href: string) => (href === "/dashboard" ? p === href : p === href || p.startsWith(href + "/"));

function Brand({ onGo }: { onGo?: () => void }) {
  return (
    <Link href="/dashboard" className={cn("aegc-brand", focusRing)} aria-label="Aegisora Console" onClick={onGo}>
      <span className="aegc-mark" data-logo="" aria-hidden="true" />
      <span className="aegc-brand__t">Aegisora<span>Console</span></span>
    </Link>
  );
}

function Nav({ pathname, pending, onGo }: { pathname: string; pending: number; onGo?: () => void }) {
  return (
    <nav aria-label="Main" className="aegc-nav">
      {GROUPS.map((g, gi) => (
        <div key={gi} className="aegc-grp">
          {g.title ? <p className="aegc-grp__t">{g.title}</p> : null}
          {g.items.map((it) => {
            const Icon = it.icon;
            const on = isOn(pathname, it.href);
            return (
              <Link key={it.href} href={it.href} aria-current={on ? "page" : undefined} onClick={onGo} className={cn("aegc-item", focusRing)}>
                <Icon aria-hidden="true" />
                <span>{it.label}</span>
                {it.badge && pending > 0 ? <b className="aegc-badge">{pending > 99 ? "99+" : pending}</b> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SideFoot() {
  const router = useRouter();
  const { userEmail, userName, currentWorkspace } = useWorkspace();
  const label = userName || userEmail || "Account";
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="aegc-acc-row">
      <Link href="/dashboard/settings" className={cn("aegc-acc", focusRing)}>
        <span className="aegc-av" aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
        <span className="aegc-acc__t">
          <b>{label}</b>
          <small>{currentWorkspace?.name ?? ""}</small>
        </span>
      </Link>
      <button type="button" className={cn("aegc-ibtn", focusRing)} aria-label="Sign out" onClick={signOut}>
        <LogOut aria-hidden="true" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notif, setNotif] = useState(false);
  const [snd, setSnd] = useState(true);
  const pending = usePendingApprovals();

  // The console is dark-only: keep the dark class while it is mounted, then restore.
  useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains("dark");
    root.classList.add("dark");
    const mo = new MutationObserver(() => { if (!root.classList.contains("dark")) root.classList.add("dark"); });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => { mo.disconnect(); if (!had) root.classList.remove("dark"); };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDrawer(false); setNotif(false); }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const t = window.setTimeout(() => setSnd(soundEnabled()), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") { setDrawer(false); setNotif(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <WorkspaceProvider>
      <div className="aegc-app">
        <aside data-app-sidebar className="aegc-side">
          <Brand />
          <Nav pathname={pathname} pending={pending} />
          <SideFoot />
        </aside>

        {drawer ? (
          <>
            <div className="aegc-scrim" onClick={() => setDrawer(false)} aria-hidden="true" />
            <div className="aegc-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
              <Brand onGo={() => setDrawer(false)} />
              <Nav pathname={pathname} pending={pending} onGo={() => setDrawer(false)} />
              <SideFoot />
            </div>
          </>
        ) : null}

        <div className="aegc-col">
          <header className="aegc-top">
            <button type="button" aria-label="Open navigation" onClick={() => setDrawer(true)} className={cn("aegc-ibtn aegc-only-m", focusRing)}>
              <Menu aria-hidden="true" />
            </button>
            <AccountSwitcher />
            <span className="aegc-top__sp" />
            <Link href="/docs" className={cn("aegc-link", focusRing)}>Documentation<ArrowUpRight aria-hidden="true" /></Link>
            <Link href="/support" className={cn("aegc-link", focusRing)}>Support<ArrowUpRight aria-hidden="true" /></Link>
            <button type="button" onClick={() => setPalette(true)} className={cn("aegc-search", focusRing)} aria-label="Search">
              <Search aria-hidden="true" />
              <span>Search</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button type="button" onClick={() => setPalette(true)} className={cn("aegc-ibtn aegc-only-m", focusRing)} aria-label="Search">
              <Search aria-hidden="true" />
            </button>
            <div style={{ position: "relative" }}>
              <button type="button" aria-label="Notifications" aria-expanded={notif} onClick={() => setNotif(!notif)} className={cn("aegc-ibtn", focusRing)}>
                <Bell aria-hidden="true" />
                {pending > 0 ? <i /> : null}
              </button>
              {notif ? (
                <div className="aegc-pop">
                  <Link href="/dashboard/approvals">
                    <b>{pending === 0 ? "Nothing is waiting" : pending === 1 ? "1 approval waiting" : pending + " approvals waiting"}</b>
                    <small>{pending === 0 ? "No actions need a decision." : "Execution is paused until a person decides."}</small>
                  </Link>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              data-sound="off"
              onClick={() => { const next = !snd; setSoundEnabled(next); setSnd(next); if (next) play("on"); }}
              aria-label={snd ? "Mute interface sounds" : "Unmute interface sounds"}
              aria-pressed={!snd}
              className={cn("aegc-ibtn", focusRing)}
            >
              {snd ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            </button>
            <UserMenu />
          </header>

          <main data-app-main className="aegc-main">{children}</main>

          <footer className="aegc-foot">
            <span>&copy; {new Date().getFullYear()} Aegisora. All rights reserved.</span>
            <nav aria-label="Footer">
              <Link href="/trust">Trust</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/impressum">Impressum</Link>
            </nav>
          </footer>
        </div>

        <CommandPalette open={palette} onClose={() => setPalette(false)} />
        <WelcomeTour />
      </div>
    </WorkspaceProvider>
  );
}