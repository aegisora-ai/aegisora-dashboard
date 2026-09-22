import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function runtimeBaseUrl() {
  return (
    process.env.AEGISORA_PROOF_RUNTIME_URL?.trim() ||
    "http://127.0.0.1:8787"
  ).replace(/\/+$/, "");
}

export async function GET() {
  const base = runtimeBaseUrl();

  try {
    const response = await fetch(`${base}/health`, {
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        ...data,
        live: response.ok,
        source: base.startsWith("http://127.0.0.1")
          ? "local-aegisora-runtime"
          : "configured-aegisora-runtime",
      },
      { status: response.ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      {
        live: false,
        error: "Aegisora runtime is not reachable.",
      },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const base = runtimeBaseUrl();

  try {
    const body = await request.json();

    const response = await fetch(`${base}/enforce`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        ...data,
        live: response.ok || Boolean(data?.decision),
        source: base.startsWith("http://127.0.0.1")
          ? "local-aegisora-runtime"
          : "configured-aegisora-runtime",
      },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      {
        live: false,
        error: "Aegisora runtime is not reachable.",
      },
      { status: 503 },
    );
  }
}
