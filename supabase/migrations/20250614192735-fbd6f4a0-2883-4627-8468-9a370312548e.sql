
-- Phase 1: Fix infinite recursion in RLS policies (safe migration)

-- First, create the new security definer function that safely checks user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Drop ALL existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view their profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can insert new profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
DROP POLICY IF EXISTS "Teachers can select all profiles" ON public.users;
DROP POLICY IF EXISTS "Teachers can insert all profiles" ON public.users;
DROP POLICY IF EXISTS "Teachers can update all profiles" ON public.users;

-- Drop all other dependent policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can manage user badges" ON public.user_badges;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage points log" ON public.points_log;
DROP POLICY IF EXISTS "Admins can view all honesty logs" ON public.honesty_log;
DROP POLICY IF EXISTS "Admins can manage daily inventory" ON public.daily_inventory;
DROP POLICY IF EXISTS "Admins can manage college settings" ON public.college_settings;
DROP POLICY IF EXISTS "Admins can manage integration settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Admins can manage points config" ON public.points_config;

-- Drop the old has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role);

-- Create the new safe has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = _role
  )
$$;

-- Create fresh users table policies with safe approach
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles" 
ON public.users 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'developer'));

CREATE POLICY "Admins update all profiles" 
ON public.users 
FOR UPDATE 
USING (public.get_current_user_role() IN ('admin', 'developer'));

CREATE POLICY "Admins insert profiles" 
ON public.users 
FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'developer'));

CREATE POLICY "Admins delete profiles" 
ON public.users 
FOR DELETE 
USING (public.get_current_user_role() IN ('admin', 'developer'));

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
