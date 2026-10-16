-- Fix: approval_stamp() overwrote resolved_by with NULL for trusted service-role calls.
CREATE OR REPLACE FUNCTION public.approval_stamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if new.status in ('approved','rejected') and old.status = 'pending' then
    if auth.uid() is not null then
      new.resolved_by := auth.uid();
    elsif auth.role() = 'service_role' then
      new.resolved_by := new.resolved_by;
    else
      new.resolved_by := null;
    end if;
    new.resolved_at := now();
  end if;
  return new;
end $function$;