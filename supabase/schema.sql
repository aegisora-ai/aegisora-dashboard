-- ============================================================
-- AEGISORA: profiles, workspaces, workspace_members
-- Supabase Dashboard -> SQL Editor -> New query -> yapistir -> Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- yeni auth.users kaydi olustuğunda otomatik profile satiri ac
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- workspaces ----------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text not null default 'eu-central-1',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- ---------- workspace_members ----------
create type public.workspace_role as enum ('owner', 'admin', 'developer', 'analyst', 'auditor', 'viewer');
create type public.member_status as enum ('active', 'invited', 'suspended');

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member'::public.workspace_role,
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- kullanici kendi uyeliklerini gorebilsin
create policy "members_select_own" on public.workspace_members
  for select using (auth.uid() = user_id);

-- workspace'i, o workspace'in aktif uyesi olanlar gorebilsin
create policy "workspaces_select_member" on public.workspaces
  for select using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = workspaces.id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

-- ---------- atomik workspace olusturma (owner uyeligi ile birlikte) ----------
create or replace function public.create_workspace(workspace_name text, workspace_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, auth.uid())
  returning id into new_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_id, auth.uid(), 'owner', 'active');

  return new_id;
end;
$$;