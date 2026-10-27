import { createHash } from "node:crypto";

// Mirrors public.evidence_hash_v2 (supabase/migrations/20261013000000_evidence_verification_functions.sql):
// sha256 over concat_ws('|', 'v2', f(prev_hash), f(workspace_id), f(seq), f(id), f(decision_id), f(action),
// f(decision), f(trace_id), f(created_at_utc), f(payload_text)) where f(v) = '~' for null, else <utf8 byte length>:<v>.
export type EvidenceRecordV2 = {
  seq: number;
  id: string;
  workspace_id: string;
  decision_id: string;
  action: string;
  decision: string;
  trace_id: string;
  prev_hash: string;
  hash: string;
  hash_version: number;
  created_at_utc: string;
  payload_text: string;
};

const f = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return "~";
  const s = String(v);
  return Buffer.byteLength(s, "utf8") + ":" + s;
};

export function hashV2(r: Omit<EvidenceRecordV2, "hash">): string {
  const material = ["v2", f(r.prev_hash), f(r.workspace_id), f(r.seq), f(r.id), f(r.decision_id), f(r.action), f(r.decision), f(r.trace_id), f(r.created_at_utc), f(r.payload_text)].join("|");
  return createHash("sha256").update(material, "utf8").digest("hex");
}

export function buildRecord(r: Omit<EvidenceRecordV2, "hash" | "hash_version">): EvidenceRecordV2 {
  const base = { ...r, hash_version: 2 };
  return { ...base, hash: hashV2(base) };
}

/** Same checks as evidence_verify_core: link to the previous stored hash, contiguous seq, recomputed hash. */
export function verifyV2(records: EvidenceRecordV2[]): { total: number; broken: number; details: { seq: number; reason: string }[] } {
  const sorted = [...records].sort((a, b) => a.seq - b.seq);
  const details: { seq: number; reason: string }[] = [];
  let prev: string | null = null;
  sorted.forEach((r, i) => {
    const why: string[] = [];
    if (r.prev_hash !== (prev ?? "GENESIS")) why.push("prev_hash mismatch");
    if (r.seq !== i + 1) why.push("sequence gap");
    if (r.hash_version !== 2) why.push("unsupported hash_version");
    else if (hashV2(r) !== r.hash) why.push("hash mismatch");
    if (why.length) details.push({ seq: r.seq, reason: why.join(", ") });
    prev = r.hash;
  });
  return { total: sorted.length, broken: details.length, details };
}

/** Microsecond UTC stamp in the format the database hashes: YYYY-MM-DDTHH:MM:SS.UUUUUUZ */
export const utcStamp = (d: Date = new Date()): string => d.toISOString().replace("Z", "000Z");

/** Text form of a jsonb value (keys ordered by length, then bytes; ", " and ": " separators). Finite numbers only. */
export function pgJsonbText(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return "[" + v.map(pgJsonbText).join(", ") + "]";
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).filter((k) => o[k] !== undefined).sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
  return "{" + keys.map((k) => JSON.stringify(k) + ": " + pgJsonbText(o[k])).join(", ") + "}";
}