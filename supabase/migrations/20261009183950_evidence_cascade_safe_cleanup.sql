-- Evidence stays append-only for direct UPDATE/DELETE.
-- A nested FK-cascade delete is allowed so workspace cleanup can finish.
CREATE OR REPLACE FUNCTION public.evidence_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'DELETE' AND pg_trigger_depth() > 1 THEN
    RETURN OLD;
  END IF;

  RAISE EXCEPTION 'evidence is append-only';
END;
$function$;