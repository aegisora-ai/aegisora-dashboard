"use client"

import Link from "next/link"

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

import { AegisoraFooter } from "@/components/aegisora/footer"
import { AegisoraHeader } from "@/components/aegisora/header"

type RuntimeResult = {
  live?: boolean
  decision?: string
  reason?: string
  riskScore?: number
  enforcementStatus?: string
  executionOutcome?: string
  traceId?: string
  decisionId?: string
  executionId?: string
  evidenceId?: string
}

const scenarios = [
  {
    id: "allow",
    label: "ALLOW",
    tool: "echo",
    requiresReview: false,
  },
  {
    id: "block",
    label: "BLOCK",
    tool: "shell",
    requiresReview: false,
  },
  {
    id: "escalate",
    label: "ESCALATE",
    tool: "echo",
    requiresReview: true,
  },
]

export default function ProofPage() {

  const [
    connected,
    setConnected,
  ] = useState<boolean | null>(null)

  const [
    loading,
    setLoading,
  ] = useState<string | null>(null)

  const [
    result,
    setResult,
  ] = useState<RuntimeResult | null>(null)

  useEffect(
    () => {

      fetch("/api/runtime-proof")
        .then(
          (response) => {
            setConnected(
              response.ok,
            )
          },
        )
        .catch(
          () => {
            setConnected(false)
          },
        )

    },
    [],
  )

  async function runScenario(
    scenario:
      (typeof scenarios)[number],
  ) {

    setLoading(
      scenario.id,
    )

    try {

      const response =
        await fetch(
          "/api/runtime-proof",
          {
            method: "POST",
            headers: {
              "content-type":
                "application/json",
            },

            body: JSON.stringify({
              agentId:
                "website-proof-agent",

              action:
                "tool.execute",

              tool:
                scenario.tool,

              requiresReview:
                scenario.requiresReview,

              input: {
                source:
                  "aegisora-public-proof",
              },
            }),
          },
        )

      const body =
        (await response.json()) as
          RuntimeResult & {
            error?: string
          }

      if (!response.ok) {

        throw new Error(
          body.error ??
          "Runtime request failed.",
        )
      }

      setResult(
        body,
      )

    } catch (error) {

      setResult(
        {
          live: false,
          reason:
            error instanceof Error
              ? error.message
              : "Runtime request failed.",
        },
      )

    } finally {

      setLoading(null)
    }
  }

  return (
    <div className="ae-page">

      <AegisoraHeader />

      <main>

        <section className="ae-section">

          <div className="ae-wrap">

            <div className="ae-eyebrow">
              Aegisora 3.0 live runtime proof
            </div>

            <h1 className="ae-section-title">
              Put a real action
              <br />
              through the boundary.
            </h1>

            <p className="ae-section-copy">
              This page sends a real request
              to the configured Aegisora runtime.
              It is not a visual simulation.
            </p>

            <div
              style={{
                marginTop: 22,
              }}
            >
              <span className="ae-chip ae-chip-blue">
                {connected === true
                  ? "Runtime connected"
                  : connected === false
                    ? "Runtime unavailable"
                    : "Checking runtime"}
              </span>
            </div>

          </div>

        </section>

        <section className="ae-section ae-section-white">

          <div className="ae-wrap">

            <div className="ae-proof-grid">

              {scenarios.map(
                (scenario) => (
                  <div
                    className="ae-proof-card"
                    key={scenario.id}
                  >

                    <button
                      type="button"
                      disabled={
                        loading !== null
                      }
                      onClick={
                        () =>
                          runScenario(
                            scenario,
                          )
                      }
                    >

                      <div className="ae-card-index">

                        {loading ===
                        scenario.id ? (
                          <Loader2
                            size={14}
                          />
                        ) : (
                          <CheckCircle2
                            size={14}
                          />
                        )}

                      </div>

                      <div
                        className="ae-card-title"
                        style={{
                          marginTop: 10,
                          color:
                            "#0081FB",
                        }}
                      >
                        {scenario.label}
                      </div>

                      <div
                        className="ae-card-copy"
                        style={{
                          marginTop: 10,
                        }}
                      >
                        tool = "
                        {scenario.tool}
                        "
                        <br />
                        requiresReview ={" "}
                        {String(
                          scenario.requiresReview,
                        )}
                      </div>

                    </button>

                  </div>
                ),
              )}

            </div>

          </div>

        </section>

        <section className="ae-section">

          <div className="ae-wrap">

            <div className="ae-eyebrow">
              Runtime decision artifact
            </div>

            <h2 className="ae-section-title">
              Decision.
              <br />
              Enforcement.
              <br />
              Evidence.
            </h2>

            {result ? (

              <div
                className="ae-grid-2"
                style={{
                  marginTop: 38,
                }}
              >

                <div className="ae-card">

                  <div className="ae-card-index">
                    Decision
                  </div>

                  <div
                    style={{
                      marginTop: 11,
                      color:
                        "#0081FB",
                      fontSize: 44,
                      fontWeight: 950,
                      letterSpacing:
                        "-0.05em",
                    }}
                  >
                    {result.decision ??
                      "ERROR"}
                  </div>

                  <div className="ae-card-copy">
                    {result.reason ??
                      "No reason returned."}
                  </div>

                </div>

                <div className="ae-card">

                  <div className="ae-card-index">
                    Evidence identity
                  </div>

                  <div
                    style={{
                      marginTop: 17,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 9,
                      lineHeight: 2,
                    }}
                  >
                    traceId:
                    {" "}
                    {result.traceId}
                    <br />
                    decisionId:
                    {" "}
                    {result.decisionId}
                    <br />
                    executionId:
                    {" "}
                    {result.executionId}
                    <br />
                    evidenceId:
                    {" "}
                    {result.evidenceId}
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <Link
                      href="/evidence"
                      className="ae-button ae-button-primary"
                    >
                      Evidence model
                      <ArrowRight
                        size={13}
                      />
                    </Link>
                  </div>

                </div>

              </div>

            ) : (

              <div
                className="ae-card"
                style={{
                  marginTop: 30,
                }}
              >
                <div className="ae-card-index">
                  READY
                </div>

                <div
                  className="ae-card-title"
                  style={{
                    marginTop: 10,
                  }}
                >
                  Select a runtime scenario.
                </div>
              </div>

            )}

          </div>

        </section>

      </main>

      <AegisoraFooter />

    </div>
  )
}