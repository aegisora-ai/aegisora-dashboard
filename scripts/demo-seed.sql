begin;

create temp table _ctx(ws uuid, uid uuid);

do $$
declare v_uid uuid; v_cnt int; v_ws uuid; v_names text;
begin
  select id into v_uid from auth.users where lower(email) = 'ozereray44@gmail.com';
  if v_uid is null then raise exception 'Kullanici bulunamadi: ozereray44@gmail.com'; end if;

  select count(*), string_agg(w.name || ' (' || w.slug || ')', ', '), min(w.id::text)::uuid
    into v_cnt, v_names, v_ws
  from public.workspaces w
  join public.workspace_members m on m.workspace_id = w.id
  where m.user_id = v_uid and upper(m.role::text) = 'OWNER'
    and (nullif('aegisora-bot-382864','') is null or w.slug = 'aegisora-bot-382864');

  if v_cnt = 0 then raise exception 'Bu kullanicinin sahibi oldugu workspace yok.'; end if;
  if v_cnt > 1 then raise exception 'Birden fazla workspace var: %. PowerShell basindaki $slug degiskenine birini yaz.', v_names; end if;

  insert into _ctx values (v_ws, v_uid);
  if nullif('','') is not null then
    update public.workspaces set name = '' where id = v_ws;
  end if;
end $$;

-- ---------- yedek ----------
do $$
declare s text := 'aeg_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS'); t text; w uuid := (select ws from _ctx);
begin
  execute format('create schema %I', s);
  foreach t in array array['agents','policies','decisions','approvals','incidents','evidence','audit_events','traces','webhooks'] loop
    execute format('create table %I.%I as select * from public.%I where workspace_id = %L', s, t, t, w);
  end loop;
end $$;

-- ---------- tetikleyicileri gecici kapat ----------
alter table public.agents disable trigger user;
alter table public.policies disable trigger user;
alter table public.webhooks disable trigger user;
alter table public.approvals disable trigger user;
alter table public.incidents disable trigger user;
do $$
declare r record;
begin
  if not exists (select 1 from pg_trigger where tgrelid = 'public.evidence'::regclass and tgname = 'evidence_chain_trg' and not tgisinternal) then
    raise exception 'evidence_chain_trg yok: hash zinciri tetikleyicisi eksik. Hicbir sey degismedi.';
  end if;
  for r in
    select t.tgname from pg_trigger t join pg_proc p on p.oid = t.tgfoid
    where t.tgrelid = 'public.evidence'::regclass and not t.tgisinternal and p.proname in ('evidence_immutable','evidence_guard')
  loop
    execute format('alter table public.evidence disable trigger %I', r.tgname);
  end loop;
end $$;

-- ---------- eski veriyi sil (sadece bu workspace) ----------
delete from public.approvals    where workspace_id = (select ws from _ctx);
delete from public.incidents    where workspace_id = (select ws from _ctx);
delete from public.traces       where workspace_id = (select ws from _ctx);
delete from public.evidence     where workspace_id = (select ws from _ctx);
delete from public.decisions    where workspace_id = (select ws from _ctx);
delete from public.audit_events where workspace_id = (select ws from _ctx);
delete from public.policies     where workspace_id = (select ws from _ctx);
delete from public.agents       where workspace_id = (select ws from _ctx);
delete from public.webhooks     where workspace_id = (select ws from _ctx);

do $$
declare r record;
begin
  for r in
    select t.tgname from pg_trigger t join pg_proc p on p.oid = t.tgfoid
    where t.tgrelid = 'public.evidence'::regclass and not t.tgisinternal and p.proname in ('evidence_immutable','evidence_guard')
  loop
    execute format('alter table public.evidence enable trigger %I', r.tgname);
  end loop;
end $$;

