"use client"

import Link from "next/link"

import {
  ArrowRight,
  FileCheck2,
  LockKeyhole,
  PlaySquare,
  ShieldCheck,
} from "lucide-react"

import type {
  ComponentType,
} from "react"

type Props = {
  section?: string[]
}

const dashboardSections: Record<
  string,
  {
    title: string
    description: string
  }
> = {
  dashboard: {
    title: "Overview",
    description:
      "Operational view of the Aegisora runtime control plane.",
  },
  agents: {
    title: "Agents",
    description:
      "Canonical identities connected to the runtime.",
  },
  policies: {
    title: "Policies",
    description:
      "Rules defining what an agent can execute.",
  },
  simulator: {
    title: "Simulator",
    description:
      "Evaluate an action before it reaches execution.",
  },
  approvals: {
    title: "Approvals",
    description:
      "Human review queue for escalated actions.",
  },
  decisions: {
    title: "Decisions",
    description:
      "Runtime decision records with evidence identity.",
  },
  "live-activity": {
    title: "Live activity",
    description:
      "Requests moving through the execution boundary.",
  },
  incidents: {
    title: "Incidents",
    description:
      "Blocked or escalated actions requiring attention.",
  },
  enforcement: {
    title: "Enforcement",
    description:
      "Runtime capability and execution controls.",
  },
  evidence: {
    title: "Evidence",
    description:
      "Evidence linked to runtime decisions.",
  },
  providers: {
    title: "Providers",
    description:
      "Model providers connected through the runtime.",
  },
  team: {
    title: "Team",
    description:
      "Organization members and access.",
  },
  settings: {
    title: "Settings",
    description:
      "Workspace configuration.",
  },
  billing: {
    title: "Users & Billing",
    description:
      "Organization administration and commercial controls.",
  },
}

export function DashboardView({
  section,
}: Props) {

  const currentKey =
    section?.[0] ??
    "dashboard"

  const current =
    dashboardSections[
      currentKey
    ] ??
    dashboardSections.dashboard

  if (
    currentKey !==
    "dashboard"
  ) {

    return (
      <div className="ae-dashboard-content">

        <div className="ae-dashboard-header">

          <div>

            <div className="ae-eyebrow">
              Aegisora workspace
            </div>

            <h1 className="ae-dashboard-title">
              {current.title}
            </h1>

            <p className="ae-dashboard-copy">
              {current.description}
            </p>

          </div>

          <Link
            href="/proof"
            className="ae-button ae-button-primary"
          >
            Run live proof
            <ArrowRight
              size={13}
            />
          </Link>

        </div>

        <div
          className="ae-panel"
          style={{
            marginTop: 20,
          }}
        >

          <div className="ae-panel-heading">

            <div>

              <div className="ae-panel-title">
                {current.title}
              </div>

              <div className="ae-panel-sub">
                Aegisora enterprise control surface
              </div>

            </div>

            <span className="ae-chip ae-chip-blue">
              Aegisora 3.0
            </span>

          </div>

          <div className="ae-grid-3">

            {[
              {
                label: "Runtime",
                value: "3.0",
                icon: PlaySquare,
              },
              {
                label: "Enforcement",
                value: "Active",
                icon: LockKeyhole,
              },
              {
                label: "Evidence",
                value: "Enabled",
                icon: FileCheck2,
              },
            ].map(
              (item) => {

                const Icon =
                  item.icon as ComponentType<{
                    size?: number
                  }>

                return (
                  <div
                    className="ae-metric"
                    key={item.label}
                    style={{
                      marginTop: 18,
                    }}
                  >

                    <Icon
                      size={16}
                    />

                    <div
                      className="ae-metric-label"
                      style={{
                        marginTop: 9,
                      }}
                    >
                      {item.label}
                    </div>

                    <div className="ae-metric-value">
                      {item.value}
                    </div>

                  </div>
                )
              },
            )}

          </div>

          <div
            className="ae-panel-sub"
            style={{
              marginTop: 20,
              lineHeight: 1.7,
            }}
          >
            Runtime data should come from
            connected tenant-scoped services,
            not invented marketing metrics.
          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="ae-dashboard-content">

      <div className="ae-dashboard-header">

        <div>

          <div className="ae-eyebrow">
            Aegisora control plane
          </div>

          <h1 className="ae-dashboard-title">
            Overview
          </h1>

          <p className="ae-dashboard-copy">
            Runtime control for agents,
            policies, enforcement and evidence.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: 7,
          }}
        >

          <Link
            href="/dashboard/simulator"
            className="ae-button"
          >
            Simulator
          </Link>

          <Link
            href="/proof"
            className="ae-button ae-button-primary"
          >
            Live proof
            <ArrowRight
              size={13}
            />
          </Link>

        </div>

      </div>

      <div className="ae-metrics">

        {[
          {
            label: "Runtime",
            value: "3.0",
          },
          {
            label: "Decision",
            value: "Live",
          },
          {
            label: "Enforcement",
            value: "Active",
          },
          {
            label: "Evidence",
            value: "Ready",
          },
        ].map(
          (item) => (
            <div
              className="ae-metric"
              key={item.label}
            >

              <div className="ae-metric-label">
                {item.label}
              </div>

              <div className="ae-metric-value">
                {item.value}
              </div>

            </div>
          ),
        )}

      </div>

      <div className="ae-dashboard-grid">

        <div className="ae-panel">

          <div className="ae-panel-heading">

            <div>

              <div className="ae-panel-title">
                Runtime execution chain
              </div>

              <div className="ae-panel-sub">
                Action lifecycle
              </div>

            </div>

            <span className="ae-chip ae-chip-blue">
              Live boundary
            </span>

          </div>

          <div className="ae-mini-flow">

            {[
              "Request",
              "Context",
              "Policy",
              "Risk",
              "Decision",
              "Execution",
              "Evidence",
            ].map(
              (item) => (
                <div
                  className="ae-mini-node"
                  key={item}
                >

                  <div className="ae-card-index">
                    Runtime
                  </div>

                  <strong>
                    {item}
                  </strong>

                </div>
              ),
            )}

          </div>

        </div>

        <div className="ae-panel">

          <div className="ae-panel-heading">

            <div>

              <div className="ae-panel-title">
                Runtime posture
              </div>

              <div className="ae-panel-sub">
                Current control surface
              </div>

            </div>

          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 8,
            }}
          >

            {[
              "Canonical identity",
              "Policy enforcement",
              "Pre-execution boundary",
              "Evidence identity",
            ].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: 10,
                    padding: 10,
                    border:
                      "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 9,
                  }}
                >

                  <span
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 7,
                      fontSize: 9,
                    }}
                  >
                    <span className="ae-status-dot" />
                    {item}
                  </span>

                  <span className="ae-chip ae-chip-blue">
                    Ready
                  </span>

                </div>
              ),
            )}

          </div>

        </div>

      </div>

      <div
        className="ae-panel"
        style={{
          marginTop: 14,
        }}
      >

        <div className="ae-panel-heading">

          <div>

            <div className="ae-panel-title">
              Control plane architecture
            </div>

            <div className="ae-panel-sub">
              Request → context → policy →
              risk → decision → execution →
              evidence
            </div>

          </div>

          <ShieldCheck size={17} />

        </div>

      </div>

    </div>
  )
}