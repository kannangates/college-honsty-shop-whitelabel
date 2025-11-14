-- ============================================
-- SECURITY FIX: Restrict RLS Policies
-- ============================================

-- 1. FIX ORDERS TABLE: Prevent users from updating payment fields
-- Drop the dangerous policy that allows users to update any order field
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create restrictive policy: Users CANNOT update orders at all
-- Only admins/system should update payment status
CREATE POLICY "Users cannot update orders after creation" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (false);
  
-- Note: Admins can still update through admin panel and edge functions
-- The system will handle payment updates via edge functions with service role

-- 2. FIX USERS TABLE: Add safe field-only update policy
-- Drop any existing unsafe update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- For the users table, we'll use a trigger-based approach to prevent field updates
-- Create a function to validate user profile updates
CREATE OR REPLACE FUNCTION validate_user_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to update anything
  IF get_current_user_role() IN ('admin', 'developer') THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, prevent changing critical fields
  IF auth.uid() = NEW.id THEN
    -- Restore protected fields to their original values
    NEW.role := OLD.role;
    NEW.points := OLD.points;
    NEW.status := OLD.status;
    NEW.student_id := OLD.student_id;
    NEW.name := OLD.name;
    NEW.department := OLD.department;
    NEW.shift := OLD.shift;
    NEW.password_changed_at := OLD.password_changed_at;
    NEW.last_signed_in_at := OLD.last_signed_in_at;
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    
    -- Users can only update: mobile_number, email
    -- These fields will keep their NEW values
    
    RETURN NEW;
  END IF;
  
  -- If not admin and not own profile, reject
  RAISE EXCEPTION 'Unauthorized update attempt';
END;
$$;

-- Create trigger for user profile validation
DROP TRIGGER IF EXISTS validate_user_update ON public.users;
CREATE TRIGGER validate_user_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_profile_update();

-- Create basic update policy for users (validation happens in trigger)
CREATE POLICY "Users can update own safe profile fields" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 3. Add comments for documentation
COMMENT ON POLICY "Users cannot update orders after creation" ON public.orders IS 
  'Security: Prevents users from manipulating payment status, amount, or transaction details. Only admins and edge functions can update orders.';

COMMENT ON POLICY "Users can update own safe profile fields" ON public.users IS 
  'Security: Users can update their profile but trigger validates only safe fields (mobile_number, email) can be changed. Critical fields are protected.';

COMMENT ON FUNCTION validate_user_profile_update() IS 
  'Security trigger: Ensures users cannot modify critical fields (role, points, status, etc). Only mobile_number and email can be updated by users.';