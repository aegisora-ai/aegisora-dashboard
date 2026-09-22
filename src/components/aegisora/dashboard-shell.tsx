"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type {
  ComponentType,
  ReactNode,
} from "react"

import {
  Activity,
  Bot,
  CheckCircle2,
  Database,
  FileCheck2,
  LockKeyhole,
  Network,
  PlaySquare,
  Radar,
  Settings2,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react"

type IconType = ComponentType<{
  size?: number
}>

type NavItem = {
  label: string
  href: string
  icon: IconType
}

const groups: Array<{
  label: string
  items: NavItem[]
}> = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: Activity,
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
        icon: CheckCircle2,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Decisions",
        href: "/dashboard/decisions",
        icon: Database,
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
        icon: LockKeyhole,
      },
      {
        label: "Evidence",
        href: "/dashboard/evidence",
        icon: FileCheck2,
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
]

export function AegisoraDashboardShell({
  children,
}: {
  children: ReactNode
}) {

  const pathname =
    usePathname()

  return (
    <div className="ae-dashboard">

      <aside className="ae-sidebar">

        <Link
          href="/dashboard"
          className="ae-brand"
        >
          <span className="ae-brand-mark">
            A
          </span>

          <span>

            <span className="ae-brand-name">
              AEGISORA
            </span>

            <span
              style={{
                display: "block",
                marginTop: 3,
                color:
                  "rgba(255,255,255,0.35)",
                fontSize: 8,
              }}
            >
              control plane
            </span>

          </span>

        </Link>

        {groups.map(
          (group) => (
            <div
              key={group.label}
              className="ae-sidebar-section"
            >

              <p className="ae-sidebar-label">
                {group.label}
              </p>

              <nav>

                {group.items.map(
                  (item) => {

                    const active =
                      pathname ===
                        item.href ||
                      (
                        item.href !==
                          "/dashboard" &&
                        pathname.startsWith(
                          item.href + "/",
                        )
                      )

                    const Icon =
                      item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          active
                            ? "ae-sidebar-link ae-sidebar-link-active"
                            : "ae-sidebar-link"
                        }
                      >
                        <Icon size={14} />
                        {item.label}
                      </Link>
                    )
                  },
                )}

              </nav>

            </div>
          ),
        )}

      </aside>

      <div className="ae-dashboard-main">

        <header className="ae-dashboard-topbar">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >

            <span className="ae-chip ae-chip-blue">
              Aegisora 3.0
            </span>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.40)",
                fontSize: 9,
              }}
            >
              Runtime enforcement
            </span>

          </div>

          <div
            style={{
              display: "flex",
              gap: 7,
            }}
          >

            <Link
              href="/proof"
              className="ae-button ae-button-primary"
            >
              Live proof
            </Link>

            <Link
              href="/"
              className="ae-button"
            >
              Public site
            </Link>

          </div>

        </header>

        {children}

      </div>

    </div>
  )
}