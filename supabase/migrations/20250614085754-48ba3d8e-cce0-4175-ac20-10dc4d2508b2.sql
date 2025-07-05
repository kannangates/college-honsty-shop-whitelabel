
-- Fix the search_path security warnings for all functions
-- This prevents potential security issues by setting a fixed search path

-- Update authenticate_by_student_id function
CREATE OR REPLACE FUNCTION public.authenticate_by_student_id(_student_id text, _password text)
 RETURNS TABLE(user_id uuid, email text, user_data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  user_email TEXT;
  auth_result RECORD;
BEGIN
  -- First, find the email associated with the student_id
  SELECT u.email INTO user_email
  FROM public.users u
  WHERE u.student_id = _student_id;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Student ID not found';
  END IF;
  
  -- Return the user data for authentication
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    jsonb_build_object(
      'id', u.id,
      'student_id', u.student_id,
      'name', u.name,
      'email', u.email,
      'role', u.role,
      'department', u.department,
      'points', u.points,
      'mobile_number', u.mobile_number,
      'created_at', u.created_at,
      'updated_at', u.updated_at
    ) as user_data
  FROM public.users u
  WHERE u.student_id = _student_id;
END;
$function$;

-- Update update_top_students_rankings function
CREATE OR REPLACE FUNCTION public.update_top_students_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
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

-- Update update_top_departments_rankings function
CREATE OR REPLACE FUNCTION public.update_top_departments_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
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

-- Update trigger_rankings_update function
CREATE OR REPLACE FUNCTION public.trigger_rankings_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only update if points actually changed
  IF (TG_OP = 'UPDATE' AND OLD.points IS DISTINCT FROM NEW.points) OR TG_OP = 'INSERT' THEN
    PERFORM refresh_rankings();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = _role
  )
$function$;

-- Create refresh_rankings function to refresh both rankings
CREATE OR REPLACE FUNCTION public.refresh_rankings()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Call both ranking update functions
  PERFORM public.update_top_students_rankings();
  PERFORM public.update_top_departments_rankings();
END;
$function$;

-- Create function to get today's dashboard stats for admin/developer views
CREATE OR REPLACE FUNCTION public.get_todays_dashboard_stats()
 RETURNS TABLE(
   todays_orders bigint,
   todays_paid_orders bigint,
   total_revenue numeric,
   todays_unique_customers bigint,
   todays_sold_products jsonb
 )
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  today_start timestamp with time zone;
BEGIN
  today_start := date_trunc('day', now());
  
  RETURN QUERY
  SELECT
    -- Today's total orders
    (SELECT COUNT(*) FROM public.orders WHERE created_at >= today_start),
    
    -- Today's paid orders
    (SELECT COUNT(*) FROM public.orders WHERE created_at >= today_start AND payment_status = 'paid'),
    
    -- Total revenue today
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE created_at >= today_start AND payment_status = 'paid'),
    
    -- Today's unique customers
    (SELECT COUNT(DISTINCT user_id) FROM public.orders WHERE created_at >= today_start),
    
    -- Today's sold products with counts
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'product_name', p.name,
        'total_quantity', SUM(oi.quantity),
        'paid_quantity', SUM(CASE WHEN o.payment_status = 'paid' THEN oi.quantity ELSE 0 END),
        'unpaid_quantity', SUM(CASE WHEN o.payment_status = 'unpaid' THEN oi.quantity ELSE 0 END),
        'paid_amount', SUM(CASE WHEN o.payment_status = 'paid' THEN oi.total_price ELSE 0 END),
        'unpaid_amount', SUM(CASE WHEN o.payment_status = 'unpaid' THEN oi.total_price ELSE 0 END)
      )
    ), '[]'::jsonb)
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    JOIN public.products p ON oi.product_id = p.id
    WHERE o.created_at >= today_start
    GROUP BY p.id, p.name
    ORDER BY SUM(oi.quantity) DESC);
END;
$function$;
