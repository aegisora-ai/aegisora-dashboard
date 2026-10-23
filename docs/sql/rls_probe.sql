create or replace function pg_temp.rls_probe()
returns table(chk text, result text)
language plpgsql
as $f$
declare
  t text; n bigint; tot bigint; acc text; denied int;
  totals jsonb := '{}'::jsonb;
  ctxs jsonb := '[]'::jsonb;
  ctx record;
  tests text[];
  i int; msg text; r text;
  uid uuid; ws uuid; w uuid;
  outsider uuid := gen_random_uuid();
  cname text; pgrole text; tsub text; tws uuid;
  vt bigint; vb bigint;
begin
  for t in select pc.relname::text from pg_class pc join pg_namespace ns on ns.oid = pc.relnamespace
           where ns.nspname = 'public' and pc.relkind = 'r' order by 1 loop
    execute format('select count(*) from public.%I', t) into tot;
    totals := totals || jsonb_build_object(t, tot);
  end loop;

  select m.workspace_id into w from public.workspace_members m limit 1;
  if w is null then
    chk := 'setup'; result := 'workspace_members bos, test yapilamaz'; return next; return;
  end if;

  ctxs := ctxs || jsonb_build_array(jsonb_build_object('name','outsider','pgrole','authenticated','sub',outsider::text,'ws',w::text));
  ctxs := ctxs || jsonb_build_array(jsonb_build_object('name','anon','pgrole','anon','sub','','ws',w::text));
  foreach r in array array['OWNER','ADMIN','OPERATOR','VIEWER'] loop
    uid := null; ws := null;
    select m.user_id, m.workspace_id into uid, ws from public.workspace_members m
      where m.role::text = r and coalesce(m.status::text,'active') = 'active' limit 1;
    if uid is not null then
      ctxs := ctxs || jsonb_build_array(jsonb_build_object('name',r,'pgrole','authenticated','sub',uid::text,'ws',ws::text));
    end if;
  end loop;

  for ctx in select value from jsonb_array_elements(ctxs) loop
    cname := ctx.value ->> 'name';
    pgrole := ctx.value ->> 'pgrole';
    tsub := ctx.value ->> 'sub';
    tws := (ctx.value ->> 'ws')::uuid;

    execute 'reset role';
    perform set_config('request.jwt.claims', json_build_object('sub', tsub, 'role', pgrole, 'aal', 'aal2')::text, true);
    perform set_config('request.jwt.claim.sub', tsub, true);
    execute format('set local role %I', pgrole);

    acc := ''; denied := 0;
    for t in select pc.relname::text from pg_class pc join pg_namespace ns on ns.oid = pc.relnamespace
             where ns.nspname = 'public' and pc.relkind = 'r' order by 1 loop
      begin
        execute format('select count(*) from public.%I', t) into n;
        if n > 0 then acc := acc || t || ' ' || n || '/' || (totals ->> t) || ', '; end if;
      exception when others then
        denied := denied + 1;
      end;
    end loop;
    chk := cname || ':read';
    result := 'denied_tables=' || denied || ' visible=' || coalesce(nullif(acc, ''), 'none');
    return next;

    tests := array[
      'update_workspace', format('update public.workspaces set name = name where id = %L', tws),
      'insert_member_viewer', format('insert into public.workspace_members (workspace_id,user_id,role,status) values (%L, gen_random_uuid(), ''VIEWER'', ''active'')', tws),
      'insert_member_owner', format('insert into public.workspace_members (workspace_id,user_id,role,status) values (%L, gen_random_uuid(), ''OWNER'', ''active'')', tws),
      'insert_invite_owner', format('insert into public.workspace_invitations (workspace_id,email,role,status,invited_by) values (%L, ''probe@example.invalid'', ''OWNER'', ''pending'', %L)', tws, nullif(tsub, '')),
      'create_api_key', format('select public.create_api_key(%L, ''probe'')', tws),
      'verify_evidence', format('select * from public.verify_evidence_chain(%L)', tws),
      'read_key_hash', 'select key_hash from public.service_account_keys limit 1'
    ];
    if cname in ('ADMIN','OPERATOR','VIEWER') then
      tests := tests || array['self_escalate_owner',
        format('update public.workspace_members set role = ''OWNER'' where workspace_id = %L and user_id = %L', tws, tsub)];
    end if;
    if cname = 'OWNER' then
      tests := tests || array[
        'tamper_evidence', format('update public.evidence set payload = payload where workspace_id = %L', tws),
        'tamper_decisions', format('update public.decisions set workspace_id = workspace_id where workspace_id = %L', tws),
        'delete_audit_events', format('delete from public.audit_events where workspace_id = %L', tws)];
    end if;

    for i in 1 .. array_length(tests, 1) by 2 loop
      begin
        execute tests[i+1];
        get diagnostics n = row_count;
        msg := 'ALLOWED rows=' || n;
        raise exception 'probe_rollback';
      exception when others then
        if sqlerrm <> 'probe_rollback' then
          msg := 'blocked ' || sqlstate || ' ' || left(sqlerrm, 80);
        end if;
      end;
      chk := cname || ':' || tests[i];
      result := msg;
      return next;
    end loop;

    if cname = 'OWNER' then
      begin
        execute 'select total, broken from public.verify_evidence_chain($1)' into vt, vb using tws;
        chk := 'OWNER:verify_evidence_chain'; result := 'total=' || vt || ' broken=' || vb;
      exception when others then
        chk := 'OWNER:verify_evidence_chain'; result := 'error ' || sqlerrm;
      end;
      return next;
    end if;
  end loop;

  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);

  for ws in select distinct m.workspace_id from public.workspace_members m loop
    begin
      execute 'select total, broken from public.evidence_verify_core($1)' into vt, vb using ws;
      chk := 'core_verify:' || ws; result := 'total=' || vt || ' broken=' || vb;
    exception when others then
      chk := 'core_verify:' || ws; result := 'error ' || sqlerrm;
    end;
    return next;
  end loop;

  select string_agg(coalesce(q.hash_version::text, 'null') || ':' || q.cnt, ', ') into msg
  from (select e.hash_version, count(*) as cnt from public.evidence e group by 1) q;
  chk := 'evidence_hash_versions'; result := coalesce(msg, 'bos');
  return next;
end
$f$;

select * from pg_temp.rls_probe();