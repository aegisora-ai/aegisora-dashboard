-- Record who initiated an escalation so approvers can be checked against requesters.
alter table public.approvals
  add column if not exists requested_by_key_id uuid,
  add column if not exists requested_by_user uuid references auth.users(id);

-- Per-workspace separation of duties switch (off by default).
alter table public.workspace_settings
  add column if not exists require_separate_approver boolean not null default false;
