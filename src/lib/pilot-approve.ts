import { createHmac, timingSafeEqual } from "node:crypto";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const LINK_TTL_SECONDS = 7 * 24 * 60 * 60;

function sign(id: string, exp: number): string {
  const secret = process.env.APPROVE_SECRET ?? "";
  return createHmac("sha256", secret).update("pilot-approve:" + id + ":" + exp).digest("hex");
}

export function verify(id: string, t: string, exp: string): boolean {
  if (!process.env.APPROVE_SECRET || !UUID_RE.test(id)) return false;
  if (!/^\d{1,12}$/.test(exp)) return false;
  const e = Number(exp);
  if (e < Math.floor(Date.now() / 1000)) return false;
  const a = Buffer.from(sign(id, e));
  const b = Buffer.from(t);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function approveUrl(id: string): string | null {
  if (!process.env.APPROVE_SECRET || !UUID_RE.test(id)) return null;
  const base = process.env.SITE_URL || "https://aegisora.org";
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  return base + "/api/pilot-approve?id=" + id + "&exp=" + exp + "&t=" + sign(id, exp);
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