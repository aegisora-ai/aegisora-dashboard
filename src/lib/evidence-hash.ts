import { createHash } from 'crypto';

export function canonicalize(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

export type EvidenceHashInput = {
  workspace_id: string;
  seq: number;
  decision_id: string;
  execution_id?: string | null;
  agent_id?: string | null;
  action: string;
  decision: string;
  trace_id: string;
  payload: unknown;
  prev_hash: string;
};

export function computeEvidenceHash(r: EvidenceHashInput): string {
  const material = canonicalize({
    workspace_id: r.workspace_id,
    seq: r.seq,
    decision_id: r.decision_id,
    execution_id: r.execution_id ?? null,
    agent_id: r.agent_id ?? null,
    action: r.action,
    decision: r.decision,
    trace_id: r.trace_id,
    payload: r.payload ?? null,
    prev_hash: r.prev_hash,
  });
  return createHash('sha256').update(material).digest('hex');
}

export function verifyChain(records: (EvidenceHashInput & { hash: string })[]) {
  const sorted = [...records].sort((a, b) => a.seq - b.seq);
  const broken: { seq: number; reason: string }[] = [];
  let prev = 'GENESIS';
  for (const r of sorted) {
    if (r.prev_hash !== prev) broken.push({ seq: r.seq, reason: 'prev_hash mismatch' });
    else if (computeEvidenceHash(r) !== r.hash) broken.push({ seq: r.seq, reason: 'hash mismatch' });
    prev = r.hash;
  }
  return { total: sorted.length, broken: broken.length, details: broken };
}