-- ---------- agents ----------
insert into public.agents (workspace_id, name, description, framework, source, status, metadata, last_seen_at, created_at)
select (select ws from _ctx), v.name, v.descr, v.fw, v.src, v.st, '{"seed":"aegisora-demo"}'::jsonb, now() - v.seen, now() - v.age
from (values
  ('support-agent',      'Answers customer tickets and looks up account context', 'LangChain',        'import', 'active',    interval '3 minutes',  interval '42 days'),
  ('sales-agent',        'Prepares account briefs and updates opportunities',     'CrewAI',           'import', 'active',    interval '11 minutes', interval '39 days'),
  ('hr-agent',           'Handles HR requests and employee document exports',     'AutoGen',          'manual', 'active',    interval '27 minutes', interval '38 days'),
  ('billing-agent',      'Processes refunds and billing corrections',             'OpenAI Agents SDK','manual', 'active',    interval '6 minutes',  interval '36 days'),
  ('finance-agent',      'Drafts invoices and reconciles payments',               'LlamaIndex',       'manual', 'active',    interval '42 minutes', interval '35 days'),
  ('devops-agent',       'Runs deployments and infrastructure changes',           'Custom',           'auto',   'active',    interval '9 minutes',  interval '34 days'),
  ('data-analyst-agent', 'Runs read-only analytics queries',                      'LangChain',        'import', 'active',    interval '1 hour',     interval '33 days'),
  ('procurement-agent',  'Compares vendors and updates purchase records',         'CrewAI',           'manual', 'active',    interval '2 hours',    interval '32 days'),
  ('legal-review-agent', 'Reviews contract drafts and clauses',                   'OpenAI Agents SDK','manual', 'active',    interval '3 hours',    interval '31 days'),
  ('legacy-report-agent','Generates scheduled reports (retired)',                 'Custom',           'manual', 'suspended', interval '6 days',     interval '45 days')
) as v(name, descr, fw, src, st, seen, age);

-- ---------- policies ----------
insert into public.policies (workspace_id, name, description, action_pattern, resource_pattern, effect, priority, enabled, version, created_at)
select (select ws from _ctx), v.name, v.descr, v.ap, v.rp, v.eff, v.pr, v.en, 1 + floor(random()*3)::int,
       now() - interval '41 days' + (row_number() over ()) * interval '6 hours'
from (values
  ('Block bulk customer deletion',          'Bulk deletes of customer records are never allowed.',        'customers.delete*',   '*',             'BLOCK',    10,  true),
  ('Block production database writes',      'Agents may not write to production databases directly.',     'db.write',            'prod/*',        'BLOCK',    10,  true),
  ('Block secrets access outside devops',   'Secret reads are limited to the devops scope.',              'secrets.read',        '*',             'BLOCK',    20,  true),
  ('Block external email with attachments', 'No attachments leave the company by agent email.',           'email.send_external', 'attachment:*',  'BLOCK',    30,  true),
  ('Escalate sensitive file exports',       'HR and finance exports need a person to approve.',           'files.export',        'hr/*',          'ESCALATE', 40,  true),
  ('Escalate refunds above limit',          'Refunds above the automatic limit wait for approval.',       'payments.refund',     'high-value/*',  'ESCALATE', 40,  true),
  ('Escalate infrastructure changes',       'Production infrastructure changes need approval.',           'infra.apply',         'production/*',  'ESCALATE', 50,  true),
  ('Escalate contract signing',             'Signing a contract always requires a person.',               'contracts.sign',      '*',             'ESCALATE', 50,  true),
  ('Escalate vendor payment changes',       'Bank detail changes for vendors need approval.',             'vendors.update_bank', '*',             'ESCALATE', 50,  true),
  ('Allow CRM read access',                 'Read access to CRM records is allowed.',                     'crm.read*',           '*',             'ALLOW',    100, true),
  ('Allow ticket handling',                 'Agents may read and reply to support tickets.',              'tickets.*',           '*',             'ALLOW',    100, true),
  ('Allow read-only analytics',             'Read-only queries on approved datasets.',                    'analytics.query',     '*',             'ALLOW',    100, true),
  ('Allow knowledge base search',           'Searching internal knowledge is allowed.',                   'kb.search',           '*',             'ALLOW',    100, true),
  ('Allow staging deployments',             'Deployments to staging are allowed.',                        'deploy.staging',      'staging/*',     'ALLOW',    100, true),
  ('Allow invoice drafting',                'Invoices may be drafted but not paid.',                      'invoices.draft',      '*',             'ALLOW',    100, true),
  ('Allow legacy report export',            'Retired rule for the old reporting agent.',                  'reports.export',      '*',             'ALLOW',    100, false)
) as v(name, descr, ap, rp, eff, pr, en);

