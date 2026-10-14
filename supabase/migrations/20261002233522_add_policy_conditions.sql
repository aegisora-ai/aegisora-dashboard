-- conditionsMet() (src/lib/aegisora/policy-evaluator.ts) policies.conditions sütununu
-- okuyor ama bu sütun hiç tanımlanmamıştı. evaluate/route.ts artık bu alanı select
-- ediyor, sütun yoksa sorgu patlar. JSONB, nullable, geriye dönük uyumlu (null = koşulsuz).
alter table public.policies
  add column if not exists conditions jsonb;

comment on column public.policies.conditions is
  'Array of {field, op, value} objects, AND''ed together. field: "risk" or "input.<path>". op: eq|neq|gt|gte|lt|lte|in. Null/empty = no extra condition (policy always matches on pattern). See conditionsMet() in policy-evaluator.ts for fail-closed semantics on malformed conditions.';