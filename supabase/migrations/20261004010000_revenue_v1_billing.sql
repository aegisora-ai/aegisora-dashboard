create extension if not exists pgcrypto;

create table if not exists public.billing_customers (
  workspace_id uuid primary key
    references public.workspaces(id)
    on delete cascade,

  stripe_customer_id text not null unique,

  email text,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

create table if not exists public.billing_subscriptions (
  id uuid primary key
    default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id)
    on delete cascade,

  stripe_subscription_id text not null unique,

  stripe_customer_id text,

  price_id text,

  plan_key text not null,

  status text not null,

  current_period_start timestamptz,

  current_period_end timestamptz,

  cancel_at_period_end boolean not null default false,

  livemode boolean not null default false,

  last_event_type text,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

create index if not exists idx_billing_subscriptions_workspace
  on public.billing_subscriptions(workspace_id);

create index if not exists idx_billing_subscriptions_customer
  on public.billing_subscriptions(stripe_customer_id);

create table if not exists public.billing_payments (
  id uuid primary key
    default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id)
    on delete cascade,

  stripe_checkout_session_id text not null unique,

  stripe_payment_intent_id text unique,

  stripe_customer_id text,

  plan_key text not null,

  status text not null,

  amount_total integer,

  currency text,

  paid_at timestamptz,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now())
);

create index if not exists idx_billing_payments_workspace
  on public.billing_payments(workspace_id);

create table if not exists public.billing_events (
  stripe_event_id text primary key,

  event_type text not null,

  livemode boolean not null default false,

  payload jsonb not null,

  received_at timestamptz not null
    default timezone('utc', now()),

  processed_at timestamptz
);

create index if not exists idx_billing_events_type
  on public.billing_events(event_type);

create table if not exists public.workspace_entitlements (
  workspace_id uuid primary key
    references public.workspaces(id)
    on delete cascade,

  plan_key text not null,

  status text not null,

  billing_mode text not null,

  stripe_customer_id text,

  stripe_subscription_id text,

  source_payment_id uuid
    references public.billing_payments(id)
    on delete set null,

  current_period_end timestamptz,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint workspace_entitlements_plan_check
    check (
      plan_key in (
        'founder_pilot',
        'pilot',
        'team',
        'business',
        'enterprise'
      )
    ),

  constraint workspace_entitlements_status_check
    check (
      status in (
        'active',
        'past_due',
        'inactive'
      )
    ),

  constraint workspace_entitlements_mode_check
    check (
      billing_mode in (
        'one_time_pilot',
        'subscription'
      )
    )
);

create or replace function public.billing_workspace_member(
  target_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

revoke all
  on function public.billing_workspace_member(uuid)
  from public;

grant execute
  on function public.billing_workspace_member(uuid)
  to authenticated;

alter table public.billing_customers
  enable row level security;

alter table public.billing_subscriptions
  enable row level security;

alter table public.billing_payments
  enable row level security;

alter table public.billing_events
  enable row level security;

alter table public.workspace_entitlements
  enable row level security;

drop policy if exists billing_customers_member_select
  on public.billing_customers;

create policy billing_customers_member_select
  on public.billing_customers
  for select
  to authenticated
  using (
    public.billing_workspace_member(workspace_id)
  );

drop policy if exists billing_subscriptions_member_select
  on public.billing_subscriptions;

create policy billing_subscriptions_member_select
  on public.billing_subscriptions
  for select
  to authenticated
  using (
    public.billing_workspace_member(workspace_id)
  );

drop policy if exists billing_payments_member_select
  on public.billing_payments;

create policy billing_payments_member_select
  on public.billing_payments
  for select
  to authenticated
  using (
    public.billing_workspace_member(workspace_id)
  );

drop policy if exists workspace_entitlements_member_select
  on public.workspace_entitlements;

create policy workspace_entitlements_member_select
  on public.workspace_entitlements
  for select
  to authenticated
  using (
    public.billing_workspace_member(workspace_id)
  );

revoke all
  on public.billing_customers
  from anon;

revoke all
  on public.billing_subscriptions
  from anon;

revoke all
  on public.billing_payments
  from anon;

revoke all
  on public.billing_events
  from anon;

revoke all
  on public.workspace_entitlements
  from anon;

create index if not exists idx_workspace_entitlements_status
  on public.workspace_entitlements(status);

create index if not exists idx_workspace_entitlements_plan
  on public.workspace_entitlements(plan_key);