-- ---------- webhooks ----------
insert into public.webhooks (workspace_id, url, events, secret, enabled, last_status, last_delivery_at, created_at)
select (select ws from _ctx), v.url, v.ev, 'whsec_' || md5(random()::text), true, 200, now() - v.ago, now() - interval '30 days'
from (values
  ('https://hooks.acme-security.example/aegisora/alerts', array['decision.block','decision.escalate'], interval '14 minutes'),
  ('https://hooks.acme-compliance.example/aegisora/blocks', array['decision.block'],                  interval '2 hours')
) as v(url, ev, ago);

-- ---------- karar katalogu ----------
create temp table _cat(agent text, action text, resource text, effect text, policy text, reason text, lo int, hi int, w int);
insert into _cat values
 ('support-agent',     'crm.read_ticket',       'ticket/#',                       'ALLOW',    'Allow CRM read access',                 'Read access within policy',                     4, 18, 14),
 ('support-agent',     'tickets.reply',         'ticket/#',                       'ALLOW',    'Allow ticket handling',                 'Reply drafted from approved template',          6, 22, 12),
 ('support-agent',     'kb.search',             'kb/articles',                    'ALLOW',    'Allow knowledge base search',           'Read-only search',                              2, 10, 10),
 ('sales-agent',       'crm.read_account',      'account/#',                      'ALLOW',    'Allow CRM read access',                 'Read access within policy',                     5, 20,  9),
 ('data-analyst-agent','analytics.query',       'warehouse/events',               'ALLOW',    'Allow read-only analytics',             'Read-only query on approved dataset',           8, 26, 10),
 ('devops-agent',      'deploy.staging',        'staging/api',                    'ALLOW',    'Allow staging deployments',             'Staging deployment within policy',             10, 28,  6),
 ('finance-agent',     'invoices.draft',        'invoice/#',                      'ALLOW',    'Allow invoice drafting',                'Draft only, no payment issued',                 8, 24,  7),
 ('legal-review-agent','kb.search',             'contracts/templates',            'ALLOW',    'Allow knowledge base search',           'Read-only search',                              3, 12,  5),
 ('procurement-agent', 'analytics.query',       'warehouse/spend',                'ALLOW',    'Allow read-only analytics',             'Read-only query on approved dataset',           8, 24,  4),
 ('billing-agent',     'crm.read_account',      'account/#',                      'ALLOW',    'Allow CRM read access',                 'Read access within policy',                     5, 18,  5),
 ('hr-agent',          'files.export',          'hr/salary.csv',                  'ESCALATE', 'Escalate sensitive file exports',       'Needs a person to approve',                    55, 78,  2),
 ('hr-agent',          'files.export',          'hr/performance-reviews.xlsx',    'ESCALATE', 'Escalate sensitive file exports',       'Needs a person to approve',                    52, 74,  2),
 ('billing-agent',     'payments.refund',       'high-value/#',                   'ESCALATE', 'Escalate refunds above limit',          'Refund exceeds the automatic limit',           50, 72,  3),
 ('devops-agent',      'infra.apply',           'production/eu-central',          'ESCALATE', 'Escalate infrastructure changes',       'Production change requires approval',          60, 82,  2),
 ('legal-review-agent','contracts.sign',        'contract/#',                     'ESCALATE', 'Escalate contract signing',             'Signature requires a person',                  58, 76,  1),
 ('procurement-agent', 'vendors.update_bank',   'vendor/#',                       'ESCALATE', 'Escalate vendor payment changes',       'Bank detail change requires approval',         65, 85,  1),
 ('billing-agent',     'customers.delete_bulk', 'customers/*',                    'BLOCK',    'Block bulk customer deletion',          'Violates a deletion policy',                   85, 98,  2),
 ('devops-agent',      'db.write',              'prod/orders',                    'BLOCK',    'Block production database writes',      'Direct writes to production are not allowed',  78, 94,  1),
 ('support-agent',     'email.send_external',   'attachment:customer-export.zip', 'BLOCK',    'Block external email with attachments', 'External send with attachment is blocked',    70, 90,  1),
 ('sales-agent',       'secrets.read',          'vault/prod/api-keys',            'BLOCK',    'Block secrets access outside devops',   'Secret access outside the devops scope',       80, 96,  1),
 ('finance-agent',     'files.export',          'finance/bank-accounts.csv',      'BLOCK',    null,                                    'No matching policy, default effect applied',   60, 80,  1),
 ('hr-agent',          'email.send_external',   'attachment:employee-list.xlsx',  'BLOCK',    'Block external email with attachments', 'External send with attachment is blocked',    72, 92,  1);

