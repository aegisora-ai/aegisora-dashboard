create or replace function public.create_workspace(p_name text)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'auth'
as $function$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_slug text;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'workspace name must be 2-80 characters';
  end if;

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := btrim(v_slug, '-');
  if v_slug = '' then v_slug := 'workspace'; end if;
  v_slug := v_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);

  insert into public.workspaces (name, slug, created_by)
  values (v_name, v_slug, v_uid)
  returning id into v_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (v_id, v_uid, 'OWNER', 'active')
  on conflict do nothing;

  return v_id;
end;
$function$;

revoke execute on function public.create_workspace(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;

drop function if exists public.create_workspace(text, text);