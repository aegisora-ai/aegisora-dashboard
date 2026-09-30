-- 002: onboarding flag, safe role default, workspace creation at signup

alter table public.profiles add column if not exists onboarded_at timestamptz;

-- the original default 'member' is not a value of workspace_role
alter table public.workspace_members alter column role set default 'VIEWER';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  company text := nullif(btrim(new.raw_user_meta_data ->> 'company'), '');
  ws_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  if company is not null then
    insert into public.workspaces (name, slug, created_by)
    values (
      company,
      coalesce(nullif(btrim(regexp_replace(lower(company), '[^a-z0-9]+', '-', 'g'), '-'), ''), 'workspace')
        || '-' || substr(replace(new.id::text, '-', ''), 1, 6),
      new.id
    )
    returning id into ws_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (ws_id, new.id, 'OWNER');
  end if;

  return new;
end;
$$;