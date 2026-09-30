-- 003: core governance data model

create or replace function public.is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid());
$$;

create or replace function public.has_role(ws uuid, roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid() and m.role::text = any(roles));
$$;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  framework text,
  external_id text,
  source text not null default 'manual' check (source in ('manual','auto','import')),
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISABLED','SUSPENDED')),
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null unique,
  created_by uuid references auth.users(id),
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  agent_id uuid references public.agents(id) on delete cascade,
  action_pattern text not null default '*',
  resource_pattern text not null default '*',
  decision text not null check (decision in ('ALLOW','BLOCK','ESCALATE')),
  priority int not null default 100,
  enabled boolean not null default true,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  agent_name text not null,
  action text not null,
  resource text not null default '',
  decision text not null check (decision in ('ALLOW','BLOCK','ESCALATE')),
  reason text,
  policy_id uuid references public.policies(id) on delete set null,
  risk_score int not null default 0,
  trace_id text,
  input jsonb,
  created_at timestamptz not null default now()
);
create index if not exists decisions_ws_created on public.decisions (workspace_id, created_at desc);

-- Evaluation records are created only by trusted server-side routes.
create table if not exists public.executions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  action text not null,
  decision text not null check (decision in ('ALLOW','BLOCK','ESCALATE')),
  trace_id text,
  risk_score int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists executions_ws_created on public.executions (workspace_id, created_at desc);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  decision_id uuid not null references public.decisions(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  agent_name text,
  action text,
  resource text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  note text,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  decision_id uuid references public.decisions(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  title text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  seq bigint not null,
  decision_id uuid,
  execution_id uuid references public.executions(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  trace_id text,
  action text,
  decision text check (decision is null or decision in ('ALLOW','BLOCK','ESCALATE')),
  payload jsonb not null,
  prev_hash text not null,
  hash text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, seq)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor text not null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_ws_created on public.audit_events (workspace_id, created_at desc);

create table if not exists public.traces (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  agent_name text,
  trace_id text not null,
  name text,
  decision_id uuid,
  status text not null default 'ok',
  duration_ms int,
  spans jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists traces_ws_created on public.traces (workspace_id, created_at desc);

create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  url text not null check (url ~ '^https://'),
  events text[] not null default array['decision.block','decision.escalate'],
  secret text not null,
  enabled boolean not null default true,
  last_status int,
  last_delivery_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  default_effect text not null default 'BLOCK' check (default_effect in ('ALLOW','BLOCK','ESCALATE')),
  auto_register_agents boolean not null default true,
  approval_expiry_hours int not null default 24 check (approval_expiry_hours between 1 and 720),
  alert_on_block boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- evidence: hash chain, append-only ----------
create or replace function public.evidence_chain() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare prev_seq bigint; prev text;
begin
  perform pg_advisory_xact_lock(hashtext(new.workspace_id::text));
  select e.seq, e.hash into prev_seq, prev from public.evidence e
    where e.workspace_id = new.workspace_id order by e.seq desc limit 1;
  new.seq := coalesce(prev_seq, 0) + 1;
  new.prev_hash := coalesce(prev, 'GENESIS');
  new.hash := encode(digest(new.prev_hash || '|' || new.id::text || '|' || coalesce(new.decision_id::text, '') || '|' || new.payload::text, 'sha256'), 'hex');
  return new;
end $$;
drop trigger if exists evidence_chain_trg on public.evidence;
create trigger evidence_chain_trg before insert on public.evidence for each row execute function public.evidence_chain();

create or replace function public.evidence_immutable() returns trigger language plpgsql as $$
begin raise exception 'evidence is append-only'; end $$;
drop trigger if exists evidence_immutable_trg on public.evidence;
create trigger evidence_immutable_trg before update or delete on public.evidence for each row execute function public.evidence_immutable();

create or replace function public.verify_evidence_chain(ws uuid)
returns table(total bigint, broken bigint)
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  if not public.is_member(ws) then raise exception 'forbidden'; end if;
  return query
  with o as (
    select e.*, lag(e.hash) over (order by e.seq) as exp_prev from public.evidence e where e.workspace_id = ws
  )
  select count(*)::bigint,
    (count(*) filter (where o.prev_hash is distinct from coalesce(o.exp_prev, 'GENESIS')
      or o.hash is distinct from encode(digest(o.prev_hash || '|' || o.id::text || '|' || coalesce(o.decision_id::text, '') || '|' || o.payload::text, 'sha256'), 'hex')))::bigint
  from o;
end $$;

-- ---------- api keys (plaintext shown once, only SHA-256 stored) ----------
create or replace function public.create_api_key(ws uuid, key_name text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare raw text;
begin
  if not public.has_role(ws, array['owner','admin','developer']) then raise exception 'forbidden'; end if;
  raw := 'aeg_live_' || encode(gen_random_bytes(24), 'hex');
  insert into public.api_keys (workspace_id, name, prefix, key_hash, created_by)
  values (ws, coalesce(nullif(btrim(key_name), ''), 'default'), substr(raw, 1, 13), encode(digest(raw, 'sha256'), 'hex'), auth.uid());
  return raw;
end $$;

-- ---------- approvals: stamp resolver ----------
create or replace function public.approval_stamp() returns trigger language plpgsql as $$
begin
  if new.status in ('approved','rejected') and old.status = 'pending' then
    new.resolved_by := auth.uid();
    new.resolved_at := now();
  end if;
  return new;
end $$;
drop trigger if exists approval_stamp_trg on public.approvals;
create trigger approval_stamp_trg before update on public.approvals for each row execute function public.approval_stamp();

-- ---------- automatic audit trail for console changes ----------
create or replace function public.audit_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws uuid; rid uuid;
begin
  if tg_op = 'DELETE' then
    ws := old.workspace_id;
    rid := old.id;
  else
    ws := new.workspace_id;
    rid := new.id;
  end if;

  -- During ON DELETE CASCADE from a workspace, the parent workspace row
  -- may already be absent when child DELETE triggers fire. Do not create
  -- an audit row with a dangling workspace_id in that cleanup path.
  if ws is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.workspaces
    where id = ws
  ) then
    return null;
  end if;

  insert into public.audit_events (
    workspace_id,
    actor,
    action,
    target_type,
    target_id
  )
  values (
    ws,
    coalesce(auth.uid()::text, 'system'),
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    rid::text
  );

  return null;
end $$;
do $$
declare t text;
begin
  foreach t in array array['agents','policies','webhooks','approvals','incidents','api_keys'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_audit_trg', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_change()', t || '_audit_trg', t);
  end loop;
end $$;

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array['agents','api_keys','policies','decisions','approvals','incidents','evidence','audit_events','traces','webhooks','workspace_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    if t in ('api_keys','webhooks') then
      execute format('create policy %I on public.%I for select using (public.has_role(workspace_id, array[''owner'',''admin'',''developer'']))', t || '_select', t);
    else
      execute format('create policy %I on public.%I for select using (public.is_member(workspace_id))', t || '_select', t);
    end if;
  end loop;
end $$;

drop policy if exists agents_write on public.agents;
create policy agents_write on public.agents for all
  using (public.has_role(workspace_id, array['owner','admin','developer']))
  with check (public.has_role(workspace_id, array['owner','admin','developer']));

drop policy if exists policies_write on public.policies;
create policy policies_write on public.policies for all
  using (public.has_role(workspace_id, array['owner','admin','developer']))
  with check (public.has_role(workspace_id, array['owner','admin','developer']));

drop policy if exists webhooks_write on public.webhooks;
create policy webhooks_write on public.webhooks for all
  using (public.has_role(workspace_id, array['owner','admin']))
  with check (public.has_role(workspace_id, array['owner','admin']));

drop policy if exists settings_write on public.workspace_settings;
create policy settings_write on public.workspace_settings for all
  using (public.has_role(workspace_id, array['owner','admin']))
  with check (public.has_role(workspace_id, array['owner','admin']));

drop policy if exists approvals_resolve on public.approvals;
create policy approvals_resolve on public.approvals for update
  using (public.has_role(workspace_id, array['owner','admin','analyst']))
  with check (public.has_role(workspace_id, array['owner','admin','analyst']));

drop policy if exists incidents_resolve on public.incidents;
create policy incidents_resolve on public.incidents for update
  using (public.has_role(workspace_id, array['owner','admin','analyst']))
  with check (public.has_role(workspace_id, array['owner','admin','analyst']));

drop policy if exists api_keys_revoke on public.api_keys;
create policy api_keys_revoke on public.api_keys for update
  using (public.has_role(workspace_id, array['owner','admin']))
  with check (public.has_role(workspace_id, array['owner','admin']));

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces for update
  using (public.has_role(id, array['owner','admin']))
  with check (public.has_role(id, array['owner','admin']));

revoke update on public.approvals from authenticated;
grant update (status, note) on public.approvals to authenticated;
revoke update on public.incidents from authenticated;
grant update (status, resolved_at) on public.incidents to authenticated;
revoke update on public.api_keys from authenticated;
grant update (revoked_at) on public.api_keys to authenticated;

-- ---------- realtime ----------
do $$
begin
  alter publication supabase_realtime add table public.decisions;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table public.approvals;
exception when duplicate_object then null; end $$;
do $$
begin
  alter publication supabase_realtime add table public.incidents;
exception when duplicate_object then null; end $$;
