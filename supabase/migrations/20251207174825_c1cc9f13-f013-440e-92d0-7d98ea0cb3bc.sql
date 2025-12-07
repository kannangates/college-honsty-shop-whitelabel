-- Update the validate_user_profile_update function to allow admins to update role
CREATE OR REPLACE FUNCTION public.validate_user_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Users can only update: mobile_number, email
    -- These fields will keep their NEW values
    
    RETURN NEW;
  END IF;
  
  -- If not admin and not own profile, reject
  RAISE EXCEPTION 'Unauthorized update attempt';
END;
$function$;