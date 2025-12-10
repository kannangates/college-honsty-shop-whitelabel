-- Fix 1: Move extensions from public schema to extensions schema
-- First, create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Fix 2: Update functions missing search_path
-- Update generate_friendly_order_id
CREATE OR REPLACE FUNCTION public.generate_friendly_order_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    new_id TEXT;
    prefix TEXT := 'ORD';
    counter BIGINT;
BEGIN
    -- Get next value from sequence (atomic operation)
    counter := nextval('orders_friendly_id_seq');
    
    -- Format as ORD0001, ORD0002, etc.
    new_id := prefix || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_id;
END;
$function$;

-- Update set_friendly_order_id
CREATE OR REPLACE FUNCTION public.set_friendly_order_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    IF NEW.friendly_id IS NULL THEN
        NEW.friendly_id := generate_friendly_order_id();
    END IF;
    RETURN NEW;
END;
$function$;

-- Update trigger_rankings_update
CREATE OR REPLACE FUNCTION public.trigger_rankings_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Only update if points actually changed
  IF (TG_OP = 'UPDATE' AND OLD.points IS DISTINCT FROM NEW.points) OR TG_OP = 'INSERT' THEN
    PERFORM refresh_rankings();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update refresh_rankings
CREATE OR REPLACE FUNCTION public.refresh_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Call both ranking update functions
  PERFORM public.update_top_students_rankings();
  PERFORM public.update_top_departments_rankings();
END;
$function$;

-- Update update_top_students_rankings
CREATE OR REPLACE FUNCTION public.update_top_students_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Archive existing active rankings
  UPDATE public.top_students 
  SET is_archived = TRUE, updated_at = NOW()
  WHERE is_archived = FALSE;
  
  -- Insert new top 10 students
  INSERT INTO public.top_students (student_id, name, department, points, rank, is_archived)
  SELECT 
    u.student_id,
    u.name,
    u.department,
    u.points,
    ROW_NUMBER() OVER (ORDER BY u.points DESC) as rank,
    FALSE
  FROM public.users u
  WHERE u.role = 'student' AND u.status = 'active' AND u.points > 0
  ORDER BY u.points DESC
  LIMIT 10;
END;
$function$;

-- Update update_top_departments_rankings
CREATE OR REPLACE FUNCTION public.update_top_departments_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  -- Archive existing active rankings
  UPDATE public.top_departments 
  SET is_archived = TRUE, updated_at = NOW()
  WHERE is_archived = FALSE;
  
  -- Insert new top 3 departments
  INSERT INTO public.top_departments (department, points, rank, is_archived)
  SELECT 
    u.department,
    SUM(u.points) as total_points,
    ROW_NUMBER() OVER (ORDER BY SUM(u.points) DESC) as rank,
    FALSE
  FROM public.users u
  WHERE u.role = 'student' AND u.status = 'active' AND u.department IS NOT NULL AND u.points > 0
  GROUP BY u.department
  ORDER BY total_points DESC
  LIMIT 3;
END;
$function$;