create temp table _catw as
select c.*, row_number() over () as idx
from _cat c cross join lateral generate_series(1, c.w);

-- ---------- kararlar ----------
create temp table _dec as
with s as (
  select g,
         1 + floor(random() * (select count(*) from _catw))::int as idx,
         date_trunc('day', now()) - floor(30 * power(random(), 1.5))::int * interval '1 day'
           + (case when random() < 0.85 then 8 + floor(random()*10) else floor(random()*24) end) * interval '1 hour'
           + random() * interval '59 minutes' as t0
  from generate_series(1, 2400) g
), s2 as (
  select g, idx,
         least(case when extract(isodow from t0) >= 6 and random() < 0.7 then t0 - interval '2 days' else t0 end,
               now() - random() * interval '30 minutes') as ts
  from s
)
select gen_random_uuid() as id, a.id as agent_id, w.agent, w.action,
       replace(w.resource, '#', (1000 + floor(random()*8999))::int::text) as resource,
       w.effect, w.reason, p.id as policy_id,
       (w.lo + floor(random() * (w.hi - w.lo + 1)))::int as risk,
       'tr_' || substr(md5(random()::text || s2.g::text), 1, 14) as trace_id,
       s2.ts as ts
from s2
join _catw w on w.idx = s2.idx
left join public.agents   a on a.workspace_id = (select ws from _ctx) and a.name = w.agent
left join public.policies p on p.workspace_id = (select ws from _ctx) and p.name = w.policy;

-- ana sayfadaki ornek kartla ayni, en yeni kararlar
insert into _dec
select gen_random_uuid(), a.id, h.agent, h.action, h.resource, h.effect, h.reason, p.id, h.risk,
       'tr_' || substr(md5(random()::text || h.action), 1, 14), now() - h.ago
from (values
  ('support-agent',      'crm.read_ticket',       'ticket/48213',           'ALLOW',    'Read access within policy',                   'Allow CRM read access',            8,  interval '2 minutes'),
  ('hr-agent',           'files.export',          'hr/salary.csv',          'ESCALATE', 'Needs a person to approve',                   'Escalate sensitive file exports', 71,  interval '6 minutes'),
  ('billing-agent',      'customers.delete_bulk', 'customers/*',            'BLOCK',    'Violates a deletion policy',                  'Block bulk customer deletion',    96,  interval '9 minutes'),
  ('billing-agent',      'payments.refund',       'high-value/7841',        'ESCALATE', 'Refund exceeds the automatic limit',          'Escalate refunds above limit',    63,  interval '18 minutes'),
  ('devops-agent',       'infra.apply',           'production/eu-central',  'ESCALATE', 'Production change requires approval',        'Escalate infrastructure changes', 74,  interval '34 minutes'),
  ('procurement-agent',  'vendors.update_bank',   'vendor/2290',            'ESCALATE', 'Bank detail change requires approval',        'Escalate vendor payment changes', 79,  interval '52 minutes'),
  ('legal-review-agent', 'contracts.sign',        'contract/1182',          'ESCALATE', 'Signature requires a person',                 'Escalate contract signing',       68,  interval '75 minutes')
) as h(agent, action, resource, effect, reason, policy, risk, ago)
left join public.agents   a on a.workspace_id = (select ws from _ctx) and a.name = h.agent
left join public.policies p on p.workspace_id = (select ws from _ctx) and p.name = h.policy;

