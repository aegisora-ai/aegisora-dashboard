import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AERI_INSTRUCTIONS = [
  "You are Aeri, the AI assistant built into Aegisora, an AI-agent runtime security and governance platform.",
  "Speak naturally, clearly, calmly, and concisely. Be friendly without being overfamiliar.",
  "Help explain agent runtime security, policy decisions, risk, execution evidence, and audit concepts.",
  "Do not claim to have inspected Aegisora workspace data unless a trusted server-side tool explicitly provides it.",
  "Do not invent policy results, audit evidence, security events, customers, or metrics.",
  "You cannot change policies, execute actions, approve requests, or bypass enforcement from conversation alone.",
  "For sensitive actions, require the application's explicit authorization and confirmation flow.",
  "When uncertain, say so plainly and recommend checking the relevant evidence in Aegisora.",
].join(" ");

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Aeri voice is not available." }, { status: 503 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Aeri voice is not available." }, { status: 503 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Some render contexts disallow cookie writes; auth is still verified below.
          }
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to Aegisora before starting an Aeri voice session." }, { status: 401 });
    }

    const safetyIdentifier = createHash("sha256").update(user.id).digest("hex");
    const config = {
      session: {
        type: "realtime",
        model: process.env.AERI_REALTIME_MODEL || "gpt-realtime-2.1",
        instructions: AERI_INSTRUCTIONS,
        audio: {
          input: { transcription: { model: "gpt-4o-mini-transcribe" } },
          output: { voice: process.env.AERI_REALTIME_VOICE || "marin" },
        },
      },
    };

    const openAIResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": safetyIdentifier,
      },
      body: JSON.stringify(config),
      cache: "no-store",
    });

    const data = await openAIResponse.json().catch(() => ({})) as { value?: string; expires_at?: number; client_secret?: { value?: string; expires_at?: number } };
    if (!openAIResponse.ok) {
      console.error("Aeri Realtime client-secret request failed", { status: openAIResponse.status });
      return NextResponse.json({ error: "The voice provider could not create a session. Verify API access, model availability, and billing." }, { status: 502 });
    }

    const value = data.value ?? data.client_secret?.value;
    if (!value) {
      return NextResponse.json({ error: "The voice provider did not return a temporary session credential." }, { status: 502 });
    }

    return NextResponse.json({ value, expires_at: data.expires_at ?? data.client_secret?.expires_at }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Aeri session initialization failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "Aeri could not initialize the voice session. Check the server logs." }, { status: 500 });
  }
}
