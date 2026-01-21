-- Fix search_path for update_user_mfa_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_mfa_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;