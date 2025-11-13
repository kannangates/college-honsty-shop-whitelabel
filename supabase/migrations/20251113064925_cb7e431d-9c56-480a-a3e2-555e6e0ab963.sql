-- Security Fix: Restrict public access to sensitive tables
-- This migration removes public SELECT policies and replaces them with authenticated-only policies

-- Fix 1: Restrict points_config to authenticated users only
-- Prevents competitors from copying gamification strategy
DROP POLICY IF EXISTS "Anyone can view points config" ON public.points_config;

CREATE POLICY "Authenticated users can view points config"
ON public.points_config
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict badges to authenticated users only
-- Prevents reverse-engineering of achievement system
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;

CREATE POLICY "Authenticated users can view badges"
ON public.badges
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 3: Restrict college_settings to authenticated users only
-- Protects sensitive contact information from malicious actors
DROP POLICY IF EXISTS "Anyone can view college settings" ON public.college_settings;

CREATE POLICY "Authenticated users can view college settings"
ON public.college_settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 4: Restrict top_students leaderboard to authenticated users only
-- Protects student privacy and ensures proper consent
DROP POLICY IF EXISTS "Allow public read access to active top students" ON public.top_students;

CREATE POLICY "Authenticated users can view active top students"
ON public.top_students
FOR SELECT
TO authenticated
USING (is_archived = false AND auth.uid() IS NOT NULL);

-- Fix 5: Restrict top_departments leaderboard to authenticated users only
DROP POLICY IF EXISTS "Allow public read access to active top departments" ON public.top_departments;

CREATE POLICY "Authenticated users can view active top departments"
ON public.top_departments
FOR SELECT
TO authenticated
USING (is_archived = false AND auth.uid() IS NOT NULL);