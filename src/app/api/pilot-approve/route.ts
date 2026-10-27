import { UUID_RE, esc, verify } from "../../../lib/pilot-approve";

export const runtime = "nodejs";

function page(title: string, body: string, status = 200): Response {
  const html =
    "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<meta name=\"robots\" content=\"noindex\"><title>" + esc(title) + "</title></head>" +
    "<body style=\"font-family:Arial,sans-serif;background:#0b1224;color:#fff;display:flex;justify-content:center;padding:48px 16px\">" +
    "<div style=\"max-width:460px;width:100%;background:#141b33;border-radius:16px;padding:28px\">" +
    "<h2 style=\"margin-top:0\">" + esc(title) + "</h2>" + body + "</div></body></html>";
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

function supa(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  const t = u.searchParams.get("t") ?? "";
  if (!verify(id, t)) return page("Invalid link", "<p>This approval link is not valid.</p>", 403);
  const s = supa();
  if (!s) return page("Unavailable", "<p>Server is not configured.</p>", 503);

  const res = await fetch(
    s.url + "/rest/v1/pilot_requests?id=eq." + id + "&select=company,full_name,work_email,status",
    { headers: { apikey: s.key, Authorization: "Bearer " + s.key } },
  );
  const rows: unknown = res.ok ? await res.json() : null;
  const r = Array.isArray(rows) ? rows[0] : null;
  if (!r) return page("Not found", "<p>Application not found.</p>", 404);

  const info =
    "<p><b>" + esc(String(r.company)) + "</b><br>" + esc(String(r.full_name)) + "<br>" + esc(String(r.work_email)) + "</p>";
  if (r.status === "approved") return page("Already approved", info);

  const form =
    "<form method=\"post\" action=\"/api/pilot-approve\">" +
    "<input type=\"hidden\" name=\"id\" value=\"" + esc(id) + "\">" +
    "<input type=\"hidden\" name=\"t\" value=\"" + esc(t) + "\">" +
    "<button type=\"submit\" style=\"background:#1a8cff;color:#fff;border:0;border-radius:999px;padding:12px 26px;font-size:16px;font-weight:bold;cursor:pointer\">Approve</button></form>";
  return page("Approve this application?", info + form);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const t = String(form.get("t") ?? "");
  if (!UUID_RE.test(id) || !verify(id, t)) return page("Invalid link", "<p>This approval link is not valid.</p>", 403);
  const s = supa();
  if (!s) return page("Unavailable", "<p>Server is not configured.</p>", 503);

  const res = await fetch(s.url + "/rest/v1/pilot_requests?id=eq." + id, {
    method: "PATCH",
    headers: {
      apikey: s.key,
      Authorization: "Bearer " + s.key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status: "approved", reviewed_at: new Date().toISOString() }),
  });
  if (!res.ok) {
    console.error("pilot-approve: update failed", res.status);
    return page("Error", "<p>Could not approve. Try again or use Supabase.</p>", 502);
  }
  const rows: unknown = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return page("Not found", "<p>Application not found.</p>", 404);
  return page("Approved", "<p><b>" + esc(String(rows[0].company)) + "</b> is now approved.</p>");
}