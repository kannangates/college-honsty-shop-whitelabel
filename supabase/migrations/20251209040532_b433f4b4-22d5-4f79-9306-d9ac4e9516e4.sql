-- Step 1: Create the app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'teacher', 'developer');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable Row-Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 5: Create function to get current user's app role
CREATE OR REPLACE FUNCTION public.get_current_app_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Step 6: RLS policies for user_roles table
-- Only admins can view all roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin') OR public.has_app_role(auth.uid(), 'developer'));

-- Only admins can insert roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_app_role(auth.uid(), 'admin') OR public.has_app_role(auth.uid(), 'developer'));

-- Only admins can update roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin') OR public.has_app_role(auth.uid(), 'developer'));

-- Only admins can delete roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_app_role(auth.uid(), 'admin') OR public.has_app_role(auth.uid(), 'developer'));

-- Users can view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Step 7: Migrate existing roles from users table to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role 
FROM public.users 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 8: Create trigger to automatically create user_role when new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.role::text::app_role, 'student'::app_role))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_add_role
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Step 9: Create trigger to sync role changes from users table to user_roles
CREATE OR REPLACE FUNCTION public.sync_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old role if it exists
  DELETE FROM public.user_roles WHERE user_id = NEW.id;
  -- Insert new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::text::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_role_updated
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.sync_user_role_change();