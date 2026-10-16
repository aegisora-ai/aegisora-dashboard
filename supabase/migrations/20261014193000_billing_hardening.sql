-- Billing hardening: admin-only access to payment data, no client writes.
begin;

revoke all on function public.billing_workspace_member(uuid) from public, anon;
grant execute on function public.billing_workspace_member(uuid) to authenticated;

revoke insert, update, delete, truncate on
  public.billing_customers, public.billing_subscriptions, public.billing_payments,
  public.billing_events, public.workspace_entitlements
from anon, authenticated;
revoke select on public.billing_events from anon, authenticated;

-- Customer, subscription and payment data: owners and admins only.
drop policy if exists billing_customers_member_select on public.billing_customers;
create policy billing_customers_admin_select on public.billing_customers
  for select to authenticated using (public.can_manage_workspace(workspace_id));

drop policy if exists billing_subscriptions_member_select on public.billing_subscriptions;
create policy billing_subscriptions_admin_select on public.billing_subscriptions
  for select to authenticated using (public.can_manage_workspace(workspace_id));

drop policy if exists billing_payments_member_select on public.billing_payments;
create policy billing_payments_admin_select on public.billing_payments
  for select to authenticated using (public.can_manage_workspace(workspace_id));

-- Plan status stays readable by members (the dashboard needs it).

commit;
-- Rollback: recreate the *_member_select policies from 20261004010000.