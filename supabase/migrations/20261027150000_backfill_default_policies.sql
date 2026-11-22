do $$
declare w record;
begin
  for w in
    select id from public.workspaces ws
    where not exists (select 1 from public.policies p where p.workspace_id = ws.id)
  loop
    insert into public.policies
      (workspace_id, name, scope, decision, mode, enabled, version, conditions, metadata, action_pattern, priority)
    values
      (w.id, 'Finance: approve payments',         'workspace', 'ESCALATE', 'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, 'payments.*',  10),
      (w.id, 'Finance: approve transfers',        'workspace', 'ESCALATE', 'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, 'transfers.*', 20),
      (w.id, 'Finance: approve refunds',          'workspace', 'ESCALATE', 'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, 'refunds.*',   30),
      (w.id, 'Finance: block secrets access',     'workspace', 'BLOCK',    'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, 'secrets.*',   40),
      (w.id, 'Finance: allow reads',              'workspace', 'ALLOW',    'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, '*.read',     100),
      (w.id, 'Finance: allow read-style actions', 'workspace', 'ALLOW',    'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, '*.read_*',  110);
  end loop;
end $$;
