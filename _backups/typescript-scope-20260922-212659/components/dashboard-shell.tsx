"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  Bot,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileClock,
  FileSearch,
  Fingerprint,
  GitBranch,
  LifeBuoy,
  ListChecks,
  Network,
  PlaySquare,
  Radar,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: CircleGauge,
      },
      {
        label: "Agents",
        href: "/dashboard/agents",
        icon: Bot,
      },
      {
        label: "Policies",
        href: "/dashboard/policies",
        icon: ShieldCheck,
      },
      {
        label: "Simulator",
        href: "/dashboard/simulator",
        icon: PlaySquare,
      },
      {
        label: "Approvals",
        href: "/dashboard/approvals",
        icon: ListChecks,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Decisions",
        href: "/dashboard/decisions",
        icon: CheckCircle2,
      },
      {
        label: "Live activity",
        href: "/dashboard/live-activity",
        icon: Activity,
      },
      {
        label: "Incidents",
        href: "/dashboard/incidents",
        icon: Radar,
      },
      {
        label: "Enforcement",
        href: "/dashboard/enforcement",
        icon: SlidersHorizontal,
      },
      {
        label: "Traces",
        href: "/dashboard/traces",
        icon: GitBranch,
      },
      {
        label: "Evidence",
        href: "/dashboard/evidence",
        icon: FileSearch,
      },
      {
        label: "Audit",
        href: "/dashboard/audit",
        icon: FileClock,
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        label: "Providers",
        href: "/dashboard/providers",
        icon: Network,
      },
      {
        label: "Integrations",
        href: "/dashboard/integrations",
        icon: Boxes,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        label: "Team",
        href: "/dashboard/team",
        icon: Users,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings2,
      },
      {
        label: "Users & Billing",
        href: "/dashboard/billing",
        icon: WalletCards,
      },
    ],
  },
];

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link
          href="/dashboard"
          className="brand"
          style={{ margin: "2px 8px 0" }}
        >
          <span className="brand-mark">
            A
          </span>

          <span className="brand-copy">
            <span className="brand-name">
              AEGISORA
            </span>
            <span className="brand-sub">
              control plane
            </span>
          </span>
        </Link>

        <div
          className="dashboard-nav-group"
          style={{ marginTop: 25 }}
        >
          <div
            className="workspace-pill"
            style={{ margin: "0 6px" }}
          >
            <span className="status-dot status-online" />
            Workspace / Demo
          </div>
        </div>

        {groups.map((group) => (
          <div
            className="dashboard-nav-group"
            key={group.label}
          >
            <p className="dashboard-nav-title">
              {group.label}
            </p>

            <nav className="dashboard-nav">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (
                    item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/")
                  );

                const Icon =
                  item.icon;

                return (
                  <Link
                    href={item.href}
                    className={
                      active
                        ? "dashboard-nav-item dashboard-nav-item-active"
                        : "dashboard-nav-item"
                    }
                    key={item.href}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.7}
                    />

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <div
          className="callout"
          style={{
            marginTop: 26,
            padding: 12,
          }}
        >
          <Sparkles
            size={14}
            color="#65d6ff"
          />

          <strong style={{ marginTop: 8 }}>
            3.0 proof runtime
          </strong>

          <span>
            Connect a real agent, evaluate a real action,
            and attach the resulting decision evidence.
          </span>

          <Link
            className="button"
            href="/proof"
            style={{
              marginTop: 10,
              width: "100%",
              minHeight: 35,
              fontSize: 10,
            }}
          >
            Open live proof
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-top-left">
            <span className="workspace-pill">
              <LifeBuoy size={13} />
              Aegisora workspace
            </span>

            <span className="workspace-pill">
              <span className="status-dot status-online" />
              Runtime connected
            </span>
          </div>

          <div className="dashboard-top-right">
            <Link
              className="button"
              href="/"
              style={{
                minHeight: 36,
                fontSize: 11,
              }}
            >
              Public site
            </Link>

            <div className="workspace-pill">
              <Fingerprint size={13} />
              Founder preview
              <ChevronDown size={13} />
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}