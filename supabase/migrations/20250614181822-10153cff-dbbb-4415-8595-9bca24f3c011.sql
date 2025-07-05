
-- Create database functions to get schema information for the developer dashboard

-- Function to get table information
CREATE OR REPLACE FUNCTION public.get_table_info()
RETURNS TABLE(
  table_name text,
  column_count bigint,
  columns jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COUNT(c.column_name) as column_count,
    jsonb_agg(
      jsonb_build_object(
        'column_name', c.column_name,
        'data_type', c.data_type,
        'is_nullable', c.is_nullable,
        'column_default', c.column_default
      ) ORDER BY c.ordinal_position
    ) as columns
  FROM information_schema.tables t
  LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
  WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
  GROUP BY t.table_name
  ORDER BY t.table_name;
END;
$function$;

-- Function to get database function information
CREATE OR REPLACE FUNCTION public.get_function_info()
RETURNS TABLE(
  function_name text,
  return_type text,
  argument_types text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.proname::text as function_name,
    pg_get_function_result(p.oid)::text as return_type,
    pg_get_function_arguments(p.oid)::text as argument_types
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
  ORDER BY p.proname;
END;
$function$;

-- Function to get RLS policy information
CREATE OR REPLACE FUNCTION public.get_policy_info()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_command text,
  policy_roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::text as table_name,
    p.polname::text as policy_name,
    p.polcmd::text as policy_command,
    p.polroles::text[] as policy_roles
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  ORDER BY c.relname, p.polname;
END;
$function$;