insert into public.decisions (id, workspace_id, agent_id, agent_name, action, resource, effect, reason, policy_id, risk_score, trace_id, input, created_at)
select d.id, (select ws from _ctx), d.agent_id, d.agent, d.action, d.resource, d.effect, d.reason, d.policy_id, d.risk, d.trace_id,
       jsonb_build_object('seed','aegisora-demo','tool',d.action,'resource',d.resource,'agent',d.agent),
       d.ts
from _dec d;

-- ---------- onaylar ----------
insert into public.approvals (workspace_id, decision_id, agent_id, agent_name, action, resource, status, note, requested_at, expires_at, resolved_by, resolved_at, created_at)
select (select ws from _ctx), d.id, d.agent_id, d.agent_name, d.action, d.resource, x.st,
       case x.st
         when 'approved' then (array['Approved: matches scheduled workflow','Approved after manager review','Approved with finance sign-off','Approved: low-risk exception'])[1 + floor(random()*4)::int]
         when 'rejected' then (array['Rejected: outside business need','Rejected: requester not verified','Rejected: needs a ticket reference'])[1 + floor(random()*3)::int]
         when 'expired'  then 'No response before expiry'
         else null end,
       d.created_at,
       case when x.st = 'pending' then now() + (2 + random()*18) * interval '1 hour' else d.created_at + interval '24 hours' end,
       case when x.st in ('approved','rejected') then (select uid from _ctx) end,
       case when x.st in ('approved','rejected') then least(d.created_at + (2 + random()*88) * interval '1 minute', now()) end,
       d.created_at
from public.decisions d
cross join lateral (
  select case when d.created_at > now() - interval '12 hours' then 'pending'
              when r < 0.68 then 'approved'
              when r < 0.88 then 'rejected'
              else 'expired' end as st
  from (select random() as r) q
) x
where d.workspace_id = (select ws from _ctx) and d.effect = 'ESCALATE';

-- ---------- incident'ler ----------
insert into public.incidents (workspace_id, decision_id, severity, title, status, resolved_at, created_at)
select (select ws from _ctx), d.id,
       case when d.risk_score >= 92 then 'critical' when d.risk_score >= 82 then 'high' when d.risk_score >= 70 then 'medium' else 'low' end,
       'Blocked ' || d.action || ' by ' || d.agent_name,
       case when d.created_at > now() - interval '4 days' then 'open' else 'resolved' end,
       case when d.created_at > now() - interval '4 days' then null else d.created_at + (1 + random()*20) * interval '1 hour' end,
       d.created_at
from (
  select * from public.decisions
  where workspace_id = (select ws from _ctx) and effect = 'BLOCK' and risk_score >= 60
  order by (created_at > now() - interval '15 minutes') desc, random()
  limit 14
) d;

-- ---------- evidence (hash zinciri tetikleyiciden gelir) ----------
insert into public.evidence (workspace_id, decision_id, trace_id, payload, created_at)
select (select ws from _ctx), d.id, d.trace_id,
       jsonb_build_object('decision_id', d.id, 'agent', d.agent_name, 'action', d.action, 'resource', d.resource,
                          'effect', d.effect, 'risk_score', d.risk_score, 'reason', d.reason, 'policy_id', d.policy_id, 'seed', 'aegisora-demo'),
       d.created_at
from public.decisions d
where d.workspace_id = (select ws from _ctx)
order by d.created_at, d.id;

