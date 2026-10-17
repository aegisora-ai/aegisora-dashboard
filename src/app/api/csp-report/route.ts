import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const text = (await request.text()).slice(0, 4000);
    console.warn("[csp-report]", text);
  } catch {
    // ignore malformed reports
  }
  return new NextResponse(null, { status: 204 });
}