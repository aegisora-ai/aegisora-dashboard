-- Pilot applications submitted from /pilot. Run once in the Supabase SQL editor.
create table if not exists public.pilot_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) <= 120),
  work_email text not null check (char_length(work_email) <= 200),
  company text not null check (char_length(company) <= 160),
  role_title text check (char_length(role_title) <= 120),
  company_size text check (char_length(company_size) <= 20),
  environment text check (char_length(environment) <= 2000),
  use_case text not null check (char_length(use_case) <= 3000),
  locale text check (char_length(locale) <= 10),
  status text not null default 'new'
);

-- RLS on, no policies: only the server (service role) can read or write.
alter table public.pilot_requests enable row level security;
revoke all on public.pilot_requests from anon, authenticated;