-- ---------- trace'ler ----------
insert into public.traces (workspace_id, agent_id, agent_name, trace_id, name, decision_id, status, duration_ms, spans, created_at)
select (select ws from _ctx), x.agent_id, x.agent_name, x.trace_id, x.action || ' run', x.id,
       case when x.effect = 'BLOCK' then 'error' else 'ok' end,
       x.dur,
       jsonb_build_array(
         jsonb_build_object('name','agent.plan',       'start_ms', 0,               'duration_ms', x.dur/10,              'status','ok'),
         jsonb_build_object('name','policy.evaluate',  'start_ms', x.dur/10,        'duration_ms', 18,                    'status','ok'),
         jsonb_build_object('name', case x.effect when 'ESCALATE' then 'approval.wait' when 'BLOCK' then 'action.blocked' else 'tool.call' end,
                            'start_ms', x.dur/10 + 18, 'duration_ms', x.dur - x.dur/10 - 18,
                            'status', case when x.effect = 'BLOCK' then 'error' else 'ok' end)
       ),
       x.created_at
from (
  select d.*, 200 + floor(random()*1800)::int as dur
  from public.decisions d
  where d.workspace_id = (select ws from _ctx)
  order by d.created_at desc
  limit 500
) x;

-- ---------- audit log (kayitlardan turetilir) ----------
insert into public.audit_events (workspace_id, actor, action, target_type, target_id, meta, created_at)
select (select ws from _ctx), (select uid from _ctx)::text, 'agents.insert', 'agents', id::text, '{}'::jsonb, created_at
  from public.agents where workspace_id = (select ws from _ctx)
union all
select (select ws from _ctx), (select uid from _ctx)::text, 'policies.insert', 'policies', id::text, '{}'::jsonb, created_at
  from public.policies where workspace_id = (select ws from _ctx)
union all
select (select ws from _ctx), (select uid from _ctx)::text, 'webhooks.insert', 'webhooks', id::text, '{}'::jsonb, created_at
  from public.webhooks where workspace_id = (select ws from _ctx)
union all
select (select ws from _ctx), (select uid from _ctx)::text, 'approvals.update', 'approvals', id::text, jsonb_build_object('status', status), resolved_at
  from public.approvals where workspace_id = (select ws from _ctx) and status in ('approved','rejected')
union all
select (select ws from _ctx), (select uid from _ctx)::text, 'incidents.update', 'incidents', id::text, jsonb_build_object('status', status), resolved_at
  from public.incidents where workspace_id = (select ws from _ctx) and status = 'resolved';

-- ---------- tetikleyicileri geri ac ----------
alter table public.agents enable trigger user;
alter table public.policies enable trigger user;
alter table public.webhooks enable trigger user;
alter table public.approvals enable trigger user;
alter table public.incidents enable trigger user;

commit;

-- ---------- sonuc ----------
select 'agents' as tablo, count(*) as adet from public.agents where workspace_id = (select ws from _ctx)
union all select 'policies',   count(*) from public.policies   where workspace_id = (select ws from _ctx)
union all select 'decisions',  count(*) from public.decisions  where workspace_id = (select ws from _ctx)
union all select '  ALLOW',    count(*) from public.decisions  where workspace_id = (select ws from _ctx) and effect = 'ALLOW'
union all select '  ESCALATE', count(*) from public.decisions  where workspace_id = (select ws from _ctx) and effect = 'ESCALATE'
union all select '  BLOCK',    count(*) from public.decisions  where workspace_id = (select ws from _ctx) and effect = 'BLOCK'
union all select 'approvals pending', count(*) from public.approvals where workspace_id = (select ws from _ctx) and status = 'pending'
union all select 'incidents',  count(*) from public.incidents  where workspace_id = (select ws from _ctx)
union all select 'traces',     count(*) from public.traces     where workspace_id = (select ws from _ctx)
union all select 'evidence',   count(*) from public.evidence   where workspace_id = (select ws from _ctx)
union all select 'audit_events', count(*) from public.audit_events where workspace_id = (select ws from _ctx)
union all select 'yedek sema: ' || schema_name, 0 from information_schema.schemata where schema_name like 'aeg_backup_%';