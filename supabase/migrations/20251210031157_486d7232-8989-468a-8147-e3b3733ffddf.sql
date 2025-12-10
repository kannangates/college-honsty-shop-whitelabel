-- ============================================
-- CRITICAL: Update all RLS policies to use has_app_role() instead of get_current_user_role()
-- This completes the secure role management migration
-- ============================================

-- 1. USERS TABLE - Update admin policies
DROP POLICY IF EXISTS "Admins view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.users;
DROP POLICY IF EXISTS "Admins insert profiles" ON public.users;

CREATE POLICY "Admins view all profiles" ON public.users
  FOR SELECT USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

CREATE POLICY "Admins update all profiles" ON public.users
  FOR UPDATE USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

CREATE POLICY "Admins delete profiles" ON public.users
  FOR DELETE USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

CREATE POLICY "Admins insert profiles" ON public.users
  FOR INSERT WITH CHECK (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 2. ADMIN_AUDIT_LOG TABLE
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.admin_audit_log;

CREATE POLICY "Admins can view all audit logs" ON public.admin_audit_log
  FOR SELECT USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 3. DAILY_STOCK_OPERATIONS TABLE
DROP POLICY IF EXISTS "Admins can manage daily stock operations" ON public.daily_stock_operations;

CREATE POLICY "Admins can manage daily stock operations" ON public.daily_stock_operations
  FOR ALL USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 4. GAMIFICATION_EVENT_LOGS TABLE
DROP POLICY IF EXISTS "Admins can view all gamification logs" ON public.gamification_event_logs;

CREATE POLICY "Admins can view all gamification logs" ON public.gamification_event_logs
  FOR SELECT USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 5. GAMIFICATION_RULES TABLE
DROP POLICY IF EXISTS "Admins can manage gamification rules" ON public.gamification_rules;

CREATE POLICY "Admins can manage gamification rules" ON public.gamification_rules
  FOR ALL USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 6. INTEGRATION_SETTINGS TABLE
DROP POLICY IF EXISTS "Admins can manage integration settings" ON public.integration_settings;

CREATE POLICY "Admins can manage integration settings" ON public.integration_settings
  FOR ALL USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 7. N8N_WEBHOOKS TABLE
DROP POLICY IF EXISTS "Admins can manage n8n webhooks" ON public.n8n_webhooks;

CREATE POLICY "Admins can manage n8n webhooks" ON public.n8n_webhooks
  FOR ALL USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );

-- 8. RULE_COOLDOWNS TABLE
DROP POLICY IF EXISTS "System can manage rule cooldowns" ON public.rule_cooldowns;

CREATE POLICY "System can manage rule cooldowns" ON public.rule_cooldowns
  FOR ALL USING (
    has_app_role(auth.uid(), 'admin') OR 
    has_app_role(auth.uid(), 'developer')
  );