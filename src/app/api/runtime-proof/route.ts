import { NextResponse } from "next/server"

const runtimeUrl =
  process.env.AEGISORA_RUNTIME_URL ??
  "http://127.0.0.1:8787"

export async function GET() {

  try {

    const response =
      await fetch(
        `${runtimeUrl}/health`,
        {
          cache: "no-store",
        },
      )

    const body =
      await response.json()

    return NextResponse.json(
      body,
      {
        status: response.status,
      },
    )

  } catch (error) {

    return NextResponse.json(
      {
        live: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 503,
      },
    )
  }
}

export async function POST(
  request: Request,
) {

  try {

    const input =
      await request.json()

    const response =
      await fetch(
        `${runtimeUrl}/enforce`,
        {
          method: "POST",
          headers: {
            "content-type":
              "application/json",
          },
          body: JSON.stringify({
            agentId:
              input.agentId ??
              "website-proof-agent",

            action:
              input.action ??
              "tool.execute",

            tool:
              input.tool,

            requiresReview:
              input.requiresReview === true,

            input:
              input.input ?? {
                source:
                  "aegisora-public-proof",
              },
          }),

          cache: "no-store",
        },
      )

    const body =
      await response.json()

    return NextResponse.json(
      {
        ...body,
        live: response.ok,
      },
      {
        status: response.status,
      },
    )

  } catch (error) {

    return NextResponse.json(
      {
        live: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 503,
      },
    )
  }
}