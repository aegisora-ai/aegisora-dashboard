"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileClock,
  FileSearch,
  GitBranch,
  KeyRound,
  Layers3,
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
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const groups = [
  {
    label: "Workspace",
    items: [
      ["Overview", "/dashboard", CircleGauge],
      ["Agents", "/dashboard/agents", Bot],
      ["Policies", "/dashboard/policies", ShieldCheck],
      ["Simulator", "/dashboard/simulator", PlaySquare],
      ["Approvals", "/dashboard/approvals", ListChecks],
    ],
  },
  {
    label: "Operations",
    items: [
      ["Decisions", "/dashboard/decisions", CheckCircle2],
      ["Live activity", "/dashboard/live-activity", Activity],
      ["Incidents", "/dashboard/incidents", Radar],
      ["Enforcement", "/dashboard/enforcement", SlidersHorizontal],
      ["Traces", "/dashboard/traces", GitBranch],
      ["Evidence", "/dashboard/evidence", FileSearch],
      ["Audit", "/dashboard/audit", FileClock],
    ],
  },
  {
    label: "Infrastructure",
    items: [
      ["Providers", "/dashboard/providers", Network],
      ["Integrations", "/dashboard/integrations", Boxes],
    ],
  },
  {
    label: "Organization",
    items: [
      ["Team", "/dashboard/team", Users],
      ["Settings", "/dashboard/settings", Settings2],
      ["Users & Billing", "/dashboard/billing", WalletCards],
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
          <span className="brand-mark">A</span>

          <span className="brand-copy">
            <span className="brand-name">AEGISORA</span>
            <span className="brand-sub">control plane</span>
          </span>
        </Link>

        <div className="dashboard-nav-group">
          <div className="workspace-pill" style={{ margin: "0 6px" }}>
            <span className="status-dot status-online" />
            Workspace / Demo
          </div>
        </div>

        {groups.map((group) => (
          <div className="dashboard-nav-group" key={group.label}>
            <p className="dashboard-nav-title">
              {group.label}
            </p>

            <nav className="dashboard-nav">
              {group.items.map(([label, href, Icon]) => {
                const active =
                  pathname === href ||
                  (href !== "/dashboard" &&
                    pathname.startsWith(href));

                return (
                  <Link
                    href={href as string}
                    className={
                      active
                        ? "dashboard-nav-item dashboard-nav-item-active"
                        : "dashboard-nav-item"
                    }
                    key={label as string}
                  >
                    <Icon size={15} strokeWidth={1.7} />
                    <span>{label as string}</span>
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
          <Sparkles size={14} color="#65d6ff" />
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
              style={{ minHeight: 36, fontSize: 11 }}
            >
              Public site
            </Link>

            <div className="workspace-pill">
              <KeyRound size={13} />
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