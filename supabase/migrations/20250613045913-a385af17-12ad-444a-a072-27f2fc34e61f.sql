
-- Add is_archived column to top_students table
ALTER TABLE public.top_students ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add is_archived column to top_departments table  
ALTER TABLE public.top_departments ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create updated function to append top students rankings
CREATE OR REPLACE FUNCTION update_top_students_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- Create updated function to append top departments rankings
CREATE OR REPLACE FUNCTION update_top_departments_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- Create trigger function to auto-update rankings when user points change
CREATE OR REPLACE FUNCTION trigger_rankings_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if points actually changed
  IF (TG_OP = 'UPDATE' AND OLD.points IS DISTINCT FROM NEW.points) OR TG_OP = 'INSERT' THEN
    PERFORM refresh_rankings();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to automatically update rankings when user data changes
DROP TRIGGER IF EXISTS auto_update_rankings ON public.users;
CREATE TRIGGER auto_update_rankings
  AFTER INSERT OR UPDATE OF points ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_rankings_update();
