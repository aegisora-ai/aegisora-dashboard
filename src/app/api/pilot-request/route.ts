export const runtime = "nodejs";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return Response.json({ error: "Unsupported content type." }, { status: 415 });
  }

  const ip = ((req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0] ?? "unknown").trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 20000) {
      return Response.json({ error: "Request too large." }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend success.
  if (clean(body.website, 200)) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const row = {
    full_name: clean(body.full_name, 120),
    work_email: clean(body.work_email, 200).toLowerCase(),
    company: clean(body.company, 160),
    role_title: clean(body.role_title, 120) || null,
    company_size: clean(body.company_size, 20) || null,
    environment: clean(body.environment, 2000) || null,
    use_case: clean(body.use_case, 3000),
    locale: clean(body.locale, 10) || null,
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.work_email);
  if (!row.full_name || !row.company || !row.use_case || !emailOk) {
    return Response.json({ error: "Please fill in name, a valid work email, company and goal." }, { status: 400 });
  }
  if (!(body.consent === "on" || body.consent === true)) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("pilot-request: Supabase env vars missing");
    return Response.json({ error: "Applications are temporarily unavailable. Please email us." }, { status: 503 });
  }

  try {
    const res = await fetch(url + "/rest/v1/pilot_requests", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.error("pilot-request: insert failed", res.status);
      return Response.json({ error: "Could not save your application. Please email us." }, { status: 502 });
    }
  } catch (err) {
    console.error("pilot-request: insert error", err);
    return Response.json({ error: "Could not save your application. Please email us." }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 201 });
}