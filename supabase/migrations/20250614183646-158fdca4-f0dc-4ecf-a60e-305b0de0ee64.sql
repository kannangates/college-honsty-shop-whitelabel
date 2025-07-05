
-- USERS table: restrict select/update to own row, admins can read/update all
CREATE POLICY "Users can view their profile" ON public.users FOR SELECT USING (auth.uid() = id OR (EXISTS (SELECT 1 FROM public.users u2 WHERE u2.id = auth.uid() AND (u2.role = 'admin' OR u2.role = 'developer'))));
CREATE POLICY "Users can update their profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Optionally: allow only admins/developers to delete/insert/update others

-- USER_BADGES: user can see only own
CREATE POLICY "User can view their badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert their badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update their badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete their badges" ON public.user_badges FOR DELETE USING (auth.uid() = user_id);

-- BADGE_PROGRESS: user-specific badge progress
CREATE POLICY "User can view their badge progress" ON public.badge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can update their badge progress" ON public.badge_progress FOR UPDATE USING (auth.uid() = user_id);

-- POINTS_LOG: user can view own log only
CREATE POLICY "User can view their points log" ON public.points_log FOR SELECT USING (auth.uid() = user_id);

-- ORDERS: user can view their own orders
CREATE POLICY "User can view their orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert their orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- HONESTY_LOG: user can view their own logs
CREATE POLICY "User can view their honesty log" ON public.honesty_log FOR SELECT USING (auth.uid() = user_id);

-- NOTIFICATION_READS: user can see only their own
CREATE POLICY "User can view own notification_reads" ON public.notification_reads FOR SELECT USING (auth.uid() = user_id);

-- BADGES/TOP tables: generally readable by all, no RLS required (read-only reference)

-- All policies assume RLS is enabled on each table (run: ALTER TABLE ... ENABLE ROW LEVEL SECURITY;)

-- NOTE: Remove duplicate or conflicting RLS policies before applying these on existing tables!
