import { createHmac, timingSafeEqual } from "node:crypto";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sign(id: string): string {
  const secret = process.env.APPROVE_SECRET ?? "";
  return createHmac("sha256", secret).update("pilot-approve:" + id).digest("hex");
}

export function verify(id: string, t: string): boolean {
  if (!process.env.APPROVE_SECRET || !UUID_RE.test(id)) return false;
  const a = Buffer.from(sign(id));
  const b = Buffer.from(t);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function approveUrl(id: string): string | null {
  if (!process.env.APPROVE_SECRET || !UUID_RE.test(id)) return null;
  const base = process.env.SITE_URL || "https://aegisora.org";
  return base + "/api/pilot-approve?id=" + id + "&t=" + sign(id);
}

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function logFetch(u: string, i: RequestInit): Promise<Response> {
  const r = await fetch(u, i);
  if (!r.ok) console.error("pilot-request: resend failed", r.status, await r.text());
  return r;
}