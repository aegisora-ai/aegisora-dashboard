insert into public.policies
  (workspace_id, name, scope, decision, mode, enabled, version, conditions, metadata, action_pattern, priority)
select
  '077e6bf1-8473-4570-9bfb-cf4196cbebb6', 'Finance: allow read-style actions', 'workspace',
  'ALLOW', 'ENFORCED', true, 1, '[]'::jsonb, '{}'::jsonb, '*.read_*', 110
where not exists (
  select 1 from public.policies
  where workspace_id = '077e6bf1-8473-4570-9bfb-cf4196cbebb6'
    and name = 'Finance: allow read-style actions'